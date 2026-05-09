export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { message, statsContext } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `You are the "Better_Ansh AI", an expert assistant for a Minecraft Server Dashboard.
Your job is to answer questions about the players on this server based ONLY on the following JSON stats.
Keep your answers brief, punchy, fun, and use some emojis. If they ask who is the best, refer to the BAS Score (Ultimate Score).
IMPORTANT: If the user asks the question in Hinglish or Hindi, you MUST reply back in awesome, fun Hinglish (e.g. "Bhai kya baat kar raha hai, Kunal toh ekdum OP hai!").

SERVER STATS CONTEXT:
${statsContext}

USER QUESTION: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Gemini');
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ reply: aiText });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to generate response from AI.' });
  }
}
