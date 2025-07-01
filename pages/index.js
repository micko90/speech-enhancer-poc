import { useState, useRef } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const upload = async () => {
    if (!audioBlob) return;
    setLoading(true);
    const form = new FormData();
    form.append("audio", audioBlob, "recording.webm");
    const res = await fetch("/api/enhance", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Enhancer POC</h1>
      {!recording && (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
        >
          Start Recording
        </button>
      )}
      {recording && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-600 text-white rounded mr-2"
        >
          Stop Recording
        </button>
      )}
      {audioBlob && (
        <button
          onClick={upload}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Processing…" : "Enhance Speech"}
        </button>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold">Transcript:</h2>
          <p className="mb-4 whitespace-pre-wrap">{result.transcript}</p>
          <h2 className="font-semibold">Enhanced Pitch:</h2>
          <p className="whitespace-pre-wrap">{result.enhanced}</p>
        </div>
      )}
    </div>
  );
}
