from rest_framework.serializers import ModelSerializer
from authentication.models import User
from authentication.serializers import UserSerializer
from .models import GameSession, Player, QueuePosition, QueueState, GameHistory

class PlayerSerializer(ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Player
        fields = ['id', 'user', 'score', 'side', 'ready']    

class GameSessionSerializer(ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True, source='player_set')
    class Meta:
        model = GameSession
        fields = ['id', 'players', 'state', 'winner', 'created_at', 'updated_at']

class GameHistorySerializer(ModelSerializer):
    game = GameSessionSerializer(read_only=True)
    class Meta:
        model = GameHistory
        fields = ['id', 'game', 'player1_score', 'player2_score', 'duration', 'completed']

