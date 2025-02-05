import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import QueuePosition, GameSession, Player
from django.contrib.auth import get_user_model
import random
import time


User = get_user_model()


class PongGAMEConsumer:
    def __init__(self, width=1300, height=600):
        self.width = width
        self.height = height
        self.paddle_width = 10
        self.paddle_height = 120
        self.paddle_speed = 8

        # for ball
        self.ball_size = 10
        self.ball_initial_speed = 2
        self.max_bounce_angle = 75

        # score to win
        self.win_score = 1
    
    def init_state(self):
        return {
            'ball': {
                'x': self.width / 2,
                'y': self.height / 2,
                'speedX': self.ball_initial_speed * (1 if random.random() < 0.5 else -1),
                'speedY': self.ball_initial_speed * (1 if random.random() < 0.5 else -1)
            },
            'paddles': {
                'left' : {
                    'y': self.height / 2 - self.paddle_height / 2,
                    'score': 0
                },
                'right': {
                    'y': self.height / 2 - self.paddle_height / 2,
                    'score': 0
                }
            },
            'game_status': 'playing',
            'timestamp': time.time()
            }
    
    def update(self, state, deltatime):
        if state['game_status'] != 'playing':
            return None
        ball = state['ball']
        paddles = state['paddles']
        timeframe = deltatime * 60
        ball['x'] += ball['speedX']  * timeframe
        ball['y'] += ball['speedY'] * timeframe

        # isit collision with top and bottom
        if ball['y'] - self.ball_size /2 <= 0:
            ball['y'] = self.ball_size / 2
            ball['speedY'] = abs(ball['speedY'])
        elif ball['y'] + self.ball_size / 2 >= self.height:
            ball['y'] = self.height - self.ball_size / 2
            ball['speedY'] = -abs(ball['speedY'])

        # check if it scored 
        if ball['x'] <= 0:
            paddles['right']['score'] += 1
            if paddles['right']['score'] >= self.win_score:
                state['gameStatus'] = 'finished'
                return 'right'
            self._reset_ball(state, 1)
            return 'right_scored'
        elif ball['x'] >= self.width:
            paddles['left']['score'] += 1
            if paddles['left']['score'] >= self.win_score:
                state['gameStatus'] = 'finished'
                return 'left'
            self._reset_ball(state, -1)
            return 'left_scored'
        
        #padle collision
        if (ball['x'] - self.ball_size / 2 <= self.paddle_width and
            paddles['left']['y'] <= ball['y'] <= paddles['left']['y'] + self.paddle_height):
            ball['x'] = self.paddle_with + self.ball_size / 2
            self.handle_paddle_collision(state, 'left')

        elif (ball['x'] + self.ball_size / 2 >= self.width - self.paddle_width and
              paddles['right']['y'] <= ball['y'] <= paddles['right']['y'] + self.paddle_height):
            ball['x'] = self.width - self.paddle_width - self.ball_size / 2
            self.handle_paddle_collision(state, 'right')
        
        return None

    def handle_paddle_collision(self, state, side_paddle):
        ball = state['ball']
        paddle_y = state['paddles'][side_paddle]['y']

        # calculate the intersection
        


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
        """Handle new WebSocket connection"""
        await self.accept()
        
        # Validate user and get game details
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return

        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        
        # Verify user is player in this game
        is_player = await self.is_player()
        if not is_player:
            await self.close()
            return

        # Add to game group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Send initial game state
        game_state = await self.get_game_state()
        await self.send(text_data=json.dumps(game_state))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnect"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'player_move':
                # Handle paddle movement
                await self.handle_player_move(data)
            elif message_type == 'player_ready':
                # Handle player ready status
                await self.handle_player_ready()
            elif message_type == 'game_action':
                # Handle other game actions
                await self.handle_game_action(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))

    async def handle_player_move(self, data):
        """Process player paddle movement"""
        player = await self.get_player()
        if not player:
            return
            
        # Validate and update paddle position
        new_position = data.get('position', 0)
        game_session = await self.get_game()
        
        # Broadcast the move to all players
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'action': 'paddle_move',
                'player_id': self.user.id,
                'position': new_position
            }
        )

    async def handle_player_ready(self):
        """Handle player ready status update"""
        player = await self.get_player()
        if not player:
            return
            
        # Update player ready status
        await self.update_player_ready(player)
        
        # Check if all players are ready
        if await self.all_players_ready():
            # Start the game
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_start'
                }
            )

    async def game_update(self, event):
        """Send game updates to WebSocket"""
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        """Handle game start event"""
        await self.send(text_data=json.dumps({
            'type': 'game_start'
        }))

    @database_sync_to_async
    def get_player(self):
        """Get the player object for current user"""
        try:
            return Player.objects.get(
                user=self.user,
                game_session_id=self.game_id
            )
        except Player.DoesNotExist:
            return None

    @database_sync_to_async
    def get_game(self):
        """Get the game session"""
        try:
            return GameSession.objects.get(id=self.game_id)
        except GameSession.DoesNotExist:
            return None

    @database_sync_to_async
    def update_player_ready(self, player):
        """Update player ready status"""
        player.ready = True
        player.save()

    @database_sync_to_async
    def all_players_ready(self):
        """Check if all players are ready"""
        game = GameSession.objects.get(id=self.game_id)
        return not Player.objects.filter(
            game_session=game,
            ready=False
        ).exists()

