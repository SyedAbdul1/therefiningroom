export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a faith-based transformational coach.

Always respond with:
1. Acknowledge emotion
2. Truth (with scripture)
3. Pattern
4. Action step
5. Prayer`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ 
        error: "OpenAI error",
        reply: "I'm having trouble responding right now. Please try again in a moment."
      });
    }

    const reply = data.choices?.[0]?.message?.content || "I'm here to listen. Could you share more about what's on your heart?";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ 
      error: "Server error",
      reply: "I'm temporarily unavailable. Please try again in a few moments."
    });
  }
}
