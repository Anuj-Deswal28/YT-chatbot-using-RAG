
from huggingface_hub import snapshot_download

MODEL_ID = "Qwen/Qwen3-4B"

model_path = snapshot_download(
    repo_id=MODEL_ID
)

print("\nModel downloaded successfully!")
print("Model location:", model_path)
