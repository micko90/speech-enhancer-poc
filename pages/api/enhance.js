import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing 'text' in request" });

  const chatResp = await openai.createChatCompletion({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "You are an expert storyteller. Rewrite the user transcript into a punchy, persuasive project pitch with a strong hook, clear problem statement, solution, and call-to-action." },
      { role: "user", content: text }
    ],
    temperature: 0.7
  });

  res.status(200).json({ enhanced: chatResp.choices?.[0]?.message?.content || '' });
}
