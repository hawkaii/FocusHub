# StudyDesk Backend Architecture Plan

## Overview

This document outlines the complete backend architecture for the StudyDesk application, focusing on widget position synchronization, user authentication via Firebase, and analytics tracking.

## Technology Stack

### Core Framework

- **Language**: Go (Golang)
- **Web Framework**: Gin or Fiber
- **Database**: PostgreSQL with JSONB support
- **Authentication**: Firebase Admin SDK
- **Real-time Communication**: WebSockets (gorilla/websocket)
- **Caching**: Redis (optional for session management)

## Architecture Components

### 1. Authentication System

#### Firebase Integration

```go
// Firebase Admin SDK setup
type AuthService struct {
    client *auth.Client
}

func (a *AuthService) VerifyToken(idToken string) (*auth.Token, error) {
    token, err := a.client.VerifyIDToken(context.Background(), idToken)
    return token, err
}
```

#### Middleware

- JWT token verification for all protected routes
- User context injection into request pipeline
- Rate limiting per user

#### User Management

- Automatic user creation on first Firebase login
- User profile management
- Session tracking

### 2. Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
```

#### User Layouts Table

```sql
CREATE TABLE user_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    layout_name VARCHAR(100) DEFAULT 'default',
    widgets JSONB NOT NULL DEFAULT '{}',
    version INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, layout_name)
);

CREATE INDEX idx_user_layouts_user_id ON user_layouts(user_id);
CREATE INDEX idx_user_layouts_widgets ON user_layouts USING GIN(widgets);
```

#### Focus Sessions Table

```sql
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'pomodoro', 'focus', 'break'
    planned_duration INTEGER NOT NULL, -- in seconds
    actual_duration INTEGER, -- in seconds
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    task_category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_focus_sessions_type ON focus_sessions(session_type);
```

#### Tasks Table

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority INTEGER DEFAULT 1, -- 1-5 scale
    completed BOOLEAN DEFAULT false,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 3. Widget Position Sync System

#### Widget Layout Structure

```json
{
  "timer": {
    "x": 100,
    "y": 200,
    "width": 300,
    "height": 150,
    "visible": true,
    "zIndex": 1,
    "minimized": false
  },
  "taskTracker": {
    "x": 450,
    "y": 200,
    "width": 400,
    "height": 500,
    "visible": true,
    "zIndex": 2,
    "minimized": false
  },
  "player": {
    "x": 50,
    "y": 50,
    "width": 250,
    "height": 80,
    "visible": false,
    "zIndex": 3,
    "minimized": true
  },
  "analytics": {
    "x": 0,
    "y": 0,
    "width": 800,
    "height": 600,
    "visible": false,
    "zIndex": 4,
    "minimized": false
  }
}
```

#### Real-time Sync Flow

1. **Client Side**: Widget position changes trigger debounced updates (300ms)
2. **WebSocket Message**: Position data sent to server
3. **Server Processing**: Validate and merge position updates
4. **Database Update**: Atomic JSONB update with version increment
5. **Broadcast**: Notify other connected clients of the user
6. **Conflict Resolution**: Last-write-wins with timestamp comparison

#### WebSocket Message Format

```json
{
  "type": "widget_update",
  "payload": {
    "widgetId": "timer",
    "position": {
      "x": 150,
      "y": 250,
      "width": 300,
      "height": 150
    },
    "timestamp": "2025-01-16T10:30:00Z"
  }
}
```

### 4. API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/login              # Firebase token verification
POST   /api/auth/logout             # Invalidate session
GET    /api/auth/me                 # Get current user info
PUT    /api/auth/profile            # Update user profile
```

#### Layout Management

```
GET    /api/layouts                 # Get user's layouts
GET    /api/layouts/{name}          # Get specific layout
PUT    /api/layouts/{name}          # Update layout
DELETE /api/layouts/{name}          # Delete layout
POST   /api/layouts                 # Create new layout
```

#### Widget Synchronization

```
WS     /api/ws/sync                 # WebSocket for real-time sync
POST   /api/widgets/batch-update    # Batch widget position updates
GET    /api/widgets/state           # Get current widget state
```

#### Focus Sessions

```
GET    /api/sessions                # Get user's focus sessions
POST   /api/sessions                # Start new focus session
PUT    /api/sessions/{id}           # Update session (pause/resume)
DELETE /api/sessions/{id}           # End session
GET    /api/sessions/stats          # Get session statistics
```

#### Tasks Management

