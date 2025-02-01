from django.db import models
from authentication.models import User
import random
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
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
	class Meta:
		ordering = ['-create_date']
	state = models.JSONField(default=dict)
	def init_state(self):
		self.state = {
			'ball':{
				'x': 666,
				'y': 666,
				'vx': random.choice([-1, 1]),
				'vy': random.choice([-1, 1]),
			},
			'leftpaddle':{
				'y': 666,
			},
			'rightpaddle':{
				'y': 666,
			},
			'score':{
				'left': 0,
				'right': 0,
			},
		}

#player management sql
class Player(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
	score = models.IntegerField(default=0)
	side = models.CharField(max_length=10)  # 'lefft' or 'right'
	ready = models.BooleanField(default=False)
	class Meta:
		unique_together = ['game_session', 'side']

#game history management sql
class GameHistory(models.Model):
	game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
	player1_score = models.IntegerField()
	player2_score = models.IntegerField()
	duration = models.DurationField()
	completed = models.BooleanField(default=False)