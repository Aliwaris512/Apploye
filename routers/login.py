from datetime import timedelta
from sqlmodel import SQLModel
from typing import Annotated
from database.structure import get_session
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodels.user_usage import User, UserInput, UserLogin, ForgetPassword
from authentication.jwt_hashing import create_access_token, verify_password, get_hashed_password
from sqlmodel import Session, select
from email.mime.text import MIMEText
import smtplib
from datetime import datetime, timedelta
import random
import os
import logging
from notifications.ws_router import active_connections

# Set up logging
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'login_debug.log')
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=['Login']
)

@router.post('/login')
async def login_user(
    request: Request,
    response: Response,
    user: UserLogin = None,
    session: Session = Depends(get_session)
):
    logger.info("\n=== LOGIN ENDPOINT CALLED ===")
    logger.info("\n=== Login Attempt ===")
    content_type = request.headers.get('content-type', '')
    logger.info(f"Content-Type: {content_type}")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    # Handle JSON data
    if 'application/json' in content_type:
        try:
            json_data = await request.json()
            print(f"JSON Data: {json_data}")
            user = UserLogin(
                email=json_data.get('email'),
                password=json_data.get('password')
            )
            print(f"Parsed User (from JSON): {user}")
        except Exception as e:
            print(f"Error parsing JSON: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON data: {str(e)}"
            )
    # Handle form data
    elif 'application/x-www-form-urlencoded' in content_type:
        try:
            form_data = await request.form()
            print(f"Form Data: {dict(form_data)}")
            user = UserLogin(
                email=form_data.get('username'),
                password=form_data.get('password')
            )
            print(f"Parsed User (from form): {user}")
        except Exception as e:
            print(f"Error parsing form data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid form data: {str(e)}"
            )
    
    if not user or not user.email or not user.password:
        print(f"Missing credentials: user={user}, email={getattr(user, 'email', None)}, password={'*' * len(getattr(user, 'password', '')) if getattr(user, 'password', None) else None}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    print(f"Looking up user with email: {user.email}")
    query = select(User).where(User.email == user.email)
    login_user: User = session.exec(query).first()
    
    if not login_user:
        print(f"User not found with email: {user.email}")
        raise_error_404()
    
    print(f"Found user: ID={login_user.id}, Email={login_user.email}, Role={login_user.role}")
    print(f"Stored password hash: {login_user.password}")
    print(f"Password to verify: {user.password}")
    
    # Debug password verification
    from authentication.jwt_hashing import verify_password as vp
    try:
        print("\nDebugging password verification:")
        print(f"Password type: {type(user.password)}")
        print(f"Hash type: {type(login_user.password)}")
        print(f"Password length: {len(user.password) if user.password else 0}")
        print(f"Hash length: {len(login_user.password) if login_user.password else 0}")
        
        # Try direct verification
        import bcrypt
        print("\nDirect bcrypt verification:")
        print(f"Result: {bcrypt.checkpw(user.password.encode('utf-8'), login_user.password.encode('utf-8'))}")
        
        # Try passlib verification
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        print("\nPasslib verification:")
        print(f"Result: {pwd_context.verify(user.password, login_user.password)}")
        
    except Exception as e:
        print(f"Error during verification debug: {str(e)}")
    
    if not verify_password(user.password, login_user.password):
        print("Password verification failed")
        raise_error_404()
        
    print("Password verification successful")
        
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
def signup_user(user: UserInput, session: Session = Depends(get_session)):
    # Check if user already exists
    existing_email = select(User).where(User.email == user.email)
    check_existing_email: User = session.exec(existing_email).first()
    if check_existing_email:
        raise HTTPException(status_code=400, detail='Email already exists')
    
    # Create new user with role from UserInput
    signup = User(
        name=user.name,
        email=user.email,
        password=get_hashed_password(user.password),
        role=user.role  # Include the role from the input
    )
    
    session.add(signup)
    session.commit()
    session.refresh(signup)
    return "User successfully signed up"
    
def raise_error_404():
    raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found",
    headers={"WWW-Authenticate": "Bearer"}
    )
        