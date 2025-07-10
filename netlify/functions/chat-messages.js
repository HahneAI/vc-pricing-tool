export const handler = async (event, context) => {
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
    
    // Fetch messages from Supabase using REST API
    const supabaseResponse = await fetch(
      `https://acdudelebwrzewxqmwnc.supabase.co/rest/v1/demo_messages?session_id=eq.${sessionId}&sender=eq.ai&order=created_at.asc`,
      {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c'
        }
      }
    );

    if (!supabaseResponse.ok) {
      console.error('Supabase error:', await supabaseResponse.text());
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Database error' })
      };
    }

    const sessionMessages = await supabaseResponse.json();
    
    // Convert to React app format
    const formattedMessages = sessionMessages.map(msg => ({
      id: msg.id.toString(),
      text: msg.message_text,
      sender: msg.sender,
      timestamp: msg.created_at,
      sessionId: msg.session_id
    }));
    
    console.log(`📤 Returning ${formattedMessages.length} messages`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(formattedMessages)
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