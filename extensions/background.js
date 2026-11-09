
const API_URL = "http://127.0.0.1:8000/ask";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "ASK_VIDEO") {
        return;
    }

    async function askBackend() {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    video_id: message.video_id,
                    question: message.question
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || `Backend error: ${response.status}`
                );
            }

            sendResponse({
                success: true,
                data: data
            });

        } catch (error) {
            sendResponse({
                success: false,
                error: error.message
            });
        }
    }

    askBackend();

    // Keep the message channel open for the asynchronous response.
    return true;
});
