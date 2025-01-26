from django.test import TestCase
from authentication.models import User
from game.models import GameSession, Player, GameHistory, QueueState, QueuePosition
from django.utils import timezone
from datetime import timedelta

def create_user(username, email, password):
    return User.objects.create_user(username=username, email=email, password=password)

def create_game_session():
    return GameSession.objects.create()

def create_player(user, game_session, side):
    return Player.objects.create(user=user, game_session=game_session, side=side)

def create_game_history(game_session, player1_score, player2_score, duration, completed):
    return GameHistory.objects.create(
        game_session=game_session,
        player1_score=player1_score,
        player2_score=player2_score,
        duration=duration,
        completed=completed
    )

def create_queue_state(total_players=0):
    return QueueState.objects.create(total_players=total_players)

def create_queue_position(position, user):
    return QueuePosition.objects.create(position=position, user=user)

class GameAndQueueTestCase(TestCase):
    def setUp(self):
        self.user1 = create_user("player1", "player1@test.com", "password123")
        self.user2 = create_user("player2", "player2@test.com", "password123")
        self.user3 = create_user("player3", "player3@test.com", "password123")
        self.queue_state = create_queue_state()

    def test_game_session_creation(self):
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
        duration = timedelta(seconds=300)
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

    def test_queue_state_creation(self):
        self.assertTrue(isinstance(self.queue_state, QueueState))
        self.assertEqual(self.queue_state.total_players, 0)
        
    def test_queue_state_update(self):
        self.queue_state.total_players = 3
        self.queue_state.save()
        updated_state = QueueState.objects.get(id=self.queue_state.id)
        self.assertEqual(updated_state.total_players, 3)

    def test_queue_position_creation(self):
        queue_pos1 = create_queue_position(1, self.user1)
        queue_pos2 = create_queue_position(2, self.user2)
        
        self.assertTrue(isinstance(queue_pos1, QueuePosition))
        self.assertEqual(queue_pos1.position, 1)
        self.assertEqual(queue_pos1.user, self.user1)
        self.assertTrue(queue_pos1.joined_at is not None)
        
        self.assertEqual(queue_pos2.position, 2)
        self.assertEqual(queue_pos2.user, self.user2)

    def test_queue_position_ordering(self):
        queue_pos2 = create_queue_position(2, self.user2)
        queue_pos1 = create_queue_position(1, self.user1)
        queue_pos3 = create_queue_position(3, self.user3)
        
        positions = QueuePosition.objects.all().order_by('position')
        self.assertEqual(positions[0].user, self.user1)
        self.assertEqual(positions[1].user, self.user2)
        self.assertEqual(positions[2].user, self.user3)

    def test_queue_position_unique_constraint(self):
        create_queue_position(1, self.user1)
        with self.assertRaises(Exception):
            create_queue_position(1, self.user2)

    def test_queue_position_cascade_delete(self):
        queue_pos = create_queue_position(1, self.user1)
        self.user1.delete()
        with self.assertRaises(QueuePosition.DoesNotExist):
            QueuePosition.objects.get(position=1)