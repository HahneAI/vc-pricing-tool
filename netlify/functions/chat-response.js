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
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw body:', event.body);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON in request' })
      };
    }

    const { response, sessionId, timestamp, techId } = requestBody;
    
    // Decode and clean the response
    let decodedResponse = response ? decodeURIComponent(response) : response;
    
    // Limit response size to prevent errors
    if (decodedResponse && decodedResponse.length > 2000) {
      decodedResponse = decodedResponse.substring(0, 1997) + '...';
      console.log('⚠️ Response truncated due to length:', decodedResponse.length);
    }
    
    // Clean any problematic characters
    if (decodedResponse) {
      decodedResponse = decodedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
    
    console.log('📨 Received from Make.com:', { 
      responsePreview: decodedResponse ? decodedResponse.substring(0, 200) + '...' : 'No response',
      sessionId, 
      techId 
    });
    
    // Store message in Supabase demo_messages table
    try {
      const supabaseResponse = await fetch(
        'https://acdudelebwrzewxqmwnc.supabase.co/rest/v1/demo_messages',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
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
        const errorText = await supabaseResponse.text();
        console.error('Supabase error:', supabaseResponse.status, errorText);
        throw new Error(`Supabase error: ${supabaseResponse.status}`);
      }

      // Handle Supabase response properly to avoid JSON parsing errors
      const responseText = await supabaseResponse.text();
      if (responseText && responseText.trim()) {
        try {
          const savedMessage = JSON.parse(responseText);
          console.log('✅ Stored message in Supabase:', savedMessage[0]?.id || 'success');
        } catch (jsonError) {
          console.log('✅ Stored message in Supabase (non-JSON response)');
        }
      } else {
        console.log('✅ Stored message in Supabase (empty response - prefer=minimal)');
      }
      
    } catch (supabaseError) {
      console.error('Supabase storage failed:', supabaseError.message);
      
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
    console.error('Handler Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};