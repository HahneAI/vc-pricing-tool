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
    const decodedResponse = response ? decodeURIComponent(response) : response;
    
    console.log('📨 Received from Make.com:', { response: decodedResponse, sessionId, techId });
    
    // Store message in Supabase demo_messages table
    const supabaseResponse = await fetch(
      'https://acdudelebwrzewxqmwnc.supabase.co/rest/v1/demo_messages',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          message_text: decodedResponse,
          sender: 'ai',
          tech_id: techId,
          created_at: timestamp || new Date().toISOString()
        })
      }
    );

    if (!supabaseResponse.ok) {
      console.error('Supabase error:', await supabaseResponse.text());
      // Fallback to in-memory storage if Supabase fails
      global.demoMessages = global.demoMessages || [];
      global.demoMessages.push({
        id: Date.now().toString(),
        text: decodedResponse,
        sender: 'ai',
        timestamp: timestamp || new Date().toISOString(),
        sessionId: sessionId
      });
      console.log('✅ Stored demo message in memory (fallback)');
    } else {
      const savedMessage = await supabaseResponse.json();
      console.log('✅ Stored message in Supabase:', savedMessage[0]?.id);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'AI response received',
        messageId: Date.now().toString()
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