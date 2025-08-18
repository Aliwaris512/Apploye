from datetime import timedelta
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timedelta, date
from sqlmodels.user_usage import User, AppUsage, AppUserLink, UsageCreate, Timesheet, Projects, Tasks
from authentication.jwt_hashing import create_access_token, verify_password, get_current_user, bearer_scheme
from sqlmodel import Session, select
from notifications.ws_router import active_connections
import redis
import json
from email.mime.text import MIMEText
import smtplib

router = APIRouter(
    tags=['Employee']
)

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

    
# Router for recieving data from the frontend and adding data to redis
@router.post('/add_activity', dependencies=[Depends(bearer_scheme)])
async def add_activity( usage: UsageCreate,session:Session = Depends(get_session),
                 current_user: User = Depends(get_current_user())) :

    add_usage = AppUsage(
        employee_id = current_user.user_id ,
        role = current_user.role,
        device_id = usage.device_id,
        app = usage.app,
        duration = usage.duration,
        timestamp = usage.timestamp,
           )

    email = current_user.username
    if add_usage.duration > 120 :
        connection = active_connections.get(email)
        if connection:
            print("Active Connection", active_connections)
            print("Target email", email) 
            await connection.send_text(f"You've been on this app for more than 2 hours its time for a break!")  
        else:
            print(f"No websocket with email {email} logged in..") 
    
    data = add_usage.model.dump() # converts add_udasage to dict
    queue_name = f"queue_usage_{add_usage.device_id}"
    r.rpush(queue_name, json.dumps(data)) # adds the value to right end of queue and converts to a json string
    # also name the queue "queue_usage"
    return "Record queued succesfully"


# Router for syncing data from redis to the database
@router.post("/sync")
def sync_queue(device_id : str, session:Session = Depends(get_session)):
    count = 0
    queue_name = f"queue_usage_{device_id}"
    while True:
        msg = r.lpop(queue_name) # removes entries from left FIFO
        if not msg:
            break
        data = json.loads(msg) # Decodes JSON string
        sync_activity = AppUsage(**data) # Unpacking
        session.add(sync_activity) # Now adding to the db
        session.refresh(sync_activity) # After refresh id is generated not before
        count += 1
        link = AppUserLink(user_id= data["employee_id"], app_id=sync_activity.id) 
        session.add(link)
    session.commit()
    return f"Synced {count} records"
        
        
# Starting timesheet and adding to the queue
@router.post('/add_timesheet')
async def add_timesheet(project_id : int,task_id : int,
             db: Session = Depends(get_session),current_user: User = Depends(get_current_user())):
    
    status_now = "Active"
    
    new_timesheet = Timesheet(
        employee_id=current_user.user_id,
        current_date = date.today(),
        project_id=project_id,
        task_id=task_id,
        start_time = datetime.now() ,
        stop_time = None,
        total_hrs = 0.0,
        status = status_now
    ) 
    
    data = new_timesheet.model_dump()
    queue =f"timesheet_{current_user.user_id}"
    r.rpush(queue, json.dumps({**data, "start_time": data["start_time"].isoformat()}))
    return {'message' : 'Data successfully added to the queue'}


# Syncing queue with db
@router.post('/sync_queue')
def sync_timesheet(db: Session = Depends(get_session),
               current_user: User = Depends(get_current_user())):
    
    count = 0
    queue =f"timesheet_{current_user.user_id}"
    while True:
        msg = r.lpop(queue)
        if not msg:
            break
        data = json.loads(msg)
        # Converting back to datetime objects
        if isinstance(data['current_date'], str):
            data['current_date'] = datetime.strptime(data['current_date'], '%Y-%m-%d').date()
        if isinstance(data['start_time'], str):
            data['start_time'] = datetime.fromisoformat(data['start_time'])
        
        data['stop_time'] = datetime.now()
        data['total_hrs'] = round((data['stop_time'] - data['start_time']).total_seconds()/3600, 2) 
                   
        sync_data = Timesheet(**data)
        db.add(sync_data)
        db.commit()
        db.refresh(sync_data)
        count += 1
    return {'message' : f'Synced {count} timesheet(s) from the queue'}


@router.put('/update_task')
def update_task(task_id : int,updates : str,
                session: Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    query = select(Tasks).where(Tasks.id == task_id)
    execute = session.exec(query).first()
    if not execute:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No task by id {task_id} found")
    else:
        execute.status = updates    
        
    project = session.exec(select(Projects).where(Projects.id == execute.project_id)).first()
    client = select(User).where(User.id == project.client_id)
    get_client = session.exec(client).first()
        
    session.add(execute)
    session.commit()
    session.refresh(execute)
    send_task_email(get_client.email, current_user.id, task_id,
                    project.id)    
    return {'message' : 'Task status updated successfully'}


def send_task_email(to_email : str, employee_id :int, task_id :int,
                    project_id : int):

    from_email = 'admin1@gmail.com'
    message = MIMEText(f' Employee with id {employee_id} has updated their task status id {task_id} with project id {project_id}')
    message['Subject'] = 'Task Status'
    message['From'] = from_email
    message['To'] = to_email
    with smtplib.SMTP('localhost', 1025) as smtp:
        smtp.send_message(message)  


        