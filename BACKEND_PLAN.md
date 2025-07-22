# StudyDesk Backend Architecture Plan

## Overview

This document outlines the complete backend architecture for the StudyDesk application, focusing on Firebase authentication with comprehensive user profiles, real-time session synchronization, analytics tracking with time metrics and heatmaps, leaderboard functionality, and widget position synchronization.

## Technology Stack

### Core Framework

- **Language**: Go (Golang)
- **Web Framework**: Gin or Fiber
- **Database**: PostgreSQL with JSONB support
- **Authentication**: Firebase Admin SDK
- **Real-time Communication**: WebSockets (gorilla/websocket)
- **Caching**: Redis (optional for session management)

## Architecture Components

### 1. Enhanced Authentication System

#### Firebase Integration with Complete User Management

```go
// Firebase Admin SDK setup
type AuthService struct {
    client    *auth.Client
    db        *sql.DB
    analytics *AnalyticsService
}

func (a *AuthService) VerifyToken(idToken string) (*auth.Token, error) {
    token, err := a.client.VerifyIDToken(context.Background(), idToken)
    if err != nil {
        return nil, err
    }

    // Automatically create or update user profile
    user, err := a.EnsureUserExists(token)
    if err != nil {
        return nil, err
    }

    // Update last login and start session tracking
    go a.UpdateUserActivity(user.ID)

    return token, nil
}

func (a *AuthService) EnsureUserExists(token *auth.Token) (*User, error) {
    user, err := a.GetUserByFirebaseUID(token.UID)
    if err == sql.ErrNoRows {
        // Create new user with initial analytics data
        return a.CreateUser(&CreateUserRequest{
            FirebaseUID: token.UID,
            Email:       token.Claims["email"].(string),
            DisplayName: token.Claims["name"].(string),
            PhotoURL:    token.Claims["picture"].(string),
        })
    }
    return user, err
}
```

#### Enhanced Authentication Middleware

```go
func AuthMiddleware(authService *AuthService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Extract token from Authorization header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")

        // Verify Firebase token
        firebaseToken, err := authService.VerifyToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        // Get complete user profile with analytics
        user, err := authService.GetUserWithAnalytics(firebaseToken.UID)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to fetch user data"})
            c.Abort()
            return
        }

        // Inject user context for downstream handlers
        c.Set("user", user)
        c.Set("user_id", user.ID)
        c.Set("firebase_uid", firebaseToken.UID)

        // Update user activity for session tracking
        go authService.TrackUserActivity(user.ID, c.Request.UserAgent(), c.ClientIP())

        c.Next()
    }
}
```

#### User Management with Analytics Integration

- **Automatic user creation** on first Firebase login with analytics initialization
- **Complete user profile** with time metrics, session history, and preferences
- **Real-time session tracking** with activity monitoring
- **User analytics dashboard** data preparation on login
- **Leaderboard rank calculation** and caching
- **Cross-device session synchronization**

### 2. Enhanced Database Schema

#### Users Table with Analytics Integration

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
    is_active BOOLEAN DEFAULT true,

    -- Analytics fields
    total_focus_time INTEGER DEFAULT 0, -- in seconds
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    rank_position INTEGER DEFAULT NULL,
    last_rank_update TIMESTAMP DEFAULT NOW(),

    -- User preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_session_length INTEGER DEFAULT 1500, -- 25 minutes
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{
        "show_in_leaderboard": true,
        "show_detailed_stats": true,
        "public_profile": false
    }'
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rank ON users(rank_position) WHERE rank_position IS NOT NULL;
CREATE INDEX idx_users_total_focus ON users(total_focus_time DESC);
CREATE INDEX idx_users_streak ON users(current_streak DESC);
```

#### User Sessions Table (Real-time Activity Tracking)

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}', -- browser, OS, device type
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,

    -- Session analytics
    total_widgets_moved INTEGER DEFAULT 0,
    total_api_calls INTEGER DEFAULT 0,
    session_duration INTEGER, -- computed on session end

    UNIQUE(user_id, session_token)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_started ON user_sessions(started_at);
```

#### Enhanced Focus Sessions Table

