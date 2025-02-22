import asyncio
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Room
import json

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user = self.scope['user']

        # Reject connection if user is not authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        try:
            # Retrieve the room and check user membership
            room = await self.get_room()
            if not await self.is_user_in_room(room):
                await self.close()
                return
        except Room.DoesNotExist:
            await self.close()
            return

        # Add the user to the room's WebSocket group
        await self.channel_layer.group_add(f'chat_{self.room_id}', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f'chat_{self.room_id}',
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
            
            # Get room users
            room = await self.get_room()
            users = await self.get_room_users(room)
            sender = await User.objects.aget(id = sender_id)
            other_user = await room.users.exclude(id=sender_id).afirst()

            is_sender_blocked = await other_user.blocked_users.filter(id=sender.id).aexists()
            is_other_user_blocked = await sender.blocked_users.filter(id=other_user.id).aexists()

            if is_other_user_blocked:
                await self.send(text_data=json.dumps({
                    'error': 'Message not sent. You have blocked this user.'
                }))
                return

            if is_sender_blocked:
                await self.send(text_data=json.dumps({
                    'error': 'Message not sent. You are blocked by this user.'
                }))
                return

            # Saviw lmessage f database
            saved_message = await self.save_message(message_content, sender_id)

            # Send to both room group and users' global groups
            await asyncio.gather(
                # Original room group send
                self.channel_layer.group_send(
                    f'chat_{self.room_id}',
                    {
                        'type': 'chat_message',
                        'content': saved_message.content,
                        'sender_id': saved_message.sender_id,
                        'time': saved_message.time.isoformat(),
                    }
                ),

                # Send to all users' global channels
                *[self.channel_layer.group_send(
                    f'global_{user.id}',
                    {
                        'type': 'global_message',
                        'data': {
                            'content': saved_message.content,
                            'sender_id': saved_message.sender_id,
                            'room_id': str(self.room_id),
                            'time': saved_message.time.isoformat(),
                        }
                    }
                ) for user in users]
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
        except User.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'User not found'}))
        except Room.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Room not found'}))

    async def chat_message(self, event):
        print(f"Received chat message: {event['content']}")
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
    
    @database_sync_to_async
    def get_room_users(self, room):
        return list(room.users.all())

    @database_sync_to_async
    def get_room(self):
        return Room.objects.get(id=self.room_id)
    
    @database_sync_to_async
    def is_user_in_room(self, room):
        return room.users.filter(id=self.scope['user'].id).exists()