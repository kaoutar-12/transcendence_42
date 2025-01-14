from django.db import models
from authentication.models import User

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

class Player(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
	score = models.IntegerField(default=0)
	side = models.CharField(max_length=10)  # 'lefft' or 'right'
	ready = models.BooleanField(default=False)
	class Meta:
		unique_together = ['game_session', 'side']
class GameHistory(models.Model):
	game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
	player1_score = models.IntegerField()
	player2_score = models.IntegerField()
	duration = models.DurationField()
	completed = models.BooleanField(default=False)