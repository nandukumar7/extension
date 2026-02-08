# SyncCheck – Real-Time Deepfake Detection 🛡️🎥

SyncCheck is an AI-powered browser-based system designed to detect **deepfake or AI-generated faces in real time during live online meetings**. Unlike traditional deepfake detection tools that analyze pre-recorded videos, SyncCheck works **directly during live sessions** (e.g., Google Meet) and provides instant alerts while ensuring user privacy through local processing.

---

## 🚀 Features

- 🔍 **Real-time deepfake detection** during live Google Meet sessions  
- 🧠 **Deep learning-based analysis** using a CNN (Xception model)  
- 🎥 Automatic **live video capture** via Chrome Extension  
- ⚡ **Instant visual & audio alerts** (Real / Fake) with confidence score  
- 🔐 **Privacy-preserving** – no cloud processing, runs locally  
- 🖥️ Lightweight and low-latency (~4–6 seconds per detection)

---

## 🧠 How It Works

1. User joins a Google Meet session  
2. SyncCheck Chrome Extension captures a short video clip (3–7 seconds)  
3. Video is sent to a **local Flask backend**  
4. Frames are extracted and preprocessed using OpenCV  
5. A **CNN (Xception)** model analyzes frames for deepfake artifacts  
6. Result is returned with a confidence score  
7. Extension displays:
   - 🟢 Green border → REAL  
   - 🔴 Red border + sound alert → FAKE  

---

## 🛠️ Tech Stack

### Frontend (Chrome Extension)
- JavaScript
- Chrome Extension APIs (Manifest V3)
- MediaRecorder / Offscreen API
- HTML, CSS

### Backend
- Python
- Flask
- TensorFlow / Keras
- OpenCV
- NumPy
- FFmpeg
<img width="1487" height="808" alt="image" src="https://github.com/user-attachments/assets/fe0828cb-a9c6-4ec5-828f-37203fdc490b" />
<img width="1499" height="749" alt="image" src="https://github.com/user-attachments/assets/7e47c283-749a-4381-85be-811042bff915" />

---

## 📂 Project Structure

