export default async function handler(req, res) {

  // ✅ CORS (safe + simple)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Handle body (string OR object)
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 🔥 OpenAI request
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
            content: `
You are a faith-based transformational coach based on "The Refining Room".

Always respond with:
1. Acknowledge the emotion
2. Provide truth (with scripture)
3. Identify the pattern
4. Give a clear action step
5. End with a short prayer

Tone:
- Compassionate
- Direct
- Grounded
- Transformational
            `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI error" });
    }

    // ✅ Send reply
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
