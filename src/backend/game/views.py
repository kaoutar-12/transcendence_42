from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction
from .models import QueueState, QueuePosition, GameSession, Player
from authentication.models import User
from django.core.exceptions import ObjectDoesNotExist
import random
# Create your views here.

class QueueManager:
	# join queue
	@staticmethod
	@transaction.atomic
	def join_queue(user):
		try:
			# check is user alredy in queue
			if QueuePosition.objects.filer(user=user).exists():
				return JsonResponse({'error': 'User already in queue'}, status=400)
			#find if queue state in db otherwise well have to create one
			queue_state, created = QueueState.objects.get_or_create(id=1)
			# create new queue position
			position = queue_state.total_players + 1
			# create that position for the player
			queue_position = QueuePosition.objects.create(position=position,\
								user=user)
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
			queue_position = QueuePosition.objects.get(user=user)
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
			return JsonResponse({'error': 'User not in queue'}, status=400)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	# create match
	@staticmethod
	@transaction.atomic
	def create_match():
		# i should get playes