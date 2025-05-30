from django.contrib.auth import get_user_model
from game.consumers import serverPongGame
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import Message, Room
import json
import time
from asgiref.sync import async_to_sync
from django.db.models import Count, Q, Max
from threading import Lock
from game.memory_storage import MemoryStorage
from game.consumers import PongGameConsumer

User = get_user_model()

class GlobalConsumer(AsyncWebsocketConsumer):
    users_lock = Lock()
    async def connect(self):
        self.user = self.scope['user']
        # Reject connection if user is not authenticated
        if self.user.is_anonymous:
            await self.close()
            return
        self.room_group_name = f'global_{self.user.id}'
        await self.channel_layer.group_add(f'global_{self.user.id}', self.channel_name)
        await self.change_count()
        await self.set_user_online(True)
        await self.accept()
        
    @database_sync_to_async
    def set_user_online(self, is_online):
        # Update the user's online status in the database
        try:
            user= User.objects.get(id=self.user.id)
            if is_online or user.online_count <=  0 :
                user.is_online = is_online
                user.save()
        except User.DoesNotExist:
            return
            

    @database_sync_to_async
    def change_count(self, increase=True):
        try:
            user = User.objects.get(id=self.user.id)
            print(user.online_count)
            if increase:
                user.online_count += 1
            else:
                user.online_count -= 1
            user.save()
        except User.DoesNotExist:
            return

    async def notify_invite(self, event):
        print(f"Notify invite received by {self.user.id}: {event}")
        await self.send(text_data=json.dumps({
            'type': 'invite_received',
            'data': event['data']
        }))

    async def receive(self, text_data):
        if not self.user.is_authenticated:
            return
        
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'mark_read':
            room_id = data.get('room_id')
            await self.mark_messages_as_read(room_id)

        if message_type == 'send_invite':
            try:
                target_user_id = data['target_user_id']
                invite_id = MemoryStorage.create_invite(self.user.id, target_user_id)
                print(f"Sending invite to user {target_user_id} from {self.user.id}")
                await self.channel_layer.group_send(
                    f'global_{target_user_id}',
                    {
                        'type': 'notify_invite',
                        'data':{
                            'invite_id': invite_id,
                            'from_user_id': self.user.id,
                            'from_username': self.user.username
                        }
                    }
                )
            except Exception as e:
                print(f"Error sending invite: {e}")

        if message_type == 'accept_invite':
            invite_id = data['invite_id']
            invite = MemoryStorage.get_invite(invite_id)
            if invite and invite['to_user_id'] == self.user.id:
                game_id = MemoryStorage.generate_game_id()
                game_state = serverPongGame().create_initial_state()
                game_state['start_time'] = time.time()
                MemoryStorage.save_game_state(game_id, game_state)
                player1 = invite['from_user_id']
                player2 = invite['to_user_id']
                PongGameConsumer.register_authorized_players(game_id, player1, player2)
                for player_id in [invite['from_user_id'], invite['to_user_id']]:
                    await self.channel_layer.group_send(
                        f'global_{player_id}',
                        {
                            'type': 'notify_game_created',
                            'data': {
                                'game_id': game_id,
                            }
                        }
                    )
                
                MemoryStorage.remove_invite(invite_id)

        if message_type == 'decline_invite':
            invite_id = data['invite_id']
            invite = MemoryStorage.get_invite(invite_id)
            
            if invite and invite['to_user_id'] == self.user.id:
                await self.channel_layer.group_send(
                    f'global_{invite["from_user_id"]}',
                    {
                        'type': 'notify_invite_declined',
                        'data': {
                            'invite_id': invite_id,
                            'by_username': self.user.username
                        }
                    }
                )
                MemoryStorage.remove_invite(invite_id)

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
        await self.change_count(False)
        
        await self.set_user_online(False)


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

    async def notify_game_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_created',
            'data': event['data']
        }))

    async def notify_invite_declined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invite_declined',
            'data': event['data']
        }))

    