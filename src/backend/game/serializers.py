from rest_framework.serializers import ModelSerializer
from authentication.models import User
from authentication.serializers import UserSerializer
from .models import MatchHistory

class MatchHistorySerializer(ModelSerializer):
    player1 = UserSerializer()
    player2 = UserSerializer()
    winner = UserSerializer()
    class Meta:
        model = MatchHistory
        fields = [
            'id',
            'game_id',
            'player1_username',
            'player2_username',
            'winner_username',
            'player1_score',
            'player2_score',
            'game_type',
            'played_at',
            'duration'
        ]
