from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlmodels import user_usage
from database.structure import get_session
from authentication.oauth2_ws import get_current_ws
from typing import Dict
import asyncio
router = APIRouter()

active_connections : dict[str, WebSocket] = {}

# For basic notifications
@router.websocket('/ws/notifications')
async def notifications(websocket:WebSocket, session:Session = Depends(get_session)):
    await websocket.accept()
    email = None
    try: 
        current_user = await get_current_ws(websocket, session)
        if not current_user: 
            print('Connection failed')
            return
        print('connection open')
        email = current_user.email
        active_connections[email] = websocket 
        print('email stored in wbesocket', websocket)
        print(active_connections)
        
        while True:
            data = await websocket.receive_text()
            print(f'{email} sent : {data}')
    except WebSocketDisconnect:
        active_connections.pop(email, None)
        print('connection closed') 
        
# For weekly activity check        
@router.websocket('/')    
async def weekly_update(websocket : WebSocket, session : Session = Depends(get_session)):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(60 * 60 * 24 * 7)
            await websocket.send_text("Check your weekly screen activity")
            
    except WebSocketDisconnect:
        print("User disconnected")        