from .models import MatchHistory
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from authentication.models import User
# Create your views here.

class MatchHistoryViewSet(viewsets.ReadOnlyModelViewSet):
	permission_classes = [IsAuthenticated]
	def get_queryset(self):
		user_id = self.kwargs.get('user_id')
		if user_id:
			return MatchHistory.objects.filter(
				models.Q(player1=user_id) | models.Q(player2=user_id)
			)

	@action(detail=False, methods=['get'])
	def winrate(self, request, user_id=None):
		if user_id:
			winrate = MatchHistory.get_winrate(user_id)
			return Response({'winrate': winrate})
		return Response({'error': 'User ID is required'}, status=400)
