
Application architecture.

<img width="1477" alt="Screen Shot 2025-01-05 at 1 55 30 AM" src="https://github.com/user-attachments/assets/dd031146-43a5-42c6-b79a-3ccbefd2e1b1" />

## flowchart

```mermaid
flowchart TD
    subgraph Client
        UI[User Interface]
        WS[WebSocket Client]
        REST[REST Client]
    end

    subgraph Backend
        subgraph API
            Auth[Authentication]
            GameAPI[Game API]
            Stats[Statistics API]
        end

        subgraph WebSocket
            WSServer[WebSocket Server]
            GameState[Game State Manager]
            Physics[Physics Engine]
        end

        subgraph Database
            Users[(User Data)]
            Games[(Game Sessions)]
            History[(Game History)]
        end
    end

    UI --> WS
    UI --> REST
    WS --> WSServer
    REST --> API
    WSServer --> GameState
    GameState --> Physics
    API --> Database
    GameState --> Database

```