import { useState, useRef } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [loadingTranscribe, setLoadingTranscribe] = useState(false);
  const [loadingEnhance, setLoadingEnhance] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorderRef.current.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const transcribe = async () => {
    if (!audioBlob) return;
    setLoadingTranscribe(true);
    const form = new FormData();
    form.append("audio", audioBlob, "recording.webm");
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const json = await res.json();
    setTranscript(json.transcript);
    setLoadingTranscribe(false);
  };

  const enhanceText = async () => {
    if (!transcript) return;
    setLoadingEnhance(true);
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: transcript })
    });
    const json = await res.json();
    setEnhanced(json.enhanced);
    setLoadingEnhance(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Enhancer POC</h1>

      {!recording ? (
        <button onClick={startRecording} className="px-4 py-2 bg-green-600 text-white rounded mr-2">
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded mr-2">
          Stop Recording
        </button>
      )}

      {audioBlob && !transcript && (
        <button onClick={transcribe} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded">
          {loadingTranscribe ? "Transcribing…" : "Transcribe Speech"}
        </button>
      )}

      {transcript && !enhanced && (
        <>
          <h2 className="mt-6 font-semibold">Transcript:</h2>
          <p className="whitespace-pre-wrap">{transcript}</p>
          <button onClick={enhanceText} className="mt-4 px-4 py-2 bg-blue-
