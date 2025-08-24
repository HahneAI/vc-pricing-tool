// Replace your netlify/functions/chat-messages.js with this enhanced version:

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
    // ENHANCED: More robust session ID extraction
    let sessionId;
    try {
      const pathSegments = event.path.split('/');
      sessionId = pathSegments[pathSegments.length - 1];
      
      // Validate session ID format
      if (!sessionId || sessionId.length < 10) {
        throw new Error('Invalid session ID format');
      }
      
      console.log('📥 CONCURRENCY DEBUG - Session extracted:', sessionId);
      console.log('📥 CONCURRENCY DEBUG - Full path:', event.path);
      
    } catch (pathError) {
      console.error('❌ Session ID extraction failed:', pathError);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid session ID in path' })
      };
    }
  
    // ENHANCED: More robust since parameter extraction
    let since;
    try {
      const url = new URL(`https://example.com${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`);
      since = url.searchParams.get('since') || '1970-01-01T00:00:00.000Z';
      
      // Validate since timestamp
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        since = '1970-01-01T00:00:00.000Z';
        console.warn('⚠️ Invalid since timestamp, using fallback');
      }
      
      console.log('📥 CONCURRENCY DEBUG - Since parameter:', since);
      
    } catch (urlError) {
      console.error('❌ URL parsing failed:', urlError);
      since = '1970-01-01T00:00:00.000Z';
    }

    console.log('📥 CONCURRENCY DEBUG - Starting Supabase query for session:', sessionId);
    
    // ENHANCED: More robust Supabase query with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const supabaseResponse = await fetch(
        `https://acdudelebwrzewxqmwnc.supabase.co/rest/v1/demo_messages?session_id=eq.${encodeURIComponent(sessionId)}&sender=eq.ai&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc`,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZHVkZWxlYndyemV3eHFtd25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzUxNTcsImV4cCI6MjA2NTQ1MTE1N30.HnxT5Z9EcIi4otNryHobsQCN6x5M43T0hvKMF6Pxx_c',
            'Cache-Control': 'no-cache', // Prevent caching issues under concurrent load
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      console.log('📥 CONCURRENCY DEBUG - Supabase response status:', supabaseResponse.status);
      
      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        console.error('❌ Supabase error:', supabaseResponse.status, errorText);
        return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Database error', details: errorText })
        };
      }

      const sessionMessages = await supabaseResponse.json();
      console.log('📥 CONCURRENCY DEBUG - Raw messages from DB:', sessionMessages.length);
      
      // ENHANCED: Better message formatting with validation
      const formattedMessages = sessionMessages.map(msg => {
        try {
          return {
            id: msg.id ? msg.id.toString() : `temp_${Date.now()}`,
            text: msg.message_text || 'No message text',
            sender: msg.sender || 'ai',
            timestamp: msg.created_at || new Date().toISOString(),
            sessionId: msg.session_id || sessionId
          };
        } catch (formatError) {
          console.error('❌ Message formatting error:', formatError, msg);
          return null;
        }
      }).filter(msg => msg !== null); // Remove any failed messages
      
      console.log(`📤 CONCURRENCY DEBUG - Returning ${formattedMessages.length} formatted messages for session: ${sessionId}`);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(formattedMessages)
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Supabase query timeout');
        return {
          statusCode: 408,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Database query timeout' })
        };
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ CONCURRENCY DEBUG - Handler Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};