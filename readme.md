# Anuj's YT RAG

A local YouTube video question-answering tool. The Chrome extension adds an assistant panel to YouTube. It sends the current video's ID and your question to a local FastAPI backend, which retrieves relevant transcript chunks and generates an answer with Qwen3-4B.

## Features

- Ask questions about the currently open YouTube video.
- Retrieve context from the video's English transcript using embeddings and FAISS.
- Generate answers locally with Qwen3-4B.
- Display one question and one answer at a time; a new question replaces the previous pair.

## Project structure

```text
YT-video-RAG/
├── backend/
│   ├── api.py
│   ├── prompt.py
│   └── summarizer.py
├── extension/
│   ├── manifest.json
│   ├── content.js
│   └── background.js
├── README.md
└── requirements.txt
```

## Requirements

- Windows 10/11
- Python 3.11 recommended
- Google Chrome
- An NVIDIA GPU supported by your installed PyTorch and bitsandbytes versions is recommended
- Internet access for initial model/embedding downloads and YouTube transcript retrieval

The backend loads Qwen3-4B with 4-bit quantization. Performance and memory requirements depend on your GPU and software versions.

## Local setup

### 1. Get the project

Place or clone the project on your machine. Open PowerShell in the project root (the folder containing `backend`, `extension`, and `requirements.txt`).

### 2. Create and activate a virtual environment

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this in the current terminal session and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 3. Install PyTorch

Install a PyTorch build that matches your NVIDIA driver and CUDA support. Use the official selector to get the correct command:

https://pytorch.org/get-started/locally/

Install PyTorch before the remaining packages so that you get the appropriate GPU-enabled build.

### 4. Install the remaining Python dependencies

From the project root:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Download the language model

The backend uses `Qwen/Qwen3-4B`. If the backend is configured to load only from the local Hugging Face cache, download the model once before starting the API:

```powershell
hf download Qwen/Qwen3-4B
```

The model download is several gigabytes. The embedding model may also be downloaded the first time it is initialized. Keep internet access available for these initial downloads.

### 6. Start the backend

Open PowerShell in the `backend` directory, with the virtual environment activated:

```powershell
cd backend
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Keep this terminal open while using the extension.

Check the backend:

- Health check: http://127.0.0.1:8000/health
- API documentation: http://127.0.0.1:8000/docs

The API listens on localhost. Do not expose it publicly unless you have added appropriate authentication and security controls.

### 7. Load the Chrome extension

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project's `extension` folder.
5. Open or refresh a YouTube video page.

After changing extension files, click the extension's **Reload** button on `chrome://extensions`, then refresh the YouTube tab.

## User guide

1. Start the FastAPI backend.
2. Open a YouTube video page.
3. Click the floating assistant button on the right side.
4. Choose a suggested prompt or type a question.
5. Press **Send** and wait for the model to respond.
6. The panel shows only the latest question and answer. A new question replaces the previous pair.

The current backend requests an English transcript, so the video needs an accessible English transcript.

## API

### `GET /health`

Checks whether the backend is responding.

### `POST /ask`

Request body:

```json
{
  "video_id": "YOUTUBE_VIDEO_ID",
  "question": "Summarize this video"
}
```

A successful response contains `video_id`, `question`, and `answer`.

## Troubleshooting

- **Assistant button does not appear:** Reload the unpacked extension at `chrome://extensions`, refresh the YouTube tab, and check the extension's error details.
- **Extension cannot reach the backend:** Make sure Uvicorn is running at `http://127.0.0.1:8000` and that the manifest grants host permission for this address.
- **Transcript error:** The video may not have an accessible English transcript. Try a video with English captions/transcript.
- **First request is slow:** Model and embedding initialization, transcript retrieval, and index creation can take time. Later questions for a cached video should be faster.
- **CUDA or bitsandbytes errors:** Check compatibility between your NVIDIA driver, PyTorch CUDA build, Python version, and bitsandbytes. Reinstall PyTorch using the official selector if needed.
- **Out-of-memory errors:** Close other GPU-heavy applications. A 4-bit model still needs GPU memory for its weights and runtime operations.

## Notes

- Model inference runs locally; the backend does not use a hosted LLM API.
- YouTube transcript retrieval requires network access.
- Initial model and embedding downloads require network access.
- Keep `background.js`, `content.js`, and `manifest.json` together in the `extension` folder.
