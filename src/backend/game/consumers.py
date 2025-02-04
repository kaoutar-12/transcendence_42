import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import QueuePosition, GameSession, Player

class QueueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Authentication required'
            }))
            await self.close()
            return
        
        self.room_name = f'queue_{self.user.id}'
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        
        is_in_queue = await self.check_queue_status()
        await self.send(text_data=json.dumps({
            'type': 'queue_status',
            'in_queue': is_in_queue
        }))

    @database_sync_to_async
    def check_queue_status(self):
        try:
            return QueuePosition.objects.filter(user=self.user).exists()
        except Exception:
            return False

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
    
    async def receive(self, text_data):
        if not self.user.is_authenticated:
            return

        try:
            data = json.loads(text_data)
            if data.get('type') == 'check_status':
                is_in_queue = await self.check_queue_status()
                await self.send(text_data=json.dumps({
                    'type': 'queue_status',
                    'in_queue': is_in_queue
                }))
        except json.JSONDecodeError:
            pass

    async def notify_match_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_created',
            'game_id': event['game_id']
        }))

    async def notify_queue_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'queue_status',
            'status': event['status']
        }))

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return

        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        
        is_player = await self.is_player()
        if not is_player:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        game_state = await self.get_game_state()
        await self.send(text_data=json.dumps(game_state))

    @database_sync_to_async
    def is_player(self):
        try:
            return Player.objects.filter(
                user=self.user,
                game_session_id=self.game_id
            ).exists()
        except Exception:
            return False

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            if message_type == 'player_move':
                await self.move(data)
            elif message_type == 'player_ready':
                await self.ready(data)
            elif message_type == 'game_action':
                await self.handle_game_action(data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        
    @database_sync_to_async
    def get_game_state(self):
        game_session = GameSession.objects.get(id=self.game_id)
        players = Player.objects.filter(game_session=game_session)
        return {
            'type': 'game_state',
            'id': game_session.id,
            'state': game_session.status,
            'players': [
                {
                    'id': player.user.id,
                    'username': player.user.username,
                    'score': player.score,
                    'side': player.side,
                    'ready': player.ready
                }
                for player in players
            ]
        }
    
    @database_sync_to_async
    def handle_player_ready(self):
        player = Player.objects.get(user=self.user, game_session_id=self.game_id)
        player.ready = True
        player.save()

        game_session = GameSession.objects.get(id=self.game_id)
        all_ready = Player.objects.filter(game_session=game_session, ready=True).count()
        if all_ready == 2:
            game_session.status = 'A'
            game_session.save()
            return {'type': 'game_start'}
        return {'type': 'player_ready', 'user_id': self.user.id}
    
    async def handle_player_move(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_move',
                'user_id': self.user.id,
                'movement': data.get('movement', {}),
            }
        )

    async def move(self, data):
        await self.handle_player_move(data)

    async def ready(self, data):
        response = await self.handle_player_ready()
        await self.channel_layer.group_send(
            self.room_group_name,
            response
        )

    async def handle_game_action(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_action',
                'action': data.get('action', ''),
                'data': data.get('data', {}),
            }
        )

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def game_action(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def player_ready(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

