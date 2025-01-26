from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Room
import json

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # fash kansifto shi msg kaymshi mn lfront f json file ohad reciece katchedo okat3tih lserver 
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_content = data['message']
            sender_id = data['sender_id']

            if not message_content:
                return
            
            # Saviw lmessage f database
            saved_message = await self.save_message(message_content, sender_id)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'content': saved_message.content,
                    'sender_id': saved_message.sender_id,
                    'time': saved_message.time.isoformat(),
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'sender_id': event['sender_id'],
            'time': event['time']
        }))

    @database_sync_to_async
    def save_message(self, message_content, sender_id):
        return Message.objects.create(
            content=message_content,
            sender=User.objects.get(id=sender_id),
            room=Room.objects.get(id=self.room_id)
        )