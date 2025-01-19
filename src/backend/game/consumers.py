import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import GameSession, Player, GameHistory
from authentication.models import User
from channels.db import database_sync_to_async


class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.room_group_name = f'game_{self.game_id}'
		self.user = self.scope['user']

		# Join room group
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		is_player = await self.is_player()
		if not is_player:
			await self.close()
			return
		await self.accept()
		game_state = await self.get_game_state()
		await self.send(text_data=json.dumps(game_state))
	
	async def disconnect(self, close_code):
		# Leave room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
	
	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			message_type = data.get('type')
			if message_type == 'player_move':
				await self.move(data)
			elif message_type == 'player_ready':
				await self.ready(data)
			elif message_type == 'game_action':
				await self.handle_game_action(data)
		except json.JSONDecodeError as e:
			await self.send(text_data=json.dumps({
				'error': 'Invalid JSON format'
			}))
		
	@database_sync_to_async
	def get_game_state(self):
		game_session = GameSession.objects.get(id=self.game_id)
		players = Player.objects.filter(game_session=game_session)

		return {
			'type': 'game_state',
			'id' : game_session.id,
			'state': game_session.status,
			'players': [
				{
					'id': player.user.id,
					'username': player.user.username,
					'score': player.score,
					'side': player.side,
					'ready': player.ready
				}
				for player in players
			]
		}
	
	@database_sync_to_async
	def handle_player_ready(self):
		player = Player.objects.get(user=self.user, game_session_id=self.game_id)
		player.ready = True
		player.save()

		game_session = GameSession.objects.get(id=self.game_id)
		all_ready = Player.objects.filter(game_session=game_session, ready=True).count()
		if all_ready == 2:
			game_session.status = 'A'
			game_session.save()
			return {'type': 'game_start'}
		return {'type': 'player_ready', 'user_id': self.user.id}
	
	async def handle_player_move(self, data):
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'player_move',
				'user_id': self.user.id,
				'movement': data.get('movement', {}),
			}
		)

	async def handle_game_action(self, data):
		#handle game actione like scoring and game events
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'game_action',
				'action': data.get('action', ''),
				'data': data.get('data', {}),
			}
		)

	async def game_update(self, event):
		await self.send(text_data=json.dumps(event))
	
	async def game_action(self, event):
		await self.send(text_data=json.dumps(event))
	
	async def player_ready(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_start(self, event):
		await self.send(text_data=json.dumps(event))
	