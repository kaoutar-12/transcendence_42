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
        return Response(matches)
    return Response({'error': 'User ID is required'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_winrate(request, user_id):
    if user_id:
        winrate = MatchHistory.get_winrate(user_id)
        return Response({'winrate': winrate})
    return Response({'error': 'User ID is required'}, status=400)