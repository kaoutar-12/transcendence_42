from django.test import TestCase
from authentication.models import User
from game.models import GameSession, Player, GameHistory
from django.utils import timezone
from datetime import timedelta

def create_user(username, email, password):
	return User.objects.create_user(username=username, email=email, password=password)

def create_game_session():
	return GameSession.objects.create()

def create_player(user, game_session, side):
	return Player.objects.create(user=user, game_session=game_session, side=side)

def create_game_history(game_session, player1_score, player2_score, duration, completed):
	return GameHistory.objects.create(game_session=game_session, player1_score=player1_score, player2_score=player2_score, duration=duration, completed=completed)

class GameSessionModelTest(TestCase):
    def setUp(self):
        #create two users for all the testcases
        self.user1 = create_user("player1", "player1@test.com", "password123")
        self.user2 = create_user("player2", "player2@test.com", "password123")
        
    def test_game_session_creation(self):
        # create a game__session
        game_session = create_game_session()
        self.assertTrue(isinstance(game_session, GameSession))
        self.assertEqual(game_session.status, 'P')
        self.assertEqual(game_session.winner, None)
    
    def test_player_creation(self):
        game_session = create_game_session()
        player1 = create_player(self.user1, game_session, 'left')
        player2 = create_player(self.user2, game_session, 'right')
        
        self.assertEqual(player1.user, self.user1)
        self.assertEqual(player2.user, self.user2)
        self.assertEqual(player1.game_session, game_session)
        
    def test_game_history_creation(self):
        game_session = create_game_session()
        duration = timedelta(seconds=300)  # 5 minutes
        history = create_game_history(
            game_session=game_session,
            player1_score=5,
            player2_score=3,
            duration=duration,
            completed=True
        )
        
        self.assertEqual(history.game_session, game_session)
        self.assertEqual(history.player1_score, 5)
        self.assertEqual(history.player2_score, 3)
        self.assertEqual(history.duration, duration)
        self.assertTrue(history.completed)