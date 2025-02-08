import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import random
import asyncio
import time
from math import sqrt
from django.db import transaction, models
from .models import QueuePosition, QueueState, GameSession, Player
import json
from asgiref.sync import async_to_sync
from .memory_storage import MemoryStorage
class serverPongGame:
    def __init__(self, width=1300,height=600):
        self.width = width
        self.height = height
        self.paddle_width = 10
        self.paddle_height = 120
        self.paddle_speed = 50
        self.ball_size = 10
        self.ball_speed = 5
        self.max_bounce_angle = 75
        self.last_update = time.time()
        self.score_limit = 1
    
    def create_initial_state(self):
        return {
            'ball': {
                'x': self.width / 2,
                'y': self.height / 2,
                'dx': random.choice([-1, 1]) * self.ball_speed,
                'dy': random.choice([-1, 1]) * self.ball_speed
            },
            'paddles': {
                'left': {
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
    
    def update(self, game_state, paddle_movements):
        if game_state['game_status'] != 'playing':
            return game_state, None
        
        #check score limit
        if game_state['paddles']['left']['score'] >= self.score_limit:
            game_state['game_status'] = 'finished'
            return game_state, 'left_win'
        elif game_state['paddles']['right']['score'] >= self.score_limit:
            game_state['game_status'] = 'finished'
            return game_state, 'right_win'

        current_time = time.time()
        delta_time = current_time - game_state['timestamp']
        game_state['timestamp'] = current_time

        for side, movement in paddle_movements.items():
            if movement == 'up':
                game_state['paddles'][side]['y'] = max(
                    game_state['paddles'][side]['y'] - self.paddle_speed * delta_time,
                    0
                )
            elif movement == 'down':
                game_state['paddles'][side]['y'] = min(
                    game_state['paddles'][side]['y'] + self.paddle_speed * delta_time,
                    self.height - self.paddle_height
                )
        
        ball = game_state['ball']
        timeframe = delta_time * 60
        ball['x'] += ball['dx'] * timeframe
        ball['y'] += ball['dy'] * timeframe

        # collid with top / bottom
        if ball['y'] - self.ball_size/2 <= 0:
            ball['y'] = self.ball_size/2
            ball['dy'] = abs(ball['dy'])
        elif ball['y'] + self.ball_size/2 >= self.height:
            ball['y'] = self.height - self.ball_size/2
            ball['dy'] = -abs(ball['dy'])
        
        # is it collid with paddles
        if (ball['x'] - self.ball_size/2 <= self.paddle_width and
            game_state['paddles']['left']['y'] <= ball['y'] <=
            game_state['paddles']['left']['y'] + self.paddle_height):
            ball['x'] = self.paddle_width + self.ball_size/2
            self.handle_paddle_collision(game_state, 'left')
        elif (ball['x'] + self.ball_size/2 >= self.width - self.paddle_width and
                game_state['paddles']['right']['y'] <= ball['y'] <=
                game_state['paddles']['right']['y'] + self.paddle_height):
            ball['x'] = self.width - self.paddle_width - self.ball_size/2
            self.handle_paddle_collision(game_state, 'right')
        
        # is its scored
        if ball['x'] <= 0:
            game_state['paddles']['right']['score'] += 1
            ball = self._reset_ball(game_state, direction=1)
            return game_state, 'left_scored'
        elif ball['x'] >= self.width:
            game_state['paddles']['left']['score'] += 1
            ball = self._reset_ball(game_state, direction=-1)
            return game_state, 'right_scored'
        return game_state, None

    def handle_paddle_collision(self, game_state, side):
        ball = game_state['ball']
        paddle = game_state['paddles'][side]

        # intersection
        inter_y = (paddle['y'] + (self.paddle_height / 2)) - ball['y']
        norm_inter_y = inter_y / (self.paddle_height / 2)
        bounce_angle = norm_inter_y * self.max_bounce_angle
        speed = sqrt(ball['dx'] ** 2 + ball['dy'] ** 2)*1.05
        direction = 1 if side == 'left' else -1
        ball['dx'] =direction * speed
        ball['dy'] = -speed * (inter_y / abs(inter_y))
    
    def _reset_ball(self, game_state , direction):
        ball = game_state['ball']
        ball['x'] = self.width / 2
        ball['y'] = self.height / 2
        ball['dx'] = direction * self.ball_speed
        ball['dy'] = random.choice([-1, 1]) * self.ball_speed
        game_state['timestamp'] = time.time()

class PongGameConsumer(AsyncWebsocketConsumer):
    sides = {}
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
        self.game = serverPongGame()
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'

        # init player side
        if self.game_id not in self.sides:
            self.sides[self.game_id] = {}
        if len(self.sides[self.game_id]) < 2:
            if self.user.id not in self.sides[self.game_id].values():
                available_sides = ['left', 'right']
                user_sides = list(self.sides[self.game_id].keys())
                for side in available_sides:
                    if side not in user_sides:
                        self.sides[self.game_id][side] = self.user.id
                        break
        # Get or create game state
        game_state = MemoryStorage.get_game_state(self.game_id)
        if not game_state:
            game_state = self.game.create_initial_state()
            MemoryStorage.save_game_state(self.game_id, game_state)
            asyncio.create_task(self.game_loop())

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': game_state,
            'side': self.get_user_side()
        }))

    async def event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'event',
            'event': event['event']
        }))

    def get_user_side(self):
        if self.game_id in self.sides:
            for side, user_id in list(self.sides[self.game_id].items()):
                if user_id == self.user.id:
                    return side
        return None
    async def disconnect(self, close_code):
        if hasattr(self, 'game_id'):
            if self.game_id in self.sides:
                disconnect_side = None
                winner_side = None
                for side, user_id in self.sides[self.game_id].items():
                    if user_id == self.user.id:
                        disconnect_side = side
                        winner_side = 'left' if side == 'right' else 'right'
                        break

            game_state = MemoryStorage.get_game_state(self.game_id)
            if game_state and game_state.get('game_status') == 'playing':
                game_state['game_status'] = 'finished'
                game_state['timestamp'] = time.time()
                game_state['paddles'][winner_side]['score'] = 1
                game_state['winner'] = winner_side
            
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'winner': self.get_winner(),
                        'reason': 'player_disconnected',
                        'side': disconnect_side
                    }
                )
            MemoryStorage.delete_game(self.game_id)

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(data)
            if data['type'] == 'paddle_move':
                if data['movement'] not in ['up', 'down', 'stop']:
                    return

                MemoryStorage.save_player_movement(
                    self.game_id,
                    str(self.user.id),
                    data['movement']
                )

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'paddle_move',
                        'user_id': str(self.user.id),
                        'movement': data['movement']
                    }
                )
        except json.JSONDecodeError:
            pass

    async def game_loop(self):
        while True:
            game_state = MemoryStorage.get_game_state(self.game_id)
            if not game_state or game_state.get('game_status') != 'playing':
                break
            
            movements = MemoryStorage.get_player_movements(self.game_id)
            print(f"Game loop  movemenets before {movements}")
            print(f"Game loop  sides before {self.sides}")
            paddle_movements = {}
            if self.game_id in self.sides:
               for side, user_id in self.sides[self.game_id].items():
                   if str(user_id) in movements:
                       paddle_movements[side] = movements[str(user_id)]

            print(f"Game loop after movemenets after {paddle_movements}")
            new_game_state, event = self.game.update(game_state, paddle_movements)
            MemoryStorage.save_game_state(self.game_id, new_game_state)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': new_game_state
                }
            )

            if event:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'event',
                        'event': event
                    }
                )

            await asyncio.sleep(1/60)  # 60 fps

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    async def paddle_move(self, event):
        await self.send(text_data=json.dumps({
            'type': 'paddle_move',
            'user_id': event['user_id'],
            'movement': event['movement']
        }))
    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'reason': event['reason'],
            'winner': self.get_winner(),
            'side': self.get_user_side()
        }))

class QueueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return

        await self.accept()
        self.room_name = f'queue_{self.user.id}'
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        is_in_queue = MemoryStorage.is_in_queue(self.user.id)
        await self.send(text_data=json.dumps({
            'type': 'queue_status',
            'in_queue': is_in_queue
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            MemoryStorage.remove_from_queue(self.user.id)
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        if not self.user.is_authenticated:
            return

        try:
            data = json.loads(text_data)
            if data['type'] == 'join_queue':
                should_create_match = MemoryStorage.add_to_queue(self.user.id)
                await self.send(text_data=json.dumps({
                    'type': 'success',
                    'message': 'Joined queue'
                }))

                if should_create_match:
                    await self.create_match()

            elif data['type'] == 'leave_queue':
                MemoryStorage.remove_from_queue(self.user.id)
                await self.send(text_data=json.dumps({
                    'type': 'success',
                    'message': 'Left queue'
                }))
        except json.JSONDecodeError:
            pass
    
    async def create_match(self):
        players = MemoryStorage.get_match_players()
        if not players:
            return

        # Create new game session
        game_id = MemoryStorage.generate_game_id()
        game_state = serverPongGame().create_initial_state()
        MemoryStorage.save_game_state(game_id, game_state)

        # Notify players
        for player_id in players:
            await self.channel_layer.group_send(
                f'queue_{player_id}',
                {
                    'type': 'notify_match_created',
                    'game_id': game_id
                }
            )

    async def notify_match_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_created',
            'game_id': event['game_id']
        })) 
