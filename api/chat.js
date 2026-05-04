export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://blossom-refined-global.myshopify.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Show first few characters of API key for verification (safe)
    const keyPrefix = apiKey ? apiKey.substring(0, 10) : 'MISSING';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 100
      })
    });

    const data = await response.json();
    
    // Return detailed error information
    if (!response.ok) {
      return res.status(200).json({ 
        reply: `❌ OpenAI Error (${response.status}): ${data.error?.message || 'Unknown error'}\n\nKey prefix: ${keyPrefix}...\n\nFix: ${data.error?.code === 'invalid_api_key' ? 'Your API key is invalid. Generate a new one at https://platform.openai.com/api-keys' : 'Check your OpenAI account billing at https://platform.openai.com/account/billing'}`
      });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(200).json({ 
      reply: `❌ Server Error: ${error.message}`
    });
  }
}
