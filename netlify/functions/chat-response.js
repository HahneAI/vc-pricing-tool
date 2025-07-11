export const handler = async (event, context) => {
  // Handle CORS for demo
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { response, sessionId, timestamp, techId } = JSON.parse(event.body);
    
    // Decode the URL-encoded response
    const decodedResponse = decodeURIComponent(response);
    
    console.log('📨 Received from Make.com:', { 
      responseLength: decodedResponse.length, 
      sessionId, 
      techId 
    });
    
    // Simple in-memory storage for demo
    global.demoMessages = global.demoMessages || [];
    
    const newMessage = {
      id: Date.now().toString(),
      text: decodedResponse,
      sender: 'ai',
      timestamp: timestamp || new Date().toISOString(),
      sessionId: sessionId
    };

    global.demoMessages.push(newMessage);
    console.log('✅ Stored demo message:', newMessage.id);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'AI response received',
        messageId: newMessage.id 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};