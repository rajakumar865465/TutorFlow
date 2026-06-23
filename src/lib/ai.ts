const AI_PROVIDER = process.env.AI_PROVIDER || "openai";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export async function generateParentSummary(privateNote: string): Promise<string> {
  if (!AI_API_KEY) {
    return "AI summary unavailable — please configure AI provider settings.";
  }

  const prompt = `You are a warm, professional tutor writing a brief update to a parent about their child's lesson. Based on the tutor's private notes below, write a clean, short, warm, parent-friendly summary. Do not include any negative language. Focus on progress, engagement, and next steps. Keep it to 2-4 sentences. Do not mention this is AI-generated.

Tutor's private notes:
${privateNote}`;

  try {
    if (AI_PROVIDER === "anthropic") {
      const response = await fetch(`${AI_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": AI_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      return data.content?.[0]?.text || "Could not generate summary.";
    }

    // Default: OpenAI-compatible API
    const response = await fetch(`${AI_BASE_URL || "https://api.openai.com"}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Could not generate summary.";
  } catch (err) {
    console.error("AI summary generation error:", err);
    return "AI summary generation failed. Please write manually.";
  }
}
