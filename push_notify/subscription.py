from fastapi import Body, APIRouter, Depends
from sqlmodel import SQLModel, Field, Session
from database.structure import get_session

class PushSubscription(SQLModel, table=True):
    id : int | None = Field(default=None, primary_key=True)
    user_id : int
    endpoint : str
    p256dh : str
    auth : str
    
router = APIRouter()

# Data will be sent from front end to this router and then save to the db through PushSubscription
@router.post('/subscription')
async def subscription(body = Body(),
                       session:Session = Depends(get_session)):
    sub = body['subscription'] # dict inside the json body
    obj = PushSubscription(
        user_id = body.get("user_id"), # fetches user_id safely without throwing any errors
        endpoint = sub["endpoint"],
        p256dh = sub['keys']['p256dh'], # accesses sub dict 
        auth = sub['keys']['auth']            
    )
    session.add(obj)
    session.commit(obj)    
    return {"msg" : "OK"}