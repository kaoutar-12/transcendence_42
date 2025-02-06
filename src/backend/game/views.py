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

class QueueManager:
    @staticmethod
    @transaction.atomic
    def join_queue(user):
        try:
            # Check if user is already in queue
            if QueuePosition.objects.filter(user=user).exists():
                return {'error': 'User already in queue'}, 400
                
            # Get or create queue state
            queue_state, _ = QueueState.objects.get_or_create(id=1)
            position = queue_state.total_players + 1
            
            # Add user to queue
            QueuePosition.objects.create(
                position=position,
                user=user
            )
            
            queue_state.total_players = position
            queue_state.save()
            
            # Notify user they joined queue
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'queue_{user.id}',
                {
                    'type': 'notify_queue_status',
                    'status': 'joined'
                }
            )
            
            # Check if we can start a game
            if queue_state.total_players >= 2:
                QueueManager.create_match()
                
            return {'success': 'User added to queue'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    @transaction.atomic 
    def create_match():
        try:
            # Get first two players in queue
            players = QueuePosition.objects.order_by('position')[:2]
            if players.count() < 2:
                return {'error': 'Not enough players'}, 400

            # Create game session
            game_session = GameSession.objects.create(status='A')
            
            # Initialize Pong game state
            game = serverPongGame()
            initial_state = game.create_initial_state()
            game_session.state = json.dumps(initial_state)
            game_session.save()
            
            # Randomly assign sides
            sides = ['left', 'right']
            random.shuffle(sides)
            
            channel_layer = get_channel_layer()
            
            # Create players and notify them
            for i, queued_player in enumerate(players):
                Player.objects.create(
                    user=queued_player.user,
                    game_session=game_session,
                    side=sides[i]
                )
                
                # Notify player about match creation
                async_to_sync(channel_layer.group_send)(
                    f'queue_{queued_player.user.id}',
                    {
                        'type': 'notify_match_created',
                        'game_id': game_session.id
                    }
                )
                
                # Remove player from queue
                queued_player.delete()
            
            # Update queue state
            queue_state = QueueState.objects.get(id=1)
            queue_state.total_players -= 2
            queue_state.save()
            
            # Update remaining players' positions
            QueuePosition.objects.filter(
                position__gt=2
            ).update(position=models.F('position') - 2)
            
            return {'success': 'Match created', 'game_id': game_session.id}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

    @staticmethod
    @transaction.atomic
    def leave_queue(user):
        try:
            queue_position = QueuePosition.objects.get(user=user)
            current_position = queue_position.position
            queue_position.delete()
            
            QueuePosition.objects.filter(
                position__gt=current_position
            ).update(position=models.F('position') - 1)
            
            queue_state = QueueState.objects.get(id=1)
            queue_state.total_players -= 1
            queue_state.save()
            
            # Notify user they left queue
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'queue_{user.id}',
                {
                    'type': 'notify_queue_status',
                    'status': 'left'
                }
            )
            
            return {'success': 'User removed from queue'}, 200
            
        except QueuePosition.DoesNotExist:
            return {'error': 'User not in queue'}, 404
        except Exception as e:
            return {'error': str(e)}, 500


@api_view(['POST'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def join_queue(request):
	user = request.user
	return QueueManager.join_queue(user)

@api_view(['POST'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def leave_queue(request):
	user = request.user
	return QueueManager.leave_queue(user)

@api_view(['POST'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def create_match(request):
	try:
		game_session = GameSession.objects.create()
		Player.objects.create(user=request.user, game_session=game_session, side='left')
		return JsonResponse({'success': 'Match created', 'game_id': game_session.id})
	except Exception as e:
		return JsonResponse({'error': str(e)})
	
@api_view(['GET'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def get_active_game(request):
	games = GameSession.objects.filter(status='A')
	return Response({'games': GameSessionSerializer(games, many=True).data})

@api_view(['GET'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def get_game_info(request, game_id):
	try:
		game = GameSession.objects.get(id=game_id)
		players = Player.objects.filter(game_session=game)
		return Response({'game': GameSessionSerializer(game).data, 'players': PlayerSerializer(players, many=True).data})
	except ObjectDoesNotExist:
		return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def get_game_state(request, game_id):
	try:
		game = GameSession.objects.get(id=game_id)
		players = Player.objects.filter(game_session=game)
		return Response({'game': GameSessionSerializer(game).data, 'players': PlayerSerializer(players, many=True).data})
	except ObjectDoesNotExist:
		return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def get_game_history(request):
	history = GameHistory.objects.all()
	return Response({'history': GameHistorySerializer(history, many=True).data})