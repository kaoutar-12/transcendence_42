from .models import MatchHistory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from authentication.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_history(request, user_id):
    if user_id:
        matches = MatchHistory.objects.filter(
            models.Q(player1=user_id) | models.Q(player2=user_id)
        )
        return Response({
			'matches': [
				{
					'game_id': match.game_id,
					'player1': match.player1.username,
					'player2': match.player2.username,
					'winner': match.winner.username,
					'player1_score': match.player1_score,
					'player2_score': match.player2_score,
					'game_type': match.game_type,
					'played_at': match.played_at,
					'duration': match.duration
				} for match in matches
			]
		})
    return Response({'error': 'User ID is required'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_winrate(request, user_id):
    if user_id:
        winrate = MatchHistory.get_winrate(user_id)
        return Response({'winrate': winrate})
    return Response({'error': 'User ID is required'}, status=400)