import { Configuration, OpenAIApi } from "openai";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: { bodyParser: false }
};

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // parse uploaded file
  const form = new formidable.IncomingForm();
  const data = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
  const file = data.files.audio;
  const buffer = await fs.readFile(file.filepath);

  // 1) Transcribe with Whisper
  const transcription = await openai.createTranscription(
    buffer,
    "whisper-1"
  );
  const transcript = transcription.data.text;

  // 2) Enhance with GPT-4
  const chatResp = await openai.createChatCompletion({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content:
        "You are an expert storyteller. Rewrite the user transcript into a punchy, persuasive project pitch with a strong hook, clear problem statement, solution, and call-to-action."},
      { role: "user", content: transcript }
    ],
    temperature: 0.7
  });

  const enhanced = chatResp.data.choices[0].message.content;
  res.status(200).json({ transcript, enhanced });
}
