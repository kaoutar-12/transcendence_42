from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Room
import json
from asgiref.sync import async_to_sync
from django.db.models import Count, Q, Max

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
        
        # Send unread messages to the user
        await self.send_user_unread_messages()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'mark_read':
            room_id = data.get('room_id')
            await self.mark_messages_as_read(room_id)
        if message_type == 'tournament_match_start':
            # notif in channel layer
            for player_id in data['player_ids']:
                    await self.channel_layer.group_send(
                        f'global_{player_id}',
                        {
                            'type': 'tournament_match',
                            'data': {
                                'message': f'Your match is starting! Match #{data["match_index"] + 1}',
                                'match_index': data['match_index'],
                                'players': data['players']
                            }
                        }
                    )

    async def tournament_match(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_match',
            'data': event['data']
        }))

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

    async def block_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'block_update',
            'data': event['data']
        }))
    
    async def room_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'data': event['data']
        }))

    async def global_message(self, event):
        # Handle all global message types
        await self.send(text_data=json.dumps({
            'type': 'message_update',
            'data': event['data']
        }))

    async def messages_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'data': event['data']
        }))

    async def unread_counts_update(self, event):
        print(f"Unread counts for user {self.user}: {event['data']}")
        await self.send(text_data=json.dumps({
            'type': 'messages_unread',
            'data': event['data']
        }))

    @database_sync_to_async
    def send_user_unread_messages(self):
        print(f"Sending unread messages for user {self.user}")
        # Get all rooms for the user with unread message counts
        rooms = (
            Room.objects.filter(
                Q(users=self.user) & 
                (Q(messages__read_by__isnull=True) | ~Q(messages__read_by=self.user)) &  # Include messages that are unread
                ~Q(messages__sender=self.user)  # Exclude messages sent by the user
            ).annotate(
                unread_count=Count(
                    'messages',
                    filter=(Q(messages__read_by__isnull=True) | ~Q(messages__read_by=self.user)) & ~Q(messages__sender=self.user)
                ),
                last_message_time=Max('messages__time')
            ).filter(
                unread_count__gt=0  # Ensure rooms have unread messages
            ).distinct()
        )
        
        print(f"Rooms with unread messages for {self.user}: {rooms}")

        # Prepare unread counts for each room
        unread_data = {}
        for room in rooms:
            print(f"Room ID: {room.id}, Unread Count: {room.unread_count}")
            unread_data[str(room.id)] = room.unread_count if room.unread_count > 0 else 0
        
        print(f"Unread data for {self.user}: {unread_data}")

        # Send the unread counts through WebSocket
        async_to_sync(self.channel_layer.group_send)(
            f'global_{self.scope['user'].id}',
            {
                'type': 'unread_counts_update',
                'data': unread_data,
            }
        )

    @database_sync_to_async
    def mark_messages_as_read(self, room_id):
        try:
            print(f"Marking messages as read for room {room_id}")
            room = Room.objects.get(id=room_id)
            unread_messages = (
                Message.objects
                .filter(room=room)
                .exclude(sender=self.scope["user"])
                .exclude(read_by=self.scope["user"])
            )
            
            for message in unread_messages:
                message.read_by.add(self.scope["user"])
            
            return True
        except Room.DoesNotExist:
            return False

    