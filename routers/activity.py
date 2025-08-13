from datetime import timedelta
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timedelta
from sqlmodels.user_usage import User, AppUsage, AppUserLink, UsageCreate
from authentication.jwt_hashing import create_access_token, verify_password, get_current_user, bearer_scheme
from sqlmodel import Session, select
from notifications.ws_router import active_connections
import redis
import json


router = APIRouter(
    tags=['Your Activity']
)

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Router for the user to see their activity
@router.get('/activity', dependencies=[Depends(bearer_scheme)])
def see_activity( period : str = Query("today" ,regex= "^(today|week)$"),session:Session = Depends(get_session),
                 current_user: User = Depends(get_current_user())) :
    now = datetime.utcnow()
    if period == "today" :
        start_time = datetime(now.year, now.month, now.day)
    else :
        start_time = datetime.now() - timedelta(days=7)
    activity = (select(AppUsage)
    .join(AppUserLink, AppUsage.id == AppUserLink.app_id) # joins usage table with the link table
    .where(AppUserLink.user_id == current_user.id,
           AppUsage.timestamp == start_time)) # filters by the current user leaving behind rows only 
    # where the user is linked to the app
    
    user_activity = session.exec(activity).all() # fetches them all
    
    return user_activity


@router.get('/{user_id}')
def see_user_activity(user_id : int, session : Session = Depends(get_session),
                      current_user : User = Depends(get_current_user())):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only Admin can perform this action")
    query = select(AppUsage).where(AppUsage.user_id == user_id)
    activities = session.exec(query).all()
    if not activities :
            raise HTTPException(status_code=404, detail=f"User of id {user_id} not found")
    
    return activities
    
# Router for recieving data from the frontend and adding data to redis
@router.post('/add_activity', dependencies=[Depends(bearer_scheme)])
async def add_activity( usage: UsageCreate,session:Session = Depends(get_session),
                 current_user: User = Depends(get_current_user())) :

    add_usage = AppUsage(

        device_id = usage.device_id,
        app = usage.app,
        duration = usage.duration,
        timestamp = usage.timestamp,
        user_id = current_user.id 
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
        
        link = AppUserLink(user_id= data["user_id"], app_id=sync_activity.id) 
        session.add(link)
    session.commit()
        



