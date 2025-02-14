from channels.generic.websocket import AsyncWebsocketConsumer
import json
from threading import Lock

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    online_users = set()
    users_lock = Lock()

    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
            
        await self.accept()

        with OnlineStatusConsumer.users_lock:
            OnlineStatusConsumer.online_users.add(self.user.id)

        self.presence_group = "presence_updates"

        await self.channel_layer.group_add(
            self.presence_group,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.presence_group,
            {
                "type": "user_online",
                "user_id": self.user.id,
                "online": True
            }
        )

        with OnlineStatusConsumer.users_lock:
            current_users = list(OnlineStatusConsumer.online_users)

        await self.send(json.dumps({
            "type": "online_users",
            "users": current_users
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "user") and not self.user.is_anonymous:

            with OnlineStatusConsumer.users_lock:
                OnlineStatusConsumer.online_users.discard(self.user.id)

            await self.channel_layer.group_discard(
                self.presence_group,
                self.channel_name
            )
            
            await self.channel_layer.group_send(
                self.presence_group,
                {
                    "type": "user_online",
                    "user_id": self.user.id,
                    "online": False
                }
            )

    async def receive(self, text_data):
        pass

    async def user_online(self, event):
        await self.send(text_data=json.dumps({
            "type": "status_change",
            "user_id": event["user_id"],
            "online": event["online"]
        }))

    @classmethod
    def is_user_online(cls, user_id):
        # lock so no else can changeit
        with cls.users_lock:
            return user_id in cls.online_users