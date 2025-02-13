from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/queue/(?P<game_type>pong|tictactoe)/', consumers.QueueConsumer.as_asgi()),
	re_path(r'ws/game/pong/(?P<game_id>\d+)/', consumers.PongGameConsumer.as_asgi()),
	re_path(r'ws/game/tictactoe/(?P<game_id>\d+)/', consumers.TicTacToeConsumer.as_asgi()),
	re_path(r'ws/game/invite/', consumers.InviteConsumer.as_asgi()),
]