```sql
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'pomodoro', 'focus', 'break', 'long_break'
    planned_duration INTEGER NOT NULL, -- in seconds
    actual_duration INTEGER, -- in seconds
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    paused_duration INTEGER DEFAULT 0, -- total paused time
    task_category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Enhanced analytics
    productivity_score DECIMAL(3,2), -- 0.00 to 5.00
    interruption_count INTEGER DEFAULT 0,
    background_noise VARCHAR(50), -- music/ambient track used
    widget_interactions INTEGER DEFAULT 0,

    -- Weather and context (optional)
    weather_data JSONB DEFAULT NULL,
    location_context VARCHAR(100), -- 'home', 'office', 'library', etc.

    -- Session quality metrics
    focus_quality_rating INTEGER CHECK (focus_quality_rating >= 1 AND focus_quality_rating <= 5),
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5)
);

CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_focus_sessions_type ON focus_sessions(session_type);
CREATE INDEX idx_focus_sessions_completed ON focus_sessions(completed);
CREATE INDEX idx_focus_sessions_productivity ON focus_sessions(productivity_score);
```

#### Daily Analytics Summary Table

```sql
CREATE TABLE daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Daily totals
    total_focus_time INTEGER DEFAULT 0,
    total_break_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,

    -- Quality metrics
    average_productivity DECIMAL(3,2),
    average_mood_before DECIMAL(3,2),
    average_mood_after DECIMAL(3,2),
    total_interruptions INTEGER DEFAULT 0,

    -- Streak tracking
    streak_maintained BOOLEAN DEFAULT false,
    daily_goal_met BOOLEAN DEFAULT false,
    daily_goal_minutes INTEGER DEFAULT 120, -- 2 hours default

    -- Time distribution
    morning_focus_time INTEGER DEFAULT 0, -- 6-12
    afternoon_focus_time INTEGER DEFAULT 0, -- 12-18
    evening_focus_time INTEGER DEFAULT 0, -- 18-24
    night_focus_time INTEGER DEFAULT 0, -- 0-6

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_analytics_user_date ON daily_analytics(user_id, date);
CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX idx_daily_analytics_streak ON daily_analytics(streak_maintained);
```

#### Leaderboard Table (Pre-computed Rankings)

```sql
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ranking_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    ranking_period DATE NOT NULL, -- for daily: the date, for weekly: start of week, etc.

    -- Ranking metrics
    rank_position INTEGER NOT NULL,
    total_focus_time INTEGER NOT NULL,
    total_sessions INTEGER NOT NULL,
    average_session_length DECIMAL(6,2),
    productivity_score DECIMAL(3,2),
    streak_count INTEGER DEFAULT 0,

    -- Additional stats for display
    improvement_percentage DECIMAL(5,2), -- vs previous period
    badge_earned VARCHAR(100), -- achievement badge if any

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, ranking_type, ranking_period)
);

CREATE INDEX idx_leaderboard_type_period ON leaderboard_entries(ranking_type, ranking_period);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(ranking_type, ranking_period, rank_position);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id);
```

#### Heatmap Data Table (Time-based Activity)

```sql
CREATE TABLE activity_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),

    -- Activity metrics for this hour
    focus_minutes INTEGER DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    productivity_score DECIMAL(3,2),

    -- Context data
    most_used_background VARCHAR(100),
    average_interruptions DECIMAL(3,1),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, date, hour_of_day)
);

CREATE INDEX idx_heatmap_user_date ON activity_heatmap(user_id, date);
CREATE INDEX idx_heatmap_hour ON activity_heatmap(hour_of_day);
CREATE INDEX idx_heatmap_productivity ON activity_heatmap(productivity_score);
```

#### User Achievements Table

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT NOW(),

    -- Achievement metadata
    criteria_met JSONB NOT NULL, -- the specific criteria that was met
    badge_icon VARCHAR(255), -- URL or identifier for badge icon
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points_awarded INTEGER DEFAULT 0,

    UNIQUE(user_id, achievement_type, achievement_name)
);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_achievements_earned ON user_achievements(earned_at);
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

### 4. Enhanced API Endpoints

#### Authentication Endpoints with Profile Integration

```
POST   /api/auth/login              # Firebase token verification + user profile creation
POST   /api/auth/logout             # Invalidate session + session analytics
GET    /api/auth/me                 # Get current user with complete analytics
PUT    /api/auth/profile            # Update user profile and preferences
POST   /api/auth/refresh            # Refresh session token
GET    /api/auth/dashboard          # Get login dashboard data (metrics + heatmap + leaderboard)
```

#### Enhanced User Analytics Dashboard

