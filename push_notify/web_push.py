from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pywebpush import webpush, WebPushException
import asyncio
from authentication.jwt_hashing import get_current_user
from sqlmodels.user_usage import User
from database.structure import get_session
from .subscription import PushSubscription

router = APIRouter()

with open("vapid_private.pem", "r") as f:
    VAPID_PRIVATE_KEY = f.read()

@router.post('/push/notifications')
def push_notifications(current_user : User = Depends(get_current_user),
                       session: Session = Depends(get_session)):
    
    query = select(PushSubscription).where(PushSubscription.user_id == current_user.user_id)
    sub : PushSubscription = session.exec(query).first()
    if not sub:
                raise HTTPException(status_code= status.HTTP_404_NOT_FOUND,
                            detail = "Not found") 
    
    subscription= {
            
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }}
    try:
        webpush(
            subscription_info= subscription,
            data = "Your weekly screen activity has been uploaded. You can go see it",
            vapid_private_key= VAPID_PRIVATE_KEY,
            vapid_claims= {
                "sub" : "test@example.com"
                }
        )
    except WebPushException as ex:    
        if ex.response is not None:
            try:
                extra = ex.response.json() # parsing the error msg into json
                print(f"Remote service replied with {extra.get('code')}:{extra.get('errno')}, {extra.get('message')}")
            except Exception:
                print("Remote service replied but response body is not valid JSON")

