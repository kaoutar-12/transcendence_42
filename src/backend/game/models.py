from django.db import models
from authentication.models import User
import random
import time as import_time

#pong game logic class sql
class PongGame:
    def __init__(self, width=500, height=500):
        self.width = width
        self.height = height
        self.paddle_height = 1
        self.paddle_width = 1
        self.ball_size = 1
        self.ball_speed = 1
        self.paddle_speed = 15

    def init_state(self):
        return {
            'ball': {
                'x': 666,
                'y': 666,
                'vx': self.ball_speed * random.choice([-1, 1]),
                'vy': self.ball_speed * random.choice([-0.5, 0.5])
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
            'gameStatus': 'playing',
            'score': {'left': 0, 'right': 0},
            'lastUpdate': None
        }

    def update(self, state, delta_time=1/60):
        if state.get('gameStatus') != 'playing':
            return None

        #	update ball position
       
        # ball collision with top and bottom

        # Ball collision with paddles
        
        
        #check Left paddle collision
        

        # check right paddle collision
        
        # Scoring
        scored = random.choice([None, 'left', 'right'])
        return scored


#queue management sql
class QueueState(models.Model):
    id = models.AutoField(primary_key=True, default=1)
    total_players = models.IntegerField(default=0)
    class Meta:
        db_table = 'queue_state'

#queue position player management sql
class QueuePosition(models.Model):
    position = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'queue_position'

#gamesession management sql
class GameSession(models.Model):
    status_choices = (
        ('P', 'Pending'),
        ('A', 'Active'),
        ('F', 'Finished'),
    )
    status = models.CharField(max_length=1, choices=status_choices, default='P')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    state = models.JSONField(null=True, blank=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        ordering = ['-create_date']

#player management sql
class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    side = models.CharField(max_length=10)  # 'lefft' or 'right'
    ready = models.BooleanField(default=False)
    movement = models.CharField(max_length=10, null=True, blank=True)
    class Meta:
        unique_together = ['game_session', 'side']

#game history management sql
class GameHistory(models.Model):
    game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    duration = models.DurationField()
    completed = models.BooleanField(default=False)