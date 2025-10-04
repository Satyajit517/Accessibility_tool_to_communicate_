import React, { useState } from "react";
import axios from "axios";
import './stt.css';

const SpeechToText = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/stt/", formData);
      setText(res.data.text || "");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to transcribe audio.");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setFile(null);
    setText("");
    setError("");
  };

  return (
    <div className="pp">
  <label className="custom-file-upload">
    Choose File
    <input type="file" accept="audio/*" onChange={handleFileChange} />
  </label>

  <br />
  {file && (
    <div className="file-actions">
      <p><b>Selected:</b> {file.name}</p>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Transcribe Audio"}
      </button>
      <button onClick={handleClear} className="clear-btn">Clear</button>
    </div>
  )}

  {error && <p className="error">{error}</p>}

  {text && (
    <div className="transcribed-text">
      <h3>📝 Transcribed Text:</h3>
      <br />
      <pre>{text}</pre>
    </div>
  )}
</div>

  );
};

export default SpeechToText;
