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
    
    @classmethod
    def get_winrate(cls, user_id):
        total_matches = cls.objects.filter(models.Q(player1_id=user_id) | models.Q(player2_id=user_id)).count()
        if total_matches == 0:
            return 0
        wins = cls.objects.filter(winner_id=user_id).count()
        return round((wins / total_matches) * 100, 2)
    
    @classmethod
    def get_total_matches_wins(cls, user_id):
        wins = cls.objects.filter(winner_id=user_id).count()
        return wins

    @classmethod
    def get_total_matches_losses(cls, user_id):
        losses = cls.objects.filter(models.Q(player1_id=user_id) | models.Q(player2_id=user_id)).exclude(winner_id=user_id).count()
        return losses

