from django.db import models
from authentication.models import User
import random
import time as import_time
from django.contrib.auth import get_user_model

User = get_user_model()

class MatchHistory(models.Model):
    game_id = models.IntegerField(unique=True)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_player2')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_won')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    game_type = models.CharField(max_length=50, default='classic')
    played_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(help_text='Duration of the game in seconds')
    class Meta:
        ordering = ['-played_at']