```
GET    /api/dashboard               # Complete dashboard data on login
    Response: {
        "user": {
            "id": "uuid",
            "display_name": "John Doe",
            "total_focus_time": 45600, // seconds
            "current_streak": 7,
            "rank_position": 15
        },
        "time_metrics": {
            "today": {
                "focus_time": 3600,
                "sessions": 4,
                "productivity_score": 4.2
            },
            "week": {
                "focus_time": 18000,
                "avg_daily": 3600,
                "best_day": "2025-01-15"
            },
            "month": {
                "focus_time": 72000,
                "sessions": 45,
                "streak_maintained": 15
            }
        },
        "heatmap_data": [...], // hourly activity for last 30 days
        "leaderboard_position": {
            "daily": 8,
            "weekly": 12,
            "monthly": 15,
            "improvement": "+3" // vs last period
        }
    }
```

#### Real-time Session Synchronization

```
WS     /api/ws/session             # Real-time session sync + activity tracking
POST   /api/sessions/start         # Start focus session with real-time updates
PUT    /api/sessions/{id}/pause    # Pause session
PUT    /api/sessions/{id}/resume   # Resume session
POST   /api/sessions/{id}/end      # End session + calculate analytics
GET    /api/sessions/active        # Get currently active session
WS     /api/ws/activity            # Real-time activity tracking (widget moves, etc.)
```

#### Enhanced Analytics Endpoints

```
GET    /api/analytics/dashboard     # Complete analytics dashboard
GET    /api/analytics/heatmap       # Time-based activity heatmap
    Query params: ?period=7d&granularity=hour

GET    /api/analytics/trends        # Productivity trends and insights
    Response: {
        "daily_trends": [...],
        "weekly_patterns": {...},
        "productivity_insights": [
            "You're most productive between 9-11 AM",
            "Your focus improves with ambient music"
        ],
        "recommendations": [...]
    }

GET    /api/analytics/streaks       # Streak analysis and history
GET    /api/analytics/goals         # Goal tracking and progress
POST   /api/analytics/goals         # Set new goals
PUT    /api/analytics/goals/{id}    # Update goal

GET    /api/analytics/achievements  # User achievements and badges
POST   /api/analytics/export        # Export analytics data
    Formats: JSON, CSV, PDF
```

#### Leaderboard System

```
GET    /api/leaderboard             # Global leaderboard (multiple timeframes)
    Query params: ?type=daily&limit=50&include_user=true
    Response: {
        "rankings": [
            {
                "rank": 1,
                "user": {
                    "id": "uuid",
                    "display_name": "Top User",
                    "photo_url": "...",
                    "total_focus_time": 7200,
                    "streak": 30,
                    "badge": "legend"
                },
                "stats": {
                    "focus_time": 7200,
                    "sessions": 12,
                    "avg_session": 600,
                    "improvement": "+15%"
                }
            }
        ],
        "user_position": {
            "rank": 15,
            "total_users": 1250,
            "percentile": 85,
            "points_to_next": 120
        },
        "period_info": {
            "type": "daily",
            "start": "2025-01-16T00:00:00Z",
            "end": "2025-01-16T23:59:59Z",
            "next_update": "2025-01-17T00:00:00Z"
        }
    }

GET    /api/leaderboard/friends     # Friends/following leaderboard
GET    /api/leaderboard/history     # User's ranking history
GET    /api/leaderboard/categories  # Category-based leaderboards (streaks, productivity, etc.)
```

#### Social Features

```
GET    /api/social/profile/{user_id} # Public user profile
POST   /api/social/follow           # Follow another user
DELETE /api/social/follow/{user_id} # Unfollow user
GET    /api/social/followers        # Get followers list
GET    /api/social/following        # Get following list
GET    /api/social/feed             # Activity feed from followed users
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

### 5. Enhanced Service Layer Architecture

#### Analytics Service with Real-time Processing

```go
type AnalyticsService struct {
    db           *sql.DB
    redis        *redis.Client
    leaderboard  *LeaderboardService
    achievements *AchievementService
}

