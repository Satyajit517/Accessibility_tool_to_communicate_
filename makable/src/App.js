import React, { useState } from "react";
import './App.css';
import TextToSpeech from "./component/tts";
import SpeechToText from "./component/STTPage";
import ImageToText from "./component/ImageToText";

function App() {
  const [activeTab, setActiveTab] = useState("tts");

  return (
    <div className="dashboard">
      <h1>AI-Powered Accessibility Tool</h1>

      <div className="pages">
        <button onClick={() => setActiveTab("tts")}>Text → Speech</button>
        <button onClick={() => setActiveTab("stt")} style={{ marginLeft: "10px" }}>
          Speech → Text
        </button>
        <button onClick={() => setActiveTab("ocr")} style={{ marginLeft: "10px" }}>
          Image → Text
        </button>
      </div>

      <div>
        {activeTab === "tts" && <TextToSpeech />}
        {activeTab === "stt" && <SpeechToText />}
        {activeTab === "ocr" && <ImageToText />}
      </div>
    </div>
  );
}

export default App;
