
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    pipeline
)

MODEL_ID = "C:/Users/anujd/.cache/huggingface/hub/models--Qwen--Qwen3-4B/snapshots/1cfa9a7208912126459214e8b04321603b3df60c"

# Configure 4-bit quantization
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

print("Loading model in 4-bit mode...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=quantization_config,
    device_map="auto",
    dtype=torch.float16
)

print("Creating text-generation pipeline...")
generator = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer
)

messages = [
    {
        "role": "user",
        "content": "Explain Retrieval Augmented Generation (RAG) in simple terms."
    }
]

prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False
)

print("\nGenerating response...\n")

output = generator(
    prompt,
    max_new_tokens=200,
    do_sample=False,
    return_full_text=False
)

print(output[0]["generated_text"])

print("\nGPU memory allocated:",
      round(torch.cuda.memory_allocated(0) / 1024**3, 2), "GB")