func (a *AnalyticsService) ProcessSessionEnd(sessionID string) error {
    session, err := a.GetSession(sessionID)
    if err != nil {
        return err
    }

    // Calculate session metrics
    productivity := a.calculateProductivityScore(session)

    // Update user totals atomically
    tx, err := a.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Update user statistics
    err = a.updateUserStats(tx, session.UserID, session)
    if err != nil {
        return err
    }

    // Update daily analytics
    err = a.updateDailyAnalytics(tx, session.UserID, session)
    if err != nil {
        return err
    }

    // Update heatmap data
    err = a.updateHeatmapData(tx, session.UserID, session)
    if err != nil {
        return err
    }

    // Check for achievements
    go a.achievements.CheckAchievements(session.UserID, session)

    // Update leaderboard rankings
    go a.leaderboard.UpdateUserRanking(session.UserID)

    return tx.Commit()
}

func (a *AnalyticsService) GetUserDashboard(userID string) (*DashboardData, error) {
    // Get from cache first
    cached, err := a.redis.Get(fmt.Sprintf("dashboard:%s", userID)).Result()
    if err == nil {
        var dashboard DashboardData
        json.Unmarshal([]byte(cached), &dashboard)
        return &dashboard, nil
    }

    // Build dashboard data
    dashboard := &DashboardData{}

    // Get user with analytics
    dashboard.User, err = a.getUserWithAnalytics(userID)
    if err != nil {
        return nil, err
    }

    // Get time metrics (today, week, month)
    dashboard.TimeMetrics, err = a.getTimeMetrics(userID)
    if err != nil {
        return nil, err
    }

    // Get heatmap data (last 30 days)
    dashboard.HeatmapData, err = a.getHeatmapData(userID, 30)
    if err != nil {
        return nil, err
    }

    // Get leaderboard position
    dashboard.LeaderboardPosition, err = a.leaderboard.GetUserPosition(userID)
    if err != nil {
        return nil, err
    }

    // Cache for 5 minutes
    dashboardJSON, _ := json.Marshal(dashboard)
    a.redis.Set(fmt.Sprintf("dashboard:%s", userID), dashboardJSON, 5*time.Minute)

    return dashboard, nil
}
```

#### Leaderboard Service with Caching

```go
type LeaderboardService struct {
    db    *sql.DB
    redis *redis.Client
}

func (l *LeaderboardService) GetLeaderboard(rankingType string, limit int, userID string) (*LeaderboardResponse, error) {
    cacheKey := fmt.Sprintf("leaderboard:%s:%d", rankingType, limit)

    // Try to get from cache first
    cached, err := l.redis.Get(cacheKey).Result()
    if err == nil {
        var response LeaderboardResponse
        json.Unmarshal([]byte(cached), &response)

        // Add user position if not in top results
        if userID != "" {
            userPos, _ := l.GetUserPosition(userID)
            response.UserPosition = userPos
        }

        return &response, nil
    }

    // Build leaderboard from database
    period := l.getCurrentPeriod(rankingType)

    query := `
        SELECT
            le.rank_position,
            u.id, u.display_name, u.photo_url,
            le.total_focus_time, le.total_sessions,
            le.productivity_score, le.streak_count,
            le.improvement_percentage
        FROM leaderboard_entries le
        JOIN users u ON le.user_id = u.id
        WHERE le.ranking_type = $1 AND le.ranking_period = $2
            AND u.privacy_settings->>'show_in_leaderboard' = 'true'
        ORDER BY le.rank_position
        LIMIT $3
    `

    rows, err := l.db.Query(query, rankingType, period, limit)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var rankings []LeaderboardEntry
    for rows.Next() {
        var entry LeaderboardEntry
        err := rows.Scan(
            &entry.Rank, &entry.User.ID, &entry.User.DisplayName,
            &entry.User.PhotoURL, &entry.Stats.FocusTime,
            &entry.Stats.Sessions, &entry.Stats.ProductivityScore,
            &entry.Stats.Streak, &entry.Stats.Improvement,
        )
        if err != nil {
            continue
        }
        rankings = append(rankings, entry)
    }

    response := &LeaderboardResponse{
        Rankings: rankings,
        PeriodInfo: PeriodInfo{
            Type:       rankingType,
            Start:      period,
            NextUpdate: l.getNextUpdateTime(rankingType),
        },
    }

    // Cache for appropriate duration
    cacheDuration := l.getCacheDuration(rankingType)
    responseJSON, _ := json.Marshal(response)
    l.redis.Set(cacheKey, responseJSON, cacheDuration)

    return response, nil
}

