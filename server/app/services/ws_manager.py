from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, batch_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[batch_id].append(websocket)

    def disconnect(self, batch_id: int, websocket: WebSocket) -> None:
        if websocket in self.connections[batch_id]:
            self.connections[batch_id].remove(websocket)

    async def broadcast(self, batch_id: int, message: dict) -> None:
        for websocket in list(self.connections[batch_id]):
            await websocket.send_json(message)


ws_manager = ConnectionManager()

