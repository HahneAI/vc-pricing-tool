exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  try {
    // Extract session ID from path
    const pathSegments = event.path.split('/');
    const sessionId = pathSegments[pathSegments.length - 1];
    
    console.log('📥 Getting messages for session:', sessionId);
    
    global.demoMessages = global.demoMessages || [];
    
    const sessionMessages = global.demoMessages.filter(msg => 
      msg.sessionId === sessionId && msg.sender === 'ai'
    );
    
    console.log(`📤 Returning ${sessionMessages.length} messages`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(sessionMessages)
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