func (l *LeaderboardService) UpdateUserRanking(userID string) error {
    // Update rankings for all time periods
    periods := []string{"daily", "weekly", "monthly", "all_time"}

    for _, period := range periods {
        err := l.updateUserRankingForPeriod(userID, period)
        if err != nil {
            log.Printf("Failed to update %s ranking for user %s: %v", period, userID, err)
        }
    }

    // Invalidate relevant caches
    l.invalidateLeaderboardCache()

    return nil
}
```

#### Real-time Session Sync Service

```go
type SessionSyncService struct {
    hub           *websocket.Hub
    db            *sql.DB
    analytics     *AnalyticsService
    activeSession map[string]*ActiveSession // userID -> session
    mutex         sync.RWMutex
}

type ActiveSession struct {
    SessionID     string    `json:"session_id"`
    UserID        string    `json:"user_id"`
    Type          string    `json:"type"`
    StartTime     time.Time `json:"start_time"`
    PlannedDuration int     `json:"planned_duration"`
    ElapsedTime   int       `json:"elapsed_time"`
    IsPaused      bool      `json:"is_paused"`
    PausedAt      *time.Time `json:"paused_at,omitempty"`
    TotalPaused   int       `json:"total_paused"`
}

func (s *SessionSyncService) StartSession(userID string, sessionType string, duration int) (*ActiveSession, error) {
    s.mutex.Lock()
    defer s.mutex.Unlock()

    // End any existing session
    if existing, exists := s.activeSession[userID]; exists {
        s.endSessionInternal(existing)
    }

    // Create new session in database
    sessionID := uuid.New().String()
    _, err := s.db.Exec(`
        INSERT INTO focus_sessions (id, user_id, session_type, planned_duration, start_time)
        VALUES ($1, $2, $3, $4, $5)
    `, sessionID, userID, sessionType, duration, time.Now())

    if err != nil {
        return nil, err
    }

    // Create active session
    session := &ActiveSession{
        SessionID:       sessionID,
        UserID:         userID,
        Type:           sessionType,
        StartTime:      time.Now(),
        PlannedDuration: duration,
        ElapsedTime:    0,
        IsPaused:       false,
        TotalPaused:    0,
    }

    s.activeSession[userID] = session

    // Start real-time updates
    go s.trackSessionProgress(session)

    // Broadcast to all user's connected clients
    s.broadcastToUser(userID, map[string]interface{}{
        "type": "session_started",
        "session": session,
    })

    return session, nil
}

func (s *SessionSyncService) trackSessionProgress(session *ActiveSession) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        s.mutex.Lock()

        // Check if session still exists
        if _, exists := s.activeSession[session.UserID]; !exists {
            s.mutex.Unlock()
            return
        }

        // Update elapsed time if not paused
        if !session.IsPaused {
            session.ElapsedTime = int(time.Since(session.StartTime).Seconds()) - session.TotalPaused
        }

        // Check if session completed
        if session.ElapsedTime >= session.PlannedDuration {
            s.endSessionInternal(session)
            s.mutex.Unlock()
            return
        }

        s.mutex.Unlock()

        // Broadcast update to user's clients
        s.broadcastToUser(session.UserID, map[string]interface{}{
            "type": "session_update",
            "session": session,
        })
    }
}

func (s *SessionSyncService) broadcastToUser(userID string, message map[string]interface{}) {
    if clients, exists := s.hub.UserRooms[userID]; exists {
        messageBytes, _ := json.Marshal(message)
        for client := range clients {
            select {
            case client.Send <- messageBytes:
            default:
                close(client.Send)
                delete(clients, client)
            }
        }
    }
}
```

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

## Enhanced Implementation Phases

### Phase 1: Core Infrastructure with Authentication (Weeks 1-2)

**Firebase Authentication Integration**

1. Set up Firebase Admin SDK and authentication middleware
2. Implement user creation/management with analytics initialization
3. Database setup with all enhanced tables (users, sessions, analytics, etc.)
4. Basic CRUD operations for users with profile data
5. Session tracking infrastructure

**Key Deliverables:**

- Complete authentication flow with Firebase
- User profiles with initial analytics data
- Database schema with all tables created
- Basic user session management

### Phase 2: Analytics Foundation & Dashboard (Weeks 3-4)

**Dashboard Data on Login**

1. Implement analytics service with real-time processing
2. Time metrics calculation (daily, weekly, monthly)
3. Basic heatmap data generation and storage
4. User dashboard API endpoint
5. Analytics data caching with Redis

**Key Deliverables:**

- Complete user dashboard with time metrics
- Heatmap data visualization backend
- Analytics processing pipeline
- Caching layer for performance

### Phase 3: Real-time Session Synchronization (Weeks 5-6)

**Session Tracking & Sync**

1. WebSocket infrastructure for real-time updates
2. Active session management and tracking
3. Session pause/resume functionality with real-time sync
4. Session analytics calculation and storage
5. Cross-device session synchronization

**Key Deliverables:**

- Real-time session tracking across devices
- WebSocket-based session updates
- Session analytics and productivity scoring
- Active session management

### Phase 4: Leaderboard System (Weeks 7-8)

**Global & Category Leaderboards**

1. Leaderboard calculation and ranking algorithms
2. Multiple timeframe leaderboards (daily, weekly, monthly)
3. Leaderboard caching and performance optimization
4. User ranking position calculation
5. Privacy settings for leaderboard visibility

**Key Deliverables:**

- Complete leaderboard system with rankings
- Multiple timeframe support
- User position tracking
- Performance-optimized leaderboard queries

### Phase 5: Advanced Analytics & Insights (Weeks 9-10)

**Enhanced Analytics Features**

1. Productivity trend analysis
2. Achievement system and badge implementation
3. Goal setting and tracking
4. Advanced heatmap with hourly granularity
5. Personalized insights and recommendations

**Key Deliverables:**

- Achievement and badge system
- Goal tracking functionality
- Advanced analytics insights
- Personalized recommendations engine

### Phase 6: Social Features & Polish (Weeks 11-12)

**Social Integration**

1. User following/followers system
2. Public profile pages
3. Activity feed from followed users
4. Social leaderboards (friends/following)
5. Data export functionality

**Key Deliverables:**

- Complete social feature set
- Public profiles and activity feeds
- Data export in multiple formats
- Production-ready deployment

## Login Flow Integration

### Enhanced Authentication & Dashboard Flow

```
1. User Login Request
   ↓
2. Firebase Token Verification
   ↓
3. User Profile Creation/Update
   ↓
4. Session Initialization & Tracking
   ↓
5. Dashboard Data Compilation:
   - Time metrics (today/week/month)
   - Heatmap data (last 30 days)
   - Leaderboard position
   - Active session status
   - Recent achievements
   ↓
6. Real-time WebSocket Connection
   ↓
7. Dashboard Response to Frontend
   ↓
8. Continuous Session Sync & Analytics Updates
```

### Dashboard API Response Structure

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "display_name": "John Doe",
      "photo_url": "https://...",
      "total_focus_time": 45600,
      "total_sessions": 156,
      "current_streak": 7,
      "longest_streak": 28,
      "rank_position": 15,
      "achievements_count": 12
    },
    "time_metrics": {
      "today": {
        "focus_time": 3600,
        "sessions": 4,
        "completed_sessions": 3,
        "productivity_score": 4.2,
        "goal_progress": 0.75
      },
      "week": {
        "focus_time": 18000,
        "sessions": 28,
        "avg_daily": 3600,
        "best_day": "2025-01-15",
        "streak_maintained": true
      },
      "month": {
        "focus_time": 72000,
        "sessions": 45,
        "monthly_goal": 100000,
        "progress": 0.72
      }
    },
    "heatmap_data": [
      {
        "date": "2025-01-16",
        "hours": [
          { "hour": 9, "focus_minutes": 45, "productivity": 4.1 },
          { "hour": 10, "focus_minutes": 60, "productivity": 4.5 }
        ]
      }
    ],
    "leaderboard_position": {
      "daily": { "rank": 8, "total_users": 1250 },
      "weekly": { "rank": 12, "total_users": 1250 },
      "monthly": { "rank": 15, "total_users": 1250 },
      "improvement": "+3"
    },
    "active_session": {
      "id": "session-uuid",
      "type": "focus",
      "start_time": "2025-01-16T10:00:00Z",
      "elapsed_time": 1200,
      "planned_duration": 1500,
      "is_paused": false
    },
    "recent_achievements": [
      {
        "id": "achievement-uuid",
        "name": "Week Warrior",
        "description": "Complete 7 days in a row",
        "earned_at": "2025-01-16T08:00:00Z",
        "badge_icon": "week-warrior.svg"
      }
    ]
  }
}
```

This comprehensive plan provides a complete roadmap for building a feature-rich backend that supports Firebase authentication, real-time session synchronization, comprehensive analytics with heatmaps, leaderboard functionality, and social features - all delivered through an optimized dashboard experience on user login.
