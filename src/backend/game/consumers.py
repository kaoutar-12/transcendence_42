import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import random
import asyncio
import time
import math
from math import sqrt
from django.db import transaction, models
from .models import MatchHistory
import json
from asgiref.sync import async_to_sync
from .memory_storage import MemoryStorage

class serverPongGame:
    def __init__(self, width=1300,height=600):
        self.width = width
        self.height = height
        self.paddle_width = 10
        self.paddle_height = 120
        self.paddle_speed = 5
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
            game_state['winner'] = 'left'
            return game_state, 'game_over'
        elif game_state['paddles']['right']['score'] >= self.score_limit:
            game_state['game_status'] = 'finished'
            game_state['winner'] = 'right'
            return game_state, 'game_over'

        current_time = time.time()
        delta_time = current_time - game_state['timestamp']
        game_state['timestamp'] = current_time

        for side, movement in paddle_movements.items():
            if movement == 'up':
                game_state['paddles'][side]['y'] = max(
                    game_state['paddles'][side]['y'] - self.paddle_speed,
                    0
                )
            elif movement == 'down':
                game_state['paddles'][side]['y'] = min(
                    game_state['paddles'][side]['y'] + self.paddle_speed,
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
        # convert to rad
        angle_rad = bounce_angle * (3.14159 / 180)
        direction = 1 if side == 'left' else -1
        ball['dx'] =direction * self.ball_speed * abs(math.cos(angle_rad))
        ball['dy'] = -self.ball_speed * math.sin(angle_rad)
    
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
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        if await self.is_game_finished():
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Game already finished'
            }))
            await self.close()
            return
        self.game = serverPongGame()
        self.room_group_name = f'game_{self.game_id}'
        # handle reconnection
        game_state = MemoryStorage.get_game_state(self.game_id)
        is_reconnect = False
        if self.game_id in self.sides:
            for side, user_id in self.sides[self.game_id].items():
                if user_id == self.user.id:
                    is_reconnect = True
                    break
        # handle new connection
        if not is_reconnect:
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
        if not game_state:
            game_state = self.game.create_initial_state()
            MemoryStorage.save_game_state(self.game_id, game_state)
            asyncio.create_task(self.game_loop())
        elif game_state.get('game_status') == 'playing':
            if not any(task.get_name() == f'game_loop_{self.game_id}' for task in asyncio.all_tasks()):
                asyncio.create_task(self.game_loop(), name=f'game_loop_{self.game_id}')

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': game_state,
            'side': self.get_user_side()
        }))

    @database_sync_to_async
    def is_game_finished(self):
        return MatchHistory.objects.filter(game_id=self.game_id).exists()
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
    def get_winner(self):
        game_state = MemoryStorage.get_game_state(self.game_id)
        if not game_state:
            return None
        if game_state and game_state.get('game_status') == 'finished':
            return game_state.get('winner')
        if game_state['paddles']['left']['score'] > game_state['paddles']['right']['score']:
            return 'left'
        elif game_state['paddles']['left']['score'] < game_state['paddles']['right']['score']:
            return 'right'
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
            # check if its a real disconnection
            game_state = MemoryStorage.get_game_state(self.game_id)
            if game_state and game_state.get('game_status') == 'playing':
                asyncio.create_task(self.handle_disconnect_timeout(disconnect_side, winner_side))

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    async def handle_disconnect_timeout(self, disconnect_side, winner_side):
        await asyncio.sleep(5)
        game_state = MemoryStorage.get_game_state(self.game_id)
        if game_state and game_state.get('game_status') == 'playing':
            game_state['game_status'] = 'finished'
            game_state['timestamp'] = time.time()
            game_state['paddles'][winner_side]['score'] = 1
            game_state['winner'] = winner_side
            MemoryStorage.save_game_state(self.game_id, game_state)
            print(f"player disconnected side {disconnect_side}")
            print(f"Game over {game_state}")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner_side,
                    'reason': 'player_disconnected',
                    'side': disconnect_side
                }
            )
            MemoryStorage.delete_game(self.game_id)

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
                if not game_state:
                    break
                if game_state and game_state.get('game_status') == 'finished':
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_over',
                            'winner': game_state.get('winner'),
                            'reason': 'game_finished'
                        }
                    )
                    break
            
            movements = MemoryStorage.get_player_movements(self.game_id)
            paddle_movements = {}
            if self.game_id in self.sides:
               for side, user_id in self.sides[self.game_id].items():
                   if str(user_id) in movements:
                       paddle_movements[side] = movements[str(user_id)]

            # print(f"Game loop after movemenets after {paddle_movements}")
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
        is_winner = event['winner'] == self.get_user_side()
        await self.save_match_history()
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'reason': event.get('reason', 'game_finished'),
            'winner': self.get_winner(),
            'side': self.get_user_side(),
            'redirect': {
                'game_id': self.game_id,
                'result': 'win' if is_winner else 'lose',
                'side': self.get_user_side()
            }
        }))
        if event.get('reason') == 'game_finished':
            MemoryStorage.delete_game(self.game_id)
            if self.game_id in self.sides:
                del PongGameConsumer.sides[self.game_id]
    async def save_match_history(self):
        game_state = MemoryStorage.get_game_state(self.game_id)
        if not game_state or game_state.get('game_status') != 'finished':
            return
            
        player_sides = self.sides.get(self.game_id, {})
        player1_id = player_sides.get('left')
        player2_id = player_sides.get('right')
        if not player1_id or not player2_id:
            return
            
        start_time = game_state.get('start_time', game_state['timestamp'])
        duration = int(time.time() - start_time)
        left_score = game_state['paddles']['left']['score']
        right_score = game_state['paddles']['right']['score']
        winner_id = player1_id if left_score > right_score else player2_id

        @database_sync_to_async
        def save_match_history():
            try:
                # Check if match already exists
                if not MatchHistory.objects.filter(game_id=self.game_id).exists():
                    match = MatchHistory(
                        game_id=self.game_id,
                        player1_id=player1_id,
                        player2_id=player2_id,
                        winner_id=winner_id,
                        player1_score=left_score,
                        player2_score=right_score,
                        duration=duration
                    )
                    match.save()
            except Exception as e:
                print(f"Error saving match history: {e}")
                pass  # Continue even if save fails

        await save_match_history()



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
