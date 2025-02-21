from .models import MatchHistory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from authentication.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_history(request, user_id):
    """
    Get match history for a specific user.
    This replaces the ViewSet's list method.
    """
    if user_id:
        matches = MatchHistory.objects.filter(
            models.Q(player1=user_id) | models.Q(player2=user_id)
        )
        # Note: You might want to add serialization here depending on your needs
        return Response(matches)
    return Response({'error': 'User ID is required'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_winrate(request, user_id):
    """
    Get winrate for a specific user.
    This replaces the ViewSet's winrate action.
    """
    if user_id:
        winrate = MatchHistory.get_winrate(user_id)
        return Response({'winrate': winrate})
    return Response({'error': 'User ID is required'}, status=400)from .models import MatchHistory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from authentication.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_history(request, user_id):
    """
    Get match history for a specific user.
    This replaces the ViewSet's list method.
    """
    if user_id:
        matches = MatchHistory.objects.filter(
            models.Q(player1=user_id) | models.Q(player2=user_id)
        )
        # Note: You might want to add serialization here depending on your needs
        return Response(matches)
    return Response({'error': 'User ID is required'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_winrate(request, user_id):
    """
    Get winrate for a specific user.
    This replaces the ViewSet's winrate action.
    """
    if user_id:
        winrate = MatchHistory.get_winrate(user_id)
        return Response({'winrate': winrate})
    return Response({'error': 'User ID is required'}, status=400)