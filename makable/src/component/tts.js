import React, { useState } from "react";
import './tts.css';
import axios from "axios";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text && !file) {
      setError("Please enter text or upload a file.");
      return;
    }

    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/tts/", formData, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setError("❌ TTS failed.");
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText("");
  };

  return (
    <div className="cont">
      <div className="type-text">
        <textarea
          rows={5}
          cols={50}
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        /></div>
      <br />
      <div className="out">
        <div className="btn">
          <label className="custom-file-upload">
            Choose File
            <input type="file" accept=".txt" onChange={handleFileChange} />
          </label>
          {file && <span style={{ marginLeft: "10px" }}>{file.name}</span>}
        </div>

        <br />
        <div className="cts">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Convert to Speech"}
          </button></div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {audioUrl && (
          <div className="output">
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;
