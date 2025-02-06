from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction, models
from .models import QueueState, QueuePosition, GameSession, Player, GameHistory
from authentication.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
import random
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import GameSessionSerializer, PlayerSerializer, GameHistorySerializer
from .consumers import serverPongGame
# Create your views here.

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import transaction
from .models import QueuePosition, GameSession, Player, QueueState
import random
