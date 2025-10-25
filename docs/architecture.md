## System Architecture

```mermaid
flowchart LR
  subgraph Frontend
    A[React/Next.js App]
  end

  subgraph Backend
    B[Express.js API]
    C[Mongoose Models]
    D[Socket.IO / Real-time]
  end

  subgraph Database
    E[MongoDB Atlas]
  end

  A -->|HTTPS REST / WebSocket| B
  B --> C
  C --> E
  B -->|Realtime| D
  D --> A
  B -->|Auth (JWT/Firebase)| F[Auth Service]
  F --> A
```

Components:
- Frontend: React or Next.js app using Tailwind CSS for UI. Connects to backend via REST and WebSocket for real-time updates.
- Backend: Node.js + Express with Mongoose for MongoDB. Provides auth, CRUD endpoints, websocket notifications.
- Database: MongoDB Atlas for managed cloud database.
- Auth: JWT-based or Firebase Authentication for role-based access.
