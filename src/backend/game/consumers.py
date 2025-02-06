import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import QueuePosition, GameSession, Player
from django.contrib.auth import get_user_model
import random
import asyncio
import time
from math import sqrt


class serverPongGame:
    def __init__(self, width=1300,height=600):
        self.width = width
        self.height = height
        self.paddle_width = 10
        self.paddle_height = 120
        self.paddle_speed = 8
        self.ball_size = 10
        self.ball_speed = 5
        self.max_bounce_angle = 75
        self.last_update = time.time()
    
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
        self.room_group_name = f'game_{self.game_id}'
        if not await self.is_player():
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'You are not a player in this game'
            }))
            await self.close()
            return
        self.game = serverPongGame()
        is_first = await self.is_first_player()
        if is_first:
            self.game_state = self.game.create_initial_state()
            await self.save_game_state()
            asyncio.create_task(self.game_loop())

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        current_state = await self.get_game_state()
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': current_state
        }))
    
    async def disconnect(self, close_code):
        if hasattr(self, 'game_id'):
            game = await self.get_game_session()
            if game.status != 'F':
                game.status = 'F'
                await self.save_game_state()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'reason': 'disconnected'
                    }
                )
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data['type'] == 'paddle_move':
                player = await self.get_player()
                if not player:
                    return
            # validate movement
            if data['movement'] not in ['up', 'down', 'stop']:
                return

            #broadcast the movement
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddle_move',
                    'side': player.side,
                    'movement': data['movement']
                }
            )
        except json.JSONDecodeError:
            pass
    
    async def game_loop(self):
        while True:
            game_state = await self.get_game_state()
            paddle_movements = {}
            players = await self.get_players()
            for player in players:
                paddle_movements[player.side] = player.movement
            # update game state
            new_game_state, event = self.game.update(game_state, paddle_movements)
            await self.save_game_state(new_game_state)

            # broadcast game state
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': new_game_state
                }
            )

            # handle score
            if event:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'event',
                        'event': event
                    }
                )
            # sleep
            await asyncio.sleep(1/60) # 60 fps
    
    @database_sync_to_async
    def get_players(self):
        return list(Player.objects.filter(game_session_id=self.game_id))

    @database_sync_to_async
    def is_player(self):
        return Player.objects.filter(
            user=self.user,
            game_session_id=self.game_id
        ).exists()

    @database_sync_to_async
    def is_first_player(self):
        return Player.objects.filter(
          game_session_id=self.game_id).count() == 1
    
    @database_sync_to_async
    def get_player(self):
        try:
            return Player.objects.get(
                user=self.user,
                game_session_id=self.game_id
            )
        except Player.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_game_state(self):
        game = GameSession.objects.get(id=self.game_id)
        return json.loads(game.state) if game.state else None
    
    @database_sync_to_async
    def save_game_state(self, state):
        game = GameSession.objects.get(id=self.game_id)
        game.state = json.dumps(state)
        game.save()
    
    @database_sync_to_async
    def get_paddle_movements(self):
        return Player.objects.get(
            user=self.user,
            game_session_id=self.game_id
        ).movement
    
    @database_sync_to_async
    def update_paddle_movement(self, movement):
        player = Player.objects.get(
            user=self.user,
            game_session_id=self.game_id
        )
        player.movement = movement
        player.save()
    
    @database_sync_to_async
    def get_game_session(self):
        return GameSession.objects.get(id=self.game_id)

    @database_sync_to_async
    def get_paddle_movements(self, status):
        game = GameSession.objects.get(id=self.game_id)
        game.status = status
        game.save()
        return True
    
    # @database_sync_to_async
    # def save_game_history(self, winner):
    
    @database_sync_to_async
    def check_win_condition(self, game_state):
        if game_state['paddles']['left']['score'] >= 5:
            return 'left'
        elif game_state['paddles']['right']['score'] >= 5:
            return 'right'
        return None




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
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )

    
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

