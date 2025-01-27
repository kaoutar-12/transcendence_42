# Real-Time Multiplayer Game System

A Django-based real-time multiplayer game system with matchmaking and WebSocket communication.

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Side"]
        C1[Web Client]
        C2[REST API Calls]
        C3[WebSocket Connection]
    end

    subgraph Server["Server Side"]
        subgraph Authentication
            A1[JWT Auth]
            A2[Token Validation]
        end

        subgraph "Queue System"
            Q1[Queue Manager]
            Q2[Queue State]
            Q3[Queue Positions]
        end

        subgraph "Game System"
            G1[Game Session]
            G2[Player Management]
            G3[Game State]
            G4[WebSocket Handler]
        end

        subgraph "Database"
            D1[(Queue Tables)]
            D2[(Game Tables)]
            D3[(User Tables)]
        end
    end

    C1 --> C2
    C1 --> C3
    C2 --> A1
    C3 --> A2
    A1 --> Q1
    A2 --> G4
    Q1 --> Q2
    Q2 --> Q3
    Q3 --> G1
    G1 --> G2
    G2 --> G3
    G3 --> G4
    G4 --> C3
    
    Q2 --> D1
    G3 --> D2
    A1 --> D3
```

## Game Flow Sequence

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant C2 as Client 2
    participant API as REST API
    participant QM as Queue Manager
    participant WS as WebSocket
    participant DB as Database

    C1->>API: POST /game/join/ (JWT)
    API->>QM: Add to Queue
    QM->>DB: Create Queue Position
    API-->>C1: Queue Position

    C2->>API: POST /game/join/ (JWT)
    API->>QM: Add to Queue
    QM->>DB: Create Queue Position
    QM->>DB: Create Game Session
    API-->>C2: Game Created

    C1->>WS: Connect ws://game/{id}/?token=jwt
    WS->>DB: Validate Player
    WS-->>C1: Game State

    C2->>WS: Connect ws://game/{id}/?token=jwt
    WS->>DB: Validate Player
    WS-->>C2: Game State

    C1->>WS: player_ready
    WS-->>C2: Player 1 Ready
    
    C2->>WS: player_ready
    WS-->>C1: Player 2 Ready
    WS-->>C2: Game Start
    WS-->>C1: Game Start
```

## Game State Machine

```mermaid
stateDiagram-v2
    [*] --> Queue: Player Joins
    Queue --> Matching: 2 Players Available
    Matching --> GameCreated: Match Found
    GameCreated --> WaitingForPlayers: Session Created
    WaitingForPlayers --> WaitingForReady: Players Connected
    WaitingForReady --> Active: All Players Ready
    Active --> Active: Game Updates
    Active --> Finished: Game End Condition
    Finished --> [*]
```

## Features

- Real-time multiplayer gameplay
- Automated matchmaking system
- JWT authentication for secure connections
- WebSocket-based game communication
- Transaction-safe queue management
- Isolated game rooms
- Game state synchronization

## Technical Stack

- Django + Django Channels
- Redis (WebSocket backend)
- JWT Authentication
- SQLite/PostgreSQL Database

## API Endpoints

### Queue Management

```python
# Join queue
POST /game/join/
Authorization: Bearer <jwt_token>

# Leave queue
POST /game/leave/
Authorization: Bearer <jwt_token>
```

### WebSocket Events

```javascript
// Connect to game
ws://host/ws/game/{game_id}/?token=jwt_token

// Event Types:
{
    // Incoming Events
    'game_state': {
        'id': 'game_id',
        'state': 'game_status',
        'players': [{
            'id': 'user_id',
            'username': 'player_name',
            'score': 0,
            'side': 'left/right',
            'ready': false
        }]
    },
    'player_ready': {
        'user_id': 'player_id'
    },
    'game_start': {},
    'player_move': {
        'user_id': 'player_id',
        'movement': {}
    },
    'game_action': {
        'action': 'action_type',
        'data': {}
    }
}
```

## Client Integration Example

```javascript
class GameClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.socket = null;
    }

    async joinQueue() {
        const response = await fetch(`${this.baseUrl}/game/join/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return await response.json();
    }

    connectToGame(gameId) {
        this.socket = new WebSocket(
            `${this.baseUrl}/ws/game/${gameId}/?token=${this.token}`
        );

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleGameMessage(data);
        };
    }

    handleGameMessage(data) {
        switch(data.type) {
            case 'game_state':
                console.log('Game State:', data);
                break;
            case 'game_start':
                console.log('Game Starting!');
                break;
            case 'player_move':
                console.log('Player Moved:', data);
                break;
        }
    }

    sendReady() {
        this.socket.send(JSON.stringify({
            type: 'player_ready'
        }));
    }

    sendMove(movement) {
        this.socket.send(JSON.stringify({
            type: 'player_move',
            movement: movement
        }));
    }
}
```

## Setup Instructions

1. Install Dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Redis:
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('redis', 6379)],
        },
    },
}
```

3. Run Migrations:
```bash
python manage.py migrate
```

4. Start the Development Server:
```bash
python manage.py runserver
```

## Security Considerations

1. JWT Authentication
   - All connections require valid JWT tokens
   - Tokens are validated for both REST and WebSocket connections
   - Token expiration is enforced

2. WebSocket Security
   - Connections are authenticated via middleware
   - Game sessions are isolated in separate rooms
   - Player validation for each game session

3. Data Consistency
   - Queue operations use database transactions
   - Game state updates are atomic
   - Player positions are automatically maintained

## Error Handling

The system includes comprehensive error handling for:
- Invalid authentication
- Queue operation failures
- WebSocket connection issues
- Game state inconsistencies
- Player disconnections

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE)