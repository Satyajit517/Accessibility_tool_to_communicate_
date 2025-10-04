import React, { useState } from "react";
import axios from "axios";
import './itt.css';

const ImageToText = () => {
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
      setError("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/image-to-text/", formData);
      setText(res.data.text || "");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to extract text.");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setFile(null);
    setText("");
    setError("");
  };

  return (
    <div className="op">
  <label className="custom-file-upload">
    Choose Image
    <input type="file" accept="image/*" onChange={handleFileChange} />
  </label>

  {file && (
    <div className="file-actions">
      <p><b>Selected:</b> {file.name}</p>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Extract Text"}
      </button>
      <button onClick={handleClear} className="clear-btn">Clear</button>
    </div>
  )}

  {error && <p className="error">{error}</p>}

  {text && (
    <div className="transcribed-text">
      <h3>📝 Extracted Text:</h3>
      <pre>{text}</pre>
    </div>
  )}
</div>

  );
};

export default ImageToText;
