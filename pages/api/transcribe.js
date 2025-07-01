import { Configuration, OpenAIApi } from "openai";
import formidable from "formidable";
import fs from "fs/promises";

export const config = { api: { bodyParser: false } };

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const form = new formidable.IncomingForm();
  const { files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
  });
  const buffer = await fs.readFile(files.audio.filepath);
  const transcription = await openai.createTranscription(buffer, "whisper-1");
  res.status(200).json({ transcript: transcription.data.text });
}
