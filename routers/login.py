from datetime import timedelta
from sqlmodel import SQLModel
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodels.user_usage import User, UserInput, UserLogin, ForgetPassword
from authentication.jwt_hashing import create_access_token, verify_password, get_hashed_password
from sqlmodel import Session, select
from email.mime.text import MIMEText
import smtplib
from datetime import datetime, timedelta
import random
from notifications.ws_router import active_connections

router = APIRouter(
    tags=['Login']
)
@router.post('/login')
async def login_user(user : UserLogin,
               session: Session = Depends(get_session)):

    query = select(User).where(User.email == user.email)
    login_user : User = session.exec(query).first()
    if not login_user:
            raise_error_404()
    
    if not verify_password(user.password, login_user.password,):
        raise_error_404()
        
    access_token = create_access_token(data={'sub':login_user.email, 'id' : login_user.id,
                                             "role" : login_user.role}) 
    connection = active_connections.get(user.email)
    if connection:
        print("Active Connection", active_connections)
        print("Target email", user.email) 
        await connection.send_text(f"{login_user.role.capitalize()} has logged in successfully!")  
    else:
        print(f"No websocket with email {user.email} logged in..")                
    return {'access_token': access_token, 'token_type': 'bearer'}



def send_otp(to_email: str, otp : str):
    sender_email = "test@sample.com"
    msg = MIMEText(f"Your OTP is {otp}")
    msg['Subject'] = "OTP for login"
    msg['To'] = to_email
    msg['From'] = sender_email
    server = smtplib.SMTP('localhost', 1025)
    server.send_message(msg)

    
@router.post('/generate_otp')
def generate_otp(email : str, session: Session = Depends(get_session)):
    otp = str(random.randint(100000, 999999))
    user_obj = select(User).where(User.email == email)
    generate = session.exec(user_obj).first()
    if generate:
        generate.otp_code = otp
        generate.otp_created_at = datetime.utcnow()      
        
        session.add(generate)
        session.commit()
        send_otp(generate.email, otp)

        return {"message": "OTP sent to your email"}  
    
    else: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found")    
    
@router.post('/update_password')
def update_password(user : ForgetPassword,
                    session: Session = Depends(get_session)):
    query = select(User).where(User.email == user.email, User.otp_code == user.otp)
    user_obj = session.exec(query).first()
    
    if user_obj is not None:
       
        if datetime.utcnow() > user_obj.otp_created_at + timedelta(minutes=2):
            user_obj.otp_code = None
            user_obj.otp_created_at = None
            session.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired, please request a new one") 
        else:
            user_obj.password = get_hashed_password(user.password)
            user_obj.otp_code = None
            user_obj.otp_created_at = None
            session.commit()
            return {"message" : "Password changed successfully"}
         
    else: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail = "No user found")
                
@router.post('/signup')
def signup_user(user:UserInput, session: Session = Depends(get_session)):
    
        signup = User(name=user.name, email=user.email, password=get_hashed_password(user.password))
        existing_email = select(User).where(User.email == user.email)
        check_existing_email : User = session.exec(existing_email).first()
        if check_existing_email:
            raise HTTPException(status_code= 400, detail='Email already exists')
        
        session.add(signup)
        session.commit()
        session.refresh(signup)
        return "User succesfully signed up"
    
def raise_error_404():
    raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found",
    headers={"WWW-Authenticate": "Bearer"}
    )
        