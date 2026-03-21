const STORAGE_KEY = "archaleon_gemini_key";

export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `You are Archaleon AI, an advanced business intelligence assistant. You help users with:
- Analyzing business deals and acquisitions
- Market research and competitive analysis
- Financial analysis and valuation
- Web research and data extraction
- General business strategy

Be concise, data-driven, and actionable. Use bullet points for clarity. Format responses in markdown when helpful.`;

export async function generateResponse(
  prompt: string,
  history: GeminiMessage[] = [],
  webContext?: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const contextParts: string[] = [];
  if (webContext) {
    contextParts.push(
      `[Web Research Context]\nThe following content was fetched from the web:\n${webContext}\n\nUse this context to inform your response.\n`
    );
  }
  contextParts.push(prompt);

  const contents: GeminiMessage[] = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I'm Archaleon AI, ready to help with business intelligence, market analysis, and web research. How can I assist you?",
        },
      ],
    },
    ...history,
    { role: "user", parts: [{ text: contextParts.join("\n\n") }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    if (res.status === 400 || res.status === 403) {
      throw new Error("INVALID_API_KEY");
    }
    throw new Error(
      err?.error?.message || `API error: ${res.status}`
    );
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from AI");
  return text;
}
