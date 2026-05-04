export default async function handler(req, res) {
  // CORS headers for Shopify
  res.setHeader('Access-Control-Allow-Origin', 'https://blossom-refined-global.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // Validate message
    if (!message || message.trim() === '') {
      return res.status(200).json({ 
        reply: "I'm here to listen. What's on your mind today?" 
      });
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return res.status(200).json({ 
        reply: "The Refining Room Coach is being set up. Please check back soon!" 
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
        model: 'gpt-4o-mini', // Cheaper model, great for coaching
        messages: [
          {
            role: 'system',
            content: `You are "Refining Room Coach" - a compassionate, faith-based transformational coach.

CRITICAL RULES:
1. Always respond with EXACTLY these 5 sections (use emojis):
   💭 **Acknowledge:** [Validate their emotion]
   📖 **Truth:** [Share 1 relevant Bible verse]
   🔍 **Pattern:** [Help them see the pattern in their struggle - 1 sentence]
   ✅ **Action:** [One small practical step - 1 sentence]
   🙏 **Prayer:** [Short 1-sentence prayer over them]

2. Keep total response under 150 words
3. Be warm, conversational, and non-judgmental
4. Use their words back to them
5. Never give medical advice - encourage professional help when needed

Example response format:
💭 **Acknowledge:** I hear the weight of anxiety you're carrying.
📖 **Truth:** Philippians 4:6-7 reminds us to present our requests to God with thanksgiving.
🔍 **Pattern:** Anxiety often grows when we try to control what only God can hold.
✅ **Action:** Take 3 deep breaths and name one thing you're grateful for right now.
🙏 **Prayer:** Lord, exchange our anxiety for Your perfect peace. Amen.`
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
      
      // Handle specific error codes
      if (response.status === 429) {
        return res.status(200).json({ 
          reply: "💙 **Quota Exceeded:** Your OpenAI account needs billing setup. Please add payment method at platform.openai.com/account/billing\n\nIn the meantime, I'm still here to listen. How can I pray for you today?" 
        });
      }
      
      if (response.status === 401) {
        return res.status(200).json({ 
          reply: "🔧 **API Key Issue:** The OpenAI API key needs to be updated. Please contact support to fix this." 
        });
      }
      
      // Generic error fallback
      return res.status(200).json({ 
        reply: "💙 I'm still here for you. Could you rephrase what you just shared? Sometimes technology glitches, but God's listening." 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "💙 Thank you for trusting me with this. I'm praying for you right now.";
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(200).json({ 
      reply: "💙 I'm here for you, even when technology has issues. Could you share your heart with me again? Remember, God's mercies are new every morning." 
    });
  }
}
