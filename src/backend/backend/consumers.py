from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Room
import json

User = get_user_model()

class GlobalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        # Reject connection if user is not authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        # Add the user to the room's WebSocket group
        self.room_group_name = f'global_{self.user.id}'
        await self.channel_layer.group_add(f'global_{self.user.id}', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f'global_{self.user.id}',
            self.channel_name
        )

    async def room_update(self, event):
        # Handle room creation/update notifications
        await self.send(text_data=json.dumps({
            'type': 'room_update',
            'data': event['data']
        }))

    async def global_message(self, event):
        # Handle all global message types
        await self.send(text_data=json.dumps({
            'type': event['message_type'],
            'data': event['data']
        }))

    