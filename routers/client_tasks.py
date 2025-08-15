from datetime import timedelta, date, datetime
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timedelta
from sqlmodels.user_usage import User, UserInput,AppUsage, Timesheet, Attendance,UsageCreate, Timesheet, ProjectInput, Projects, Tasks, Payroll
from authentication.jwt_hashing import create_access_token, verify_password, get_current_user, bearer_scheme, get_hashed_password
from sqlmodel import Session, select
from notifications.ws_router import active_connections

router = APIRouter(
    tags=['Client']
)

# Creating employess
@router.post('create_employees')
def create_employees(user:UserInput,
            session: Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
                
    else:    
        create = User(name=user.name, role = user.role,email=user.email,
                      password=get_hashed_password(user.password),hourly_rate=user.hourly_rate)
        
        existing_email = select(User).where(User.email == user.email)
        check_existing_email : User = session.exec(existing_email).first()
        if check_existing_email:
            raise HTTPException(status_code= 400, detail='Email already exists')
        if create.role not in ("employee", "client"):

            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                detail = "Role should be employee")
        
        session.add(create)
        session.commit()
        session.refresh(create)
        return "Employee succesfully created"
    
# Posting projects    
@router.post('/post_projects')
def upload_projects(enter_projects : ProjectInput,
                    session:Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")       
    else:
        upload = Projects(
            client_id= current_user.id,
            name = enter_projects.name,
            description = enter_projects.description,
            status = None
        )    
        session.add(upload)
        session.commit()
        session.refresh(upload)
        
        return {'message' : 'Project has been posted successfully'}
    
# Posting tasks    
@router.post('/post_tasks')
def upload_tasks(project_id : int, name :str, description : str, employee_id : int,
    session:Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    else:
        query = select(Projects).where(Projects.id == project_id)
        confirm = session.exec(query).first()
        user_query = select(User).where(User.id == employee_id, User.role == "employee")
        confrim_employee = session.exec(user_query).first()
        if confirm and confrim_employee:
            upload = Tasks(
                project_id= project_id,
                name = name,
                description = description,
                assigned_to= employee_id,
                status = "Inactive"
            )    
        session.add(upload)
        session.commit()
        session.refresh(upload)
        
        return {'message' : 'Project has been posted successfully'}     

# Get Activity    
@router.get('get_activity')
def view_activity( employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
        
    query = select(AppUsage).where(AppUsage.employee_id == employee_id, AppUsage.role == "employee")    
    get_activity = session.exec(query).all()
    if get_activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_activity

# Get employee timesheet
@router.get('/get_timesheet')
def view_timesheet(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    query = select(Timesheet).where(Timesheet.employee_id == employee_id)    
    get_timesheet = session.exec(query).all()
    if get_timesheet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_timesheet

# Get employee attendance
@router.post('/get_attendance')
def view_attendance(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):  
        
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    query = select(Attendance).where(Attendance.employee_id == employee_id)    
    get_attendance = session.exec(query).all()
    if get_attendance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_attendance  

# Generating payroll
@router.post('/payroll')
def view_payroll(employee_id : int,project_id: int, task_id : int, session:Session = Depends(get_session),
                 current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    check_status = select(Projects).where(Projects.id == project_id,
                            Projects.status == "completed")
    check = session.exec(check_status).first()
    if check:
        query = select(Timesheet).where(Timesheet.user_id == employee_id,
                    Timesheet.project_id == project_id, Timesheet.task_id == task_id)
        rows = session.exec(query).all()
        if not rows:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail = f"No movie by id {employee_id} found") 
        total = sum(ts.total_hours for ts in rows)
        
        employee = select(User).where(User.id == employee_id)
        execute = session.exec(employee).first()
        if execute is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail = f"No movie by id {employee_id} found") 
         
        pay = total * execute.hourly_rate  
        payroll = Payroll(
            employee_id = employee_id,
            project_id = project_id,
            task_id = task_id,
            hours_worked= total,
            hourly_rate= execute.hourly_rate,
            total_amount = pay        
        )     
        session.add(payroll)
        session.commit()
        session.refresh(payroll)
        
        return {'message' : 'payroll has been posted'}
    
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail =f"Project with id {project_id} is either not completed or not found")

#Viewing payroll
@router.get('/get_payroll')
def view_payroll(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    query = select(Payroll).where(Payroll.employee_id == employee_id)    
    get_payroll = session.exec(query).all()
    if get_payroll is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_payroll

@router.put('/update_project_status')
def update_project_status(project_id : int, update : str,
                          session:Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    if current_user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    update_project = select(Projects).where(Projects.id == project_id)
    change = session.exec(update_project).all()    
    if not change:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No project by id {project_id} found")
        
    query = select(Tasks).where(Tasks.project_id == project_id)
    rows = session.exec(query).all()
    for row in rows:
        if row.status != "Completed":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                default = "Project status cannot be updated if it is not completed")
        
    change.status = "Completed"   
    session.add(change)
    session.commit()
    session.refresh(change)
    
    return {'message' : 'project status has been updated'}