# class GameConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
        
#         self.user = self.scope['user']
#         if self.user.is_anonymous:
#             await self.close()
#             return

#         self.game_id = self.scope['url_route']['kwargs']['game_id']
#         self.room_group_name = f'game_{self.game_id}'
        
#         is_player = await self.is_player()
#         if not is_player:
#             await self.close()
#             return

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         game_state = await self.get_game_state()
#         await self.send(text_data=json.dumps(game_state))

#     @database_sync_to_async
#     def is_player(self):
#         try:
#             return Player.objects.filter(
#                 user=self.user,
#                 game_session_id=self.game_id
#             ).exists()
#         except Exception:
#             return False

#     async def disconnect(self, close_code):
#         if hasattr(self, 'room_group_name'):
#             await self.channel_layer.group_discard(
#                 self.room_group_name,
#                 self.channel_name
#             )
    
#     async def receive(self, text_data):
#         try:
#             data = json.loads(text_data)
#             message_type = data.get('type')
#             if message_type == 'player_move':
#                 await self.move(data)
#             elif message_type == 'player_ready':
#                 await self.ready(data)
#             elif message_type == 'game_action':
#                 await self.handle_game_action(data)
#         except json.JSONDecodeError:
#             await self.send(text_data=json.dumps({
#                 'error': 'Invalid JSON format'
#             }))
        
#     @database_sync_to_async
#     def get_game_state(self):
#         game_session = GameSession.objects.get(id=self.game_id)
#         players = Player.objects.filter(game_session=game_session)
#         return {
#             'type': 'game_state',
#             'id': game_session.id,
#             'state': game_session.status,
#             'players': [
#                 {
#                     'id': player.user.id,
#                     'username': player.user.username,
#                     'score': player.score,
#                     'side': player.side,
#                     'ready': player.ready
#                 }
#                 for player in players
#             ]
#         }
    
#     @database_sync_to_async
#     def handle_player_ready(self):
#         player = Player.objects.get(user=self.user, game_session_id=self.game_id)
#         player.ready = True
#         player.save()

#         game_session = GameSession.objects.get(id=self.game_id)
#         all_ready = Player.objects.filter(game_session=game_session, ready=True).count()
#         if all_ready == 2:
#             game_session.status = 'A'
#             game_session.save()
#             return {'type': 'game_start'}
#         return {'type': 'player_ready', 'user_id': self.user.id}
    
#     async def handle_player_move(self, data):
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'player_move',
#                 'user_id': self.user.id,
#                 'movement': data.get('movement', {}),
#             }
#         )

#     async def move(self, data):
#         await self.handle_player_move(data)

#     async def ready(self, data):
#         response = await self.handle_player_ready()
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             response
#         )

#     async def handle_game_action(self, data):
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_action',
#                 'action': data.get('action', ''),
#                 'data': data.get('data', {}),
#             }
#         )

#     async def game_update(self, event):
#         await self.send(text_data=json.dumps(event))
    
#     async def game_action(self, event):
#         await self.send(text_data=json.dumps(event))
    
#     async def player_ready(self, event):
#         await self.send(text_data=json.dumps(event))

#     async def game_start(self, event):
#         await self.send(text_data=json.dumps(event))

