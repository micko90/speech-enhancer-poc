import { useState, useRef } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [loadingTranscribe, setLoadingTranscribe] = useState(false);
  const [loadingEnhance, setLoadingEnhance] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = () =>
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
      recorder.start();
      setRecording(true);
    } catch {
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const transcribe = async () => {
    if (!audioBlob) return;
    setError("");
    setLoadingTranscribe(true);
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error || `Error ${res.status}`);
      const { transcript: txt } = await res.json();
      setTranscript(txt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTranscribe(false);
    }
  };

  const enhanceText = async () => {
    if (!transcript) return;
    setError("");
    setLoadingEnhance(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript })
      });
      if (!res.ok) throw new Error((await res.json()).error || `Error ${res.status}`);
      const { enhanced: en } = await res.json();
      setEnhanced(en);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEnhance(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Enhancer POC</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!recording ? (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-600 text-white rounded mr-2"
        >
          Stop Recording
        </button>
      )}

      {audioBlob && !transcript && (
        <button
          onClick={transcribe}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded"
        >
          {loadingTranscribe ? "Transcribing…" : "Transcribe Speech"}
        </button>
      )}

      {transcript && (
        <>
          <h2 className="mt-6 font-semibold">Transcript:</h2>
          <p className="whitespace-pre-wrap mb-4">{transcript}</p>
        </>
      )}

      {transcript && !enhanced && (
        <button
          onClick={enhanceText}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loadingEnhance ? "Enhancing…" : "Enhance Text"}
        </button>
      )}

      {enhanced && (
        <div className="mt-6">
          <h2 className="font-semibold">Enhanced Pitch:</h2>
          <p className="whitespace-pre-wrap">{enhanced}</p>
        </div>
      )}
    </div>
  );
}
