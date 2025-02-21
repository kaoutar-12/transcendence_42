from .models import MatchHistory
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
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
