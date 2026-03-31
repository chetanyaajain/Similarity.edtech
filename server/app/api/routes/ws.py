from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import ws_manager

router = APIRouter()


@router.websocket("/ws/batches/{batch_id}")
async def batch_updates(websocket: WebSocket, batch_id: int):
    await ws_manager.connect(batch_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(batch_id, websocket)

