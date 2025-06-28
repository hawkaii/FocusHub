const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FocusStation Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint for Gemini AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a system prompt for calendar event extraction
    const systemPrompt = `You are a helpful assistant that converts natural language into Google Calendar events. 
    When a user describes an event, meeting, or task, extract the following information and format it as a JSON object:
    
    {
      "isCalendarEvent": true/false,
      "title": "Event title",
      "description": "Event description",
      "startDate": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endDate": "YYYY-MM-DD", 
      "endTime": "HH:MM",
      "location": "Event location (if mentioned)",
      "attendees": ["email1@example.com", "email2@example.com"],
      "response": "Natural language response to the user"
    }
    
    If the message is not about creating a calendar event, set "isCalendarEvent" to false and provide a helpful response.
    Always be conversational and helpful. If dates/times are relative (like "tomorrow", "next week"), convert them to actual dates based on today's date.
    
    Current date and time: ${new Date().toISOString()}`;

    // Build conversation context
    let conversationContext = systemPrompt + '\n\n';
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      conversationContext += `${msg.role}: ${msg.content}\n`;
    });
    
    // Add current message
    conversationContext += `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsedResponse;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a default response
        parsedResponse = {
          isCalendarEvent: false,
          response: text
        };
      }
    } catch (parseError) {
      // If JSON parsing fails, treat as regular response
      parsedResponse = {
        isCalendarEvent: false,
        response: text
      };
    }

    res.json({
      success: true,
      data: parsedResponse,
      rawResponse: text
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        error: 'Invalid or missing Gemini API key',
        message: 'Please check your GEMINI_API_KEY environment variable'
      });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Gemini API quota has been exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
});

// Calendar event creation endpoint (placeholder for future Google Calendar integration)
app.post('/api/calendar/create-event', async (req, res) => {
  try {
    const { eventData } = req.body;
    
    // TODO: Implement Google Calendar API integration
    console.log('Calendar event to create:', eventData);
    
    res.json({
      success: true,
      message: 'Calendar integration coming soon!',
      eventData
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      error: 'Failed to create calendar event',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FocusStation Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Chat endpoint: http://localhost:${PORT}/api/chat`);
  
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not found in environment variables');
    console.warn('   Please add your Gemini API key to the .env file');
  } else {
    console.log('✅ Gemini API key configured');
  }
});