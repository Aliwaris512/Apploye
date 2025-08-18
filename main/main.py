import uvicorn
from fastapi import FastAPI
from routers import employee_tasks, login, admin_tasks, client_tasks
from notifications import ws_router
from sqlmodel import SQLModel
from database.structure import engine
from push_notify import subscription, web_push
#from utils import login_save_token, create_save_device_id

app = FastAPI()

app.include_router(login.router)
app.include_router(employee_tasks.router)
app.include_router(ws_router.router)
app.include_router(subscription.router)
app.include_router(web_push.router)
app.include_router(admin_tasks.router)
app.include_router(client_tasks.router)

 
@app.on_event("startup") 
def on_startup() -> None:
    SQLModel.metadata.create_all(engine) 