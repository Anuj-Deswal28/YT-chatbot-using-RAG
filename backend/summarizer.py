
from collections import OrderedDict
from threading import Lock

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    pipeline
)

from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled
)

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from prompt import prompt

MODEL_ID = "Qwen/Qwen3-4B"

EMBEDDING_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
RETRIEVER_K = 4

MAX_NEW_TOKENS = 512

MAX_CACHED_VIDEOS = 3

_generator = None
_tokenizer = None

_model_lock = Lock()
_generation_lock = Lock()


def load_local_model():

    print("Loading Qwen3-4B in 4-bit mode...")

    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.float16
    )

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        local_files_only=True
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        quantization_config=quantization_config,
        device_map="auto",
        dtype=torch.float16,
        local_files_only=True
    )

    generator = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer
    )

    print("Qwen3-4B loaded successfully.")

    return generator, tokenizer


def get_local_model():
    global _generator, _tokenizer
    if _generator is None:
        with _model_lock:
            if _generator is None:
                _generator, _tokenizer = load_local_model()

    return _generator, _tokenizer


_embedding_model = None
_embedding_lock = Lock()


def get_embedding_model():

    global _embedding_model

    if _embedding_model is None:

        with _embedding_lock:

            if _embedding_model is None:

                print("Loading embedding model...")

                _embedding_model = HuggingFaceEmbeddings(
                    model_name=EMBEDDING_MODEL_ID,
                    model_kwargs={"device": "cpu"},
                    encode_kwargs={
                        "normalize_embeddings": True
                    }
                )

    return _embedding_model


# ============================================================
# VIDEO / FAISS CACHING
# ============================================================

_video_cache = OrderedDict()
_video_cache_lock = Lock()


def format_docs(retrieved_docs):

    return "\n\n".join(
        doc.page_content for doc in retrieved_docs
    )


def build_vector_store(video_id):

    print(f"Fetching transcript for video: {video_id}")

    try:

        transcript_data = YouTubeTranscriptApi().fetch(
            video_id,
            languages=["en"]
        )

        transcript = " ".join(
            snippet.text for snippet in transcript_data
        )

    except TranscriptsDisabled:

        raise ValueError(
            "Captions are disabled for this video."
        )

    if not transcript.strip():

        raise ValueError(
            "No transcript available for this video."
        )

    print("Splitting transcript...")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )

    chunks = splitter.create_documents([transcript])

    if not chunks:

        raise ValueError(
            "Could not create transcript chunks."
        )

    print(f"Created {len(chunks)} transcript chunks.")

    embedding = get_embedding_model()

    print("Building FAISS vector store...")

    vector_store = FAISS.from_documents(
        chunks,
        embedding
    )

    print("FAISS vector store created.")

    return vector_store


def get_video_vector_store(video_id):

    with _video_cache_lock:

        # Reuse the existing FAISS index if available.
        if video_id in _video_cache:

            print(f"Using cached video: {video_id}")

            _video_cache.move_to_end(video_id)

            return _video_cache[video_id]

        print(f"Video not cached: {video_id}")

        # Build the index only on a cache miss.
        vector_store = build_vector_store(video_id)

        _video_cache[video_id] = vector_store

        # Remove the least recently used video if cache is full.
        if len(_video_cache) > MAX_CACHED_VIDEOS:

            removed_video_id, _ = _video_cache.popitem(
                last=False
            )

            print(
                f"Removed video from cache: {removed_video_id}"
            )

        return vector_store


# ============================================================
# ANSWER GENERATION
# ============================================================

def generate_answer(prompt_value):

    generator, tokenizer = get_local_model()

    # Convert LangChain PromptValue into plain text.
    prompt_text = prompt_value.to_string()

    messages = [
        {
            "role": "user",
            "content": prompt_text
        }
    ]

    formatted_prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False
    )

    # Protect the shared GPU pipeline from concurrent generation.
    with _generation_lock:

        output = generator(
            formatted_prompt,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=False,
            return_full_text=False,
            pad_token_id=tokenizer.eos_token_id
        )

    answer = output[0]["generated_text"].strip()

    return answer


def answer_question(video_id: str, question: str) -> str:

    video_id = video_id.strip()
    question = question.strip()

    if not video_id:

        raise ValueError("Video ID cannot be empty.")

    if not question:

        raise ValueError("Question cannot be empty.")

    # 1. Get cached FAISS vector store or build it.
    vector_store = get_video_vector_store(video_id)

    # 2. Create retriever.
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": RETRIEVER_K}
    )

    # 3. Retrieve relevant transcript chunks.
    print("Retrieving relevant transcript chunks...")

    retrieved_docs = retriever.invoke(question)

    context = format_docs(retrieved_docs)

    # 4. Format the existing RAG prompt.
    prompt_value = prompt.invoke(
        {
            "context": context,
            "question": question
        }
    )

    # 5. Generate answer using local Qwen3.
    print("Generating answer...")

    response = generate_answer(prompt_value)

    return response
