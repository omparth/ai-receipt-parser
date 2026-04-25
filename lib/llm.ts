export async function parseWithLLM(text: string) {
  try {
    const shortText = text.slice(0, 700); 

    const prompt = `
Return ONLY valid JSON.
No explanation.

{
  "vendor": string,
  "date": string,
  "currency": "INR",
  "subtotal": number,
  "tax": number,
  "total": number,
  "items": [
    {
      "description": string,
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ]
}

Receipt:
${shortText}
`;

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3:8b", 
        prompt,
        stream: false,
        keep_alive: "10m"
      }),
    });

    const data = await res.json();

    const raw = data.response?.trim();

    const cleaned = raw
    ?.replace(/```json/g, "")
    ?.replace(/```/g, "")
    ?.trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error("No valid JSON found");
  }
  
  return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.log("❌ LLM FAILED:", err);
    return null;
  }
}
