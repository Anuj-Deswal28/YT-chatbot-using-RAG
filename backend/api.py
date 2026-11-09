
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from summarizer import answer_question


app = FastAPI(
    title="YouTube RAG API",
    description="Ask questions about YouTube videos using local Qwen3.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


class QuestionRequest(BaseModel):

    video_id: str = Field(min_length=1)

    question: str = Field(min_length=1)


class AnswerResponse(BaseModel):

    video_id: str

    question: str

    answer: str


@app.get("/health")
def health_check():

    return {
        "status": "running",
        "message": "YouTube RAG API is ready."
    }


@app.post("/ask", response_model=AnswerResponse)
def ask_question(request: QuestionRequest):

    try:

        answer = answer_question(
            video_id=request.video_id,
            question=request.question
        )

        return AnswerResponse(
            video_id=request.video_id,
            question=request.question,
            answer=answer
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        print("API Error:", str(error))

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the question."
        )
