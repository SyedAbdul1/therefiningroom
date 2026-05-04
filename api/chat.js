export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://blossom-refined-global.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(200).json({ 
        reply: "I'm here to listen. What's on your mind today?" 
      });
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return res.status(200).json({ 
        reply: "I'm here to support you. Could you tell me more about what you're feeling?" 
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate, faith-based transformational coach named "Refining Room Coach".

Always structure your responses with:
1. **Acknowledge** - Validate their emotion
2. **Truth** - Share a relevant Bible verse
3. **Pattern** - Help them see the pattern in their struggle
4. **Action** - Give one small practical step
5. **Prayer** - A short prayer over them

Keep responses warm, concise, and conversational.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    // Handle OpenAI API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      
      // Return a graceful fallback response
      return res.status(200).json({ 
        reply: "Thank you for sharing. I want to respond thoughtfully. Could you tell me a bit more about what's on your heart?" 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Thank you for trusting me with this. I'm praying for you right now.";
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error Details:', error);
    
    // Always return 200 with a fallback message to prevent frontend errors
    return res.status(200).json({ 
      reply: "I'm here for you, even when technology glitches. Could you share your heart with me again?" 
    });
  }
}
