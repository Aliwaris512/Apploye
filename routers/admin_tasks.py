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
    tags=['Admin']
)

@router.post('/create_users')
def create_users(user:UserInput,
            session: Session = Depends(get_session), current_user : User = Depends(get_current_user())):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only admins are authorised to perform this action")
                
    else:    
        create = User(name=user.name, role = user.role,email=user.email,
                      password=get_hashed_password(user.password),hourly_rate=user.hourly_rate)
        
        existing_email = select(User).where(User.email == user.email)
        check_existing_email : User = session.exec(existing_email).first()
        if check_existing_email:
            raise HTTPException(status_code= 400, detail='Email already exists')
        if create.role not in ("employee","client"):
            raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE,
                                detail = "Role should be a client or an employee")
        
        session.add(create)
        session.commit()
        session.refresh(create)
        return "Employee succesfully created"
    
# Get Activity    
@router.get('/get_user_activity')
def view_user_activity( employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only admins are authorised to perform this action")
        
    query = select(AppUsage).where(AppUsage.employee_id == employee_id, AppUsage.role == "employee")    
    get_activity = session.exec(query).all()
    if get_activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_activity    

# Get employee timesheet
@router.get('/get_user_timesheet')
def view_user_timesheet(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only admin are authorised to perform this action")
    
    query = select(Timesheet).where(Timesheet.employee_id == employee_id)    
    get_timesheet = session.exec(query).all()
    if get_timesheet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No movie by id {employee_id} found")
    return get_timesheet


# Get employee attendance
@router.post('/get_user_attendance')
def view_user_attendance(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):  
        
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    query = select(Attendance).where(Attendance.employee_id == employee_id)    
    get_attendance = session.exec(query).all()
    if get_attendance is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No employee by id {employee_id} found")
    return get_attendance  


#Viewing payroll
@router.get('/get_user_payroll')
def view_user_payroll(employee_id : int ,session:Session = Depends(get_session),
                    current_user : User = Depends(get_current_user())):
    
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Only clients are authorised to perform this action")
    
    query = select(Payroll).where(Payroll.employee_id == employee_id)    
    get_payroll = session.exec(query).all()
    if get_payroll is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = f"No movie by id {employee_id} found")
    return get_payroll