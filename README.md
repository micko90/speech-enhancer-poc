# Speech Enhancer POC

This is a minimal Next.js project that:

1. Accepts an audio upload (WAV/MP3).
2. Uses OpenAI Whisper to transcribe the audio.
3. Uses GPT-4 to enhance the transcript into a persuasive pitch.

## Getting Started

1. **Clone** this repo
2. **Install** dependencies: `npm install`
3. **Set** your API key: create a file `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
4. **Run** locally: `npm run dev`
5. **Deploy**: push to GitHub and connect to Azure Static Web Apps.
   - In Azure portal, set `OPENAI_API_KEY` in Configuration after deployment.

Your app will be live at: `https://<your-app-name>.azurestaticapps.net`
