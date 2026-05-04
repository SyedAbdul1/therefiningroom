export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://blossom-refined-global.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
            content: `
You are a faith-based transformational coach.

Always respond with:
1. Acknowledge emotion
2. Truth (with scripture)
3. Pattern
4. Action step
5. Prayer
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

    // 🔴 IMPORTANT DEBUG
    console.log("OPENAI RESPONSE:", data);

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
