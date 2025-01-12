import json
from channels.generic.websocket import WebsocketConsumer
from .models import GameSession, Player, GameHistory
from authentication.models import User


class GameConsumer(WebsocketConsumer):
	# implementation of the consumer
	# ...
	# i should implement the connect disconnecct receive methods
	a = None