from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator 
import re

class UsageCreate(SQLModel):
    device_id : str
    app : str
    duration : int
    timestamp : datetime
    
class AppUserLink(SQLModel, table=True):
    app_id :int = Field(foreign_key="appusage.id", primary_key=True)
    user_id : int = Field(foreign_key="user.id", primary_key=True)      
    
class AppUsage(SQLModel, table=True):
    id : int = Field(default = None, primary_key=True)
    device_id : str
    app : str
    duration : int
    timestamp : datetime
    user_id : int = Field(foreign_key="user.id")  
    users : list["User"] = Relationship(back_populates="app_usage",link_model=AppUserLink)
    
  
class UserInput(SQLModel):
    name : str
    role : str = Field(default="user")
    email : str
    password: str
    @field_validator('email')
    def email_must_be_valid(cls, v):    
        if not re.search(r"\w+@(\w+\.)?\w+\.(com)$",v, re.IGNORECASE):
            raise ValueError("Invalid email format")
        else:
            return v
          
    @field_validator('password')    
    def password_must_be_strong(cls, p):
             if not re.search(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*^_-])[A-Za-z\d!@#$%^&_*-]{8,}$",p):
                 raise ValueError("Invalid Password")
             else:
                    return p
                
class UserLogin(SQLModel):
    email : str
    password: str
    @field_validator('email')
    def email_must_be_valid(cls, v):    
        if not re.search(r"\w+@(\w+\.)?\w+\.(com)$",v, re.IGNORECASE):
            raise ValueError("Invalid email format")
        else:
            return v
          
    @field_validator('password')    
    def password_must_be_strong(cls, p):
             if not re.search(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*^_-])[A-Za-z\d!@#$%^&_*-]{8,}$",p):
                 raise ValueError("Invalid Password")
             else:
                    return p
    
class ForgetPassword(SQLModel):
    otp : str
    email : str
    password : str 
    @field_validator('email')
    def email_must_be_valid(cls, v):    
        if not re.search(r"\w+@(\w+\.)?\w+\.(com)$",v, re.IGNORECASE):
            raise ValueError("Invalid email format")
        else:
            return v
    @field_validator('password')    
    def password_must_be_strong(cls, p):
             if not re.search(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*^_-])[A-Za-z\d!@#$%^&_*-]{8,}$",p):
                 raise ValueError("Invalid Password")
             else:
                    return p    
                       

class User(SQLModel, table=True):
    id : int = Field(default = None, primary_key=True)
    name : str
    email : str
    password: str
    app_usage : list[AppUsage] = Relationship(back_populates= "users",
                link_model=AppUserLink)
    role : str = Field(default = "user", nullable = False)
    otp_code : str = Field(default=None, nullable= True)
    otp_created_at : datetime = Field(default=None, nullable= True)
    
    