import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("audio", file);
    const res = await fetch("/api/enhance", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Enhancer POC</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={upload}
        disabled={!file || loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing…" : "Enhance Speech"}
      </button>

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
