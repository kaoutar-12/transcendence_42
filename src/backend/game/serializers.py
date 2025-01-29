from rest_framework.response import serializers
from authentication.models import User
from authentication.serializers import UserSerializer
from .models import GameSession, Player

class PlayerSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	class Meta:
		model = Player
		fields = ['id', 'user', 'score', 'side', 'ready']	

class GameSessionSerializer(serializers.ModelSerializer):
	Player = PlayerSerializer(many=True, read_only=True, source='player_set')
	class Meta:
		model = GameSession
		fields = ['id', 'players', 'state', 'winner', 'created_at', 'updated_at']
