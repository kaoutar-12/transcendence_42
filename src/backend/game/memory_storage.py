from threading import Lock
class MemoryStorage:
    _games = {}  # for game stats
    _movements = {}  # Store  movements
    _queue = []  # store queue
    _game_counter = 1000  # for game- ids
    _invites = {}  # store invites
    _invites_counter = 1 # for invite-ids
    _lock = Lock()
    @classmethod
    def create_invite(cls, from_user_id, to_user_id):
        with cls._lock:
            invite_id = cls._invites_counter
            cls._invites_counter += 1
            cls._invites[invite_id] = {
                'from_user_id': from_user_id,
                'to_user_id': to_user_id,
                'status': 'pending'
            }
            return invite_id

    @classmethod
    def get_invite(cls, invite_id):
        return cls._invites.get(invite_id)

    @classmethod
    def remove_invite(cls, invite_id):
        cls._invites.pop(invite_id, None)

    @classmethod
    def get_user_invites(cls, user_id):
        result = {}
        for invite_id, invite in cls._invites.items():
            if invite['to_user_id'] == user_id:
                result[invite_id] = invite
        return result

    @classmethod
    def save_game_state(cls, game_id, state):
        cls._games[game_id] = state

    @classmethod
    def get_game_state(cls, game_id):
        return cls._games.get(game_id)

    @classmethod
    def save_player_movement(cls, game_id, user_id, movement):
        with cls._lock:
            if game_id not in cls._movements:
                cls._movements[game_id] = {}
            cls._movements[game_id][user_id] = movement

    @classmethod
    def get_player_movements(cls, game_id):
        return cls._movements.get(game_id, {})

    @classmethod
    def set_game_status(cls, game_id, status):
        if game_id in cls._games:
            cls._games[game_id]['game_status'] = status

    @classmethod
    def delete_game(cls, game_id):
        cls._games.pop(game_id, None)
        cls._movements.pop(game_id, None)

    @classmethod
    def add_to_queue(cls, user_id):
        if user_id not in cls._queue:
            cls._queue.append(user_id)
        return len(cls._queue) >= 2

    @classmethod
    def remove_from_queue(cls, user_id):
        if user_id in cls._queue:
            cls._queue.remove(user_id)

    @classmethod
    def get_queue_length(cls):
        return len(cls._queue)

    @classmethod
    def is_in_queue(cls, user_id):
        return user_id in cls._queue

    @classmethod
    def get_match_players(cls):
        with cls._lock:
            if len(cls._queue) >= 2:
                player1 = cls._queue.pop(0)
                player2 = cls._queue.pop(0)
                return [player1, player2]
            return None

    @classmethod
    def generate_game_id(cls):
        game_id = cls._game_counter
        cls._game_counter += 1
        return game_id