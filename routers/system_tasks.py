from datetime import timedelta, date, datetime
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timedelta
from sqlmodels.user_usage import User, AppUsage, AppUserLink, UsageCreate, Timesheet, Attendance
from authentication.jwt_hashing import create_access_token, verify_password, get_current_user, bearer_scheme
from sqlmodel import Session, select
from notifications.ws_router import active_connections
import redis
import json
from typing import Optional


router = APIRouter(
    tags=['System']
)


@router.post('/mark_attendence_by_system')
def auto_mark_attendance(session : Session = Depends(get_session),
                         current_user : User = Depends(get_current_user())):
    
    query = select(Timesheet).where(Timesheet.user_id == current_user.id, Timesheet.status == "Active")
    confirm = session.exec(query).first()
    
    if confirm.status == "Active":
        mark_present = Attendance(
        employee_id = current_user.id ,
        current_date = date.today() ,
        status = "Present"
        )
        session.add(mark_present)
        session.refresh(mark_present)
    else:
        mark_absent = Attendance(
        employee_id = current_user.id ,
        current_date = date.today() ,
        status = "Absent"
        )  
        session.add(mark_absent)
        session.refresh(mark_absent) 
        
    session.commit()
    return {'message' : 'attendance has been marked'}    
      