```
GET    /api/tasks                   # Get user's tasks
POST   /api/tasks                   # Create new task
PUT    /api/tasks/{id}              # Update task
DELETE /api/tasks/{id}              # Delete task
POST   /api/tasks/{id}/complete     # Mark task as completed
```

#### Analytics

```
GET    /api/analytics/overview      # Get analytics overview
GET    /api/analytics/heatmap       # Get focus time heatmap data
GET    /api/analytics/productivity  # Get productivity metrics
POST   /api/analytics/export        # Export analytics data
```

### 5. Service Layer Architecture

#### Directory Structure

```
server/
├── cmd/
│   └── main.go                     # Application entry point
├── internal/
│   ├── auth/                       # Authentication service
│   │   ├── firebase.go
│   │   ├── middleware.go
│   │   └── service.go
│   ├── database/                   # Database connection and migrations
│   │   ├── connection.go
│   │   ├── migrations/
│   │   └── models/
│   ├── handlers/                   # HTTP handlers
│   │   ├── auth.go
│   │   ├── layouts.go
│   │   ├── sessions.go
│   │   ├── tasks.go
│   │   └── websocket.go
│   ├── services/                   # Business logic
│   │   ├── layout_service.go
│   │   ├── session_service.go
│   │   ├── task_service.go
│   │   └── analytics_service.go
│   ├── models/                     # Data models
│   │   ├── user.go
│   │   ├── layout.go
│   │   ├── session.go
│   │   └── task.go
│   └── websocket/                  # WebSocket management
│       ├── hub.go
│       ├── client.go
│       └── handler.go
├── pkg/                            # Shared packages
│   ├── config/
│   ├── logger/
│   └── utils/
├── migrations/                     # Database migrations
├── docker-compose.yml              # Development environment
├── Dockerfile                      # Production container
├── go.mod
└── go.sum
```

### 6. Real-time Communication

#### WebSocket Hub Pattern

```go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    userRooms  map[string]map[*Client]bool // userID -> clients
}

type Client struct {
    hub    *Hub
    conn   *websocket.Conn
    send   chan []byte
    userID string
}
```

#### Connection Management

- User-specific rooms for isolated updates
- Automatic reconnection handling
- Heartbeat/ping-pong for connection health
- Graceful disconnection cleanup

### 7. Data Consistency

#### Optimistic Locking

- Version numbers for layout updates
- Conflict detection and resolution
- Client-side conflict indication

#### Transaction Management

- Database transactions for related operations
- Rollback on partial failures
- Atomic widget batch updates

### 8. Performance Considerations

#### Caching Strategy

- Redis for active user sessions
- In-memory cache for frequently accessed layouts
- Database connection pooling

#### Database Optimization

- Proper indexing on query patterns
- JSONB indexing for widget searches
- Prepared statements for common queries

#### Rate Limiting

- Per-user API rate limits
- WebSocket message throttling
- Batch operation limits

### 9. Security Measures

#### Authentication Security

- Firebase token validation on every request
- JWT token expiration handling
- Session invalidation on logout

#### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

#### API Security

- CORS configuration
- Request size limits
- User data isolation

### 10. Monitoring and Logging

#### Logging Strategy

- Structured logging with JSON format
- Request/response logging
- Error tracking and alerting

#### Metrics Collection

- API response times
- WebSocket connection counts
- Database query performance
- User activity metrics

### 11. Deployment Strategy

#### Environment Configuration

- Development: Docker Compose with PostgreSQL
- Production: Kubernetes or Docker Swarm
- Environment-specific configs

#### CI/CD Pipeline

- Automated testing
- Database migration validation
- Rolling deployments
- Health checks

### 12. Future Enhancements

#### Scalability

- Horizontal scaling with load balancers
- Database sharding by user
- Microservices architecture transition

#### Features

- Collaborative workspaces
- Widget sharing between users
- Advanced analytics with ML insights
- Mobile app synchronization

## Implementation Phases

### Phase 1: Core Infrastructure

1. Database setup and migrations
2. Firebase authentication integration
3. Basic CRUD operations for users and layouts

### Phase 2: Widget Synchronization

1. WebSocket infrastructure
2. Real-time position updates
3. Conflict resolution

### Phase 3: Analytics and Sessions

1. Focus session tracking
2. Task management
3. Analytics data collection

### Phase 4: Advanced Features

1. Export functionality
2. Performance optimization
3. Advanced analytics

This plan provides a comprehensive roadmap for building a scalable, real-time backend that supports widget synchronization, user authentication, and analytics tracking for the StudyDesk application.
