class MemoryStorage:
    _games = {}  # for game stats
    _movements = {}  # Store movements
    _queues = {'pong': [], 'tictactoe': []}  #each game type its queue
    _game_counter = 1000  #forgame id

    @classmethod
    def save_game_state(cls, game_id, state, game_type=None):
        if game_type:
            cls._games[game_id] = {'state': state, 'type': game_type}
        else:
            cls._games[game_id] = state

    @classmethod
    def get_game_state(cls, game_id):
        game = cls._games.get(game_id)
        return game.get('state') if isinstance(game, dict) else game

    @classmethod
    def get_game_type(cls, game_id):
        game = cls._games.get(game_id)
        return game.get('type') if isinstance(game, dict) else None

    @classmethod
    def save_player_movement(cls, game_id, user_id, movement):
        if game_id not in cls._movements:
            cls._movements[game_id] = {}
        cls._movements[game_id][user_id] = movement

    @classmethod
    def get_player_movements(cls, game_id):
        return cls._movements.get(game_id, {})

    @classmethod
    def set_game_status(cls, game_id, status):
        game = cls._games.get(game_id)
        if isinstance(game, dict):
            game['state']['game_status'] = status
        elif game:
            game['game_status'] = status

    @classmethod
    def delete_game(cls, game_id):
        cls._games.pop(game_id, None)
        cls._movements.pop(game_id, None)

    @classmethod
    def add_to_queue(cls, game_type, user_id):
        if game_type not in cls._queues:
            cls._queues[game_type] = []
        if user_id not in cls._queues[game_type]:
            cls._queues[game_type].append(user_id)
        return len(cls._queues[game_type]) >= 2

    @classmethod
    def remove_from_queue(cls, game_type, user_id):
        if game_type in cls._queues and user_id in cls._queues[game_type]:
            cls._queues[game_type].remove(user_id)

    @classmethod
    def get_queue_length(cls, game_type):
        return len(cls._queues.get(game_type, []))

    @classmethod
    def is_in_queue(cls, game_type, user_id):
        return game_type in cls._queues and user_id in cls._queues[game_type]

    @classmethod
    def get_match_players(cls, game_type):
        if game_type in cls._queues and len(cls._queues[game_type]) >= 2:
            player1 = cls._queues[game_type].pop(0)
            player2 = cls._queues[game_type].pop(0)
            return [player1, player2]
        return None

    @classmethod
    def generate_game_id(cls):
        game_id = cls._game_counter
        cls._game_counter += 1
        return game_id