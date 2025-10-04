import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from gtts import gTTS
from pydub import AudioSegment
import pytesseract
from PIL import Image
from vosk import Model, KaldiRecognizer
import wave
import json


# -----------------------
# Setup
# -----------------------
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = r"C:\temp_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------
# Tesseract OCR Path
# -----------------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# -----------------------
# Vosk STT Model
# -----------------------
VOSK_MODEL_PATH = r"C:\vosk-model-small-en-us-0.15"
if not os.path.exists(VOSK_MODEL_PATH):
    raise Exception(f"Vosk model not found at {VOSK_MODEL_PATH}")
vosk_model = Model(VOSK_MODEL_PATH)

# -----------------------
# 1. Text → Speech (TTS)
# -----------------------
@app.post("/tts/")
async def text_to_speech(text: str = Form(None), file: UploadFile = File(None)):
    try:
        if file:
            # Read text from uploaded file
            file_text = await file.read()
            text_content = file_text.decode("utf-8")
        elif text:
            text_content = text
        else:
            return JSONResponse({"error": "No text provided"}, status_code=400)

        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        tts = gTTS(text=text_content, lang="en")
        tts.save(filepath)
        return FileResponse(filepath, media_type="audio/mpeg", filename="output.mp3")
    except Exception as e:
        return JSONResponse({"error": f"TTS failed: {str(e)}"}, status_code=500)

# -----------------------
# 2. Speech → Text (STT)
# -----------------------

@app.post("/stt/")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)

        wav_path = filepath + ".wav"
        AudioSegment.from_file(filepath).set_frame_rate(16000).set_channels(1).export(
            wav_path, format="wav"
        )

        wf = wave.open(wav_path, "rb")
        rec = KaldiRecognizer(vosk_model, wf.getframerate())
        rec.SetWords(True)

        final_text = ""

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                res_json = rec.Result()
                if res_json:
                    try:
                        res = json.loads(res_json)
                        final_text += res.get("text", "") + " "
                    except Exception as e:
                        print("Error parsing interim result:", e)

        # Final result
        final_res_json = rec.FinalResult()
        if final_res_json:
            try:
                res = json.loads(final_res_json)
                final_text += res.get("text", "")
            except Exception as e:
                print("Error parsing final result:", e)

        wf.close()

        # Cleanup
        try:
            os.remove(filepath)
            os.remove(wav_path)
        except:
            pass

        return JSONResponse({"text": final_text.strip()})
    except Exception as e:
        print("STT Exception:", e)
        return JSONResponse({"error": f"STT failed: {str(e)}"}, status_code=500)


# -----------------------
# 3. Image → Text (OCR)
# -----------------------
@app.post("/image-to-text/")
async def image_to_text(file: UploadFile = File(...)):
    if not file:
        return JSONResponse({"error": "Please upload an image."}, status_code=400)
    try:
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)

        img = Image.open(filepath)
        img = img.convert("RGB")
        extracted_text = pytesseract.image_to_string(img)

        os.remove(filepath)
        return JSONResponse({"text": extracted_text.strip()})
    except Exception as e:
        return JSONResponse({"error": f"OCR failed: {str(e)}"}, status_code=500)
