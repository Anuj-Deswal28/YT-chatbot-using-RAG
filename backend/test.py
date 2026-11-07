from summarizer import answer_question

video_id = "BlFj8dY8PYs"

question = "What are the main topics discussed in this video?"

answer = answer_question(video_id, question)

print("\nANSWER:\n")
print(answer)

answer = answer_question(video_id, question)
print("\nANSWER 1:\n", answer)

answer = answer_question(
    video_id,
    "What are the technical challenges discussed in the video?"
)
print("\nANSWER 2:\n", answer)