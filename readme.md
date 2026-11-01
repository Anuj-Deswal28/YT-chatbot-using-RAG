Trying to undersand the working of RAG by building this project, eventually could come in form of a chrome plugin.

# YouTube Video Q&A using RAG

A Retrieval-Augmented Generation (RAG) application that answers questions about a YouTube video using its transcript.

## Features
- Fetches English transcripts from YouTube videos.
- Splits transcripts into smaller chunks with overlapping text.
- Generates embeddings using OpenAI's `text-embedding-3-small`.
- Stores embeddings in a FAISS vector database.
- Retrieves the most relevant transcript chunks for a given question.
- Generates answers using `gpt-4o-mini`, strictly based on the retrieved context.

## Tech Stack
- Python
- YouTube Transcript API
- LangChain
- OpenAI API
- FAISS

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Install dependencies:
   ```bash
   pip install youtube-transcript-api langchain-text-splitters langchain-openai langchain-community faiss-cpu
   ```

4. Set your OpenAI API key:
   ```python
   os.environ["OPENAI_API_KEY"] = "YOUR_API_KEY"
   ```

## Usage

1. Add your YouTube video ID to the `video_id` variable.
2. Enter your question in the `question` variable.
3. Run the Python script:
   ```bash
   python main.py
   ```

The application retrieves relevant transcript sections and generates an answer based on the video content.

## Note
- Only videos with available English transcripts can be processed.
- An OpenAI API key is required for embeddings and LLM responses.
