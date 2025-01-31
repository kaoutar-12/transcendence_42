from django.urls import path
from . import views

urlpatterns = [
	path('join/', views.join_queue, name='join_queue'),
	path('leave/', views.leave_queue, name='leave_queue'),
	path('create/', views.create_match, name='create_match'),
	path('game_history/', views.get_game_history, name='game_history'),
	path('active_games/', views.get_active_game, name='get_active_game'),
	path('game_info/<int:game_id>/', views.get_game_info, name='get_game_info'),
	path('game_state/<int:game_id>/', views.get_game_state, name='get_game_state'),
]