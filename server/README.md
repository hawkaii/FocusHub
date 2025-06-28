# FocusStation Backend Server

This is the backend server for the FocusStation chatbot that integrates with Google's Gemini AI to convert natural language into calendar events.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it into your `.env` file

### 4. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and timestamp

### Chat with Gemini AI
- **POST** `/api/chat`
- Body: `{ "message": "Create a meeting tomorrow at 2pm", "conversationHistory": [] }`
- Returns: Gemini AI response with calendar event extraction

### Create Calendar Event (Coming Soon)
- **POST** `/api/calendar/create-event`
- Body: `{ "eventData": {...} }`
- Returns: Calendar event creation status

## Features

- ✅ Gemini AI integration for natural language processing
- ✅ Calendar event extraction from text
- ✅ CORS configuration for frontend integration
- ✅ Error handling and validation
- ✅ Environment variable configuration
- 🔄 Google Calendar API integration (coming soon)

## Testing the API

You can test the chat endpoint using curl:

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Schedule a team meeting tomorrow at 3pm"}'
```

## Next Steps

1. Integrate with Google Calendar API
2. Add user authentication
3. Implement conversation memory
4. Add rate limiting
5. Deploy to production