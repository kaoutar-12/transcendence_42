from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction, models
from .models import QueueState, QueuePosition, GameSession, Player
from authentication.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
import random
# Create your views here.


class QueueManager:
	# join queue
	@staticmethod
	@transaction.atomic
	def join_queue(user):
		try:
			# check is user alredy in queue
			if QueuePosition.objects.filter(user_id=user.id).exists():
				return JsonResponse({'error': 'User already in queue'}, status=400)
			#find if queue state in db otherwise well have to create one
			queue_state, created = QueueState.objects.get_or_create(id=1)
			# create new queue position
			position = queue_state.total_players + 1
			# create that position for the player
			queue_position = QueuePosition.objects.create(position=position,\
								user_id=user.id)
			# update the queue state
			queue_state.total_players = position
			queue_state.save()
			if queue_state.total_players % 2 == 0:
				QueueManager.create_match()
			return JsonResponse({'success': 'User added to queue'},\
					    status=200)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	# leave queue
	@staticmethod
	@transaction.atomic
	def leave_queue(user):
		try:
			# find and then will delete the user from the queue
			queue_position = QueuePosition.objects.get(user_id=user.id)
			curr_position = queue_position.position
			queue_position.delete()
			# update postions of the older players
			QueuePosition.objects.filter(
				position__gt = curr_position
			).update(position=models.F('position') - 1)
			# update total players in the queue
			queue_state = QueueState.objects.get(id=1)
			queue_state.total_players -= 1
			queue_state.save()
			return JsonResponse({'success': 'User removed from queue'},\
					    status=200)
		except ObjectDoesNotExist:
			return JsonResponse({'error': 'User not in queue'})
		except Exception as e:
			return JsonResponse({'error': str(e)})
	# create match
	@staticmethod
	@transaction.atomic
	def create_match():
		try:
			# i should get two  players from the out of the queue and create a game session=
			players = QueuePosition.objects.order_by('position')[:2]
			if players.count() < 2:
				return JsonResponse({'error': 'Not enough players in the queue'})
			# create game session
			game_session = GameSession.objects.create()
			sides = ['left', 'right']
			if random.randint & 1:
				sides.reverse()
			random.shuffle(sides)
			#create players
			for i, player in enumerate(players):
				Player.objects.create(user=player.user,\
					game_session=game_session,\
					side=sides[i])
				player.delete()
			# update queue status
			queue_state = QueueState.objects.get(id=1)
			queue_state.total_players -= 2
			queue_state.save()
			QueuePosition.objects.filter(
				position__gt=2
			).update(position=models.F('position') - 2)
			return JsonResponse({'success': 'Match created'})
		except Exception as e:
			return JsonResponse({'error': str(e)})

@require_http_methods(['POST'])
def join_queue(request):
	user = request.user
	return QueueManager.join_queue(user)

@require_http_methods(['POST'])
def leave_queue(request):
	user = request.user
	return QueueManager.leave_queue(user)