

(() => {
    if (document.getElementById("video-ai-host")) return;

    const host = document.createElement("div");
    host.id = "video-ai-host";

    const shadow = host.attachShadow({ mode: "open" });

    // -------------------------
    // STYLES
    // -------------------------

    const style = document.createElement("style");

    style.textContent = `
        :host {
            all: initial;
            font-family: Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        /* Floating AI button */

        .ai-button {
            position: fixed;
            right: 22px;
            top: 50%;
            transform: translateY(-50%);

            width: 44px;
            height: 44px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 1px solid rgba(255,65,65,0.65);
            border-radius: 50%;

            background: rgba(20,10,10,0.55);
            color: #ff4545;

            box-shadow: 0 0 10px rgba(255,35,35,0.2);

            backdrop-filter: blur(8px);
            cursor: pointer;
            z-index: 999999;

            transition: all 0.3s ease;
        }

        .ai-button:hover {
            box-shadow:
                0 0 14px rgba(255,35,35,0.5),
                0 0 28px rgba(255,35,35,0.2);

            transform: translateY(-50%) scale(1.08);
        }

        .ai-button svg {
            width: 22px;
            height: 22px;
        }

        .hidden {
            display: none !important;
        }

        /* Sidebar */

        .ai-panel {
            position: fixed;
            right: 24px;
            top: 50%;

            width: 390px;
            height: min(760px, calc(100vh - 40px));

            transform: translateY(-50%) translateX(30px);
            opacity: 0;

            display: flex;
            flex-direction: column;

            border: 1px solid rgba(255,65,75,0.9);
            border-radius: 28px;

            background: rgba(25, 12, 15, 0.48);

            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);

            box-shadow:
                0 0 8px rgba(255,35,45,0.35),
                0 0 22px rgba(255,35,45,0.20),
                inset 0 0 15px rgba(255,35,45,0.08);

            overflow: hidden;
            z-index: 999998;

            visibility: hidden;
            pointer-events: none;

            transition:
                opacity 0.35s ease,
                transform 0.4s cubic-bezier(.2,.8,.2,1),
                visibility 0.35s;
        }

        .ai-panel.open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;

            transform: translateY(-50%) translateX(0);
        }

        /* Header */

        .panel-header {
            height: 68px;
            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 0 22px;
            background: rgba(35, 12, 15, 0.18);

            border-bottom: 1px solid rgba(255,65,65,0.2);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;

            color: white;
            font-size: 20px;
            font-weight: 700;

            text-shadow: 0 0 10px rgba(255,50,50,0.5);
        }

        .brand-icon {
            width: 32px;
            height: 24px;
            border-radius: 7px;

            background: #ff2020;

            display: flex;
            align-items: center;
            justify-content: center;

            color: white;
            font-size: 14px;
        }

        .header-actions {
            display: flex;
            gap: 14px;
        }

        .header-actions button {
            background: transparent;
            border: none;
            color: white;

            font-size: 24px;
            cursor: pointer;

            opacity: 0.8;
            transition: opacity 0.2s;
        }

        .header-actions button:hover {
            opacity: 1;
        }

        /* Main content */

        .panel-content {
            flex: 1;
            min-height: 0;

            display: flex;
            flex-direction: column;
            align-items: center;

            padding: 24px 18px;
            overflow-y: auto;
        }

        /* Animated AI orb */

        .orb-container {
            width: 190px;
            height: 190px;

            display: flex;
            align-items: center;
            justify-content: center;

            position: relative;
            flex-shrink: 0;

            margin-top: 5px;
        }

        .orb-ring {
            position: absolute;

            width: 145px;
            height: 145px;

            border-radius: 50%;
            border: 2px solid transparent;

            border-top-color: #ff3333;
            border-bottom-color: #ff5555;

            box-shadow:
                0 0 12px #ff2222,
                inset 0 0 12px rgba(255,30,30,0.3);

            animation: rotateOrb 5s linear infinite;
        }

        .orb-ring.second {
            width: 165px;
            height: 165px;

            border-left-color: rgba(255,55,55,0.8);
            border-right-color: rgba(255,55,55,0.3);

            animation: rotateOrb 8s linear infinite reverse;
        }

        .orb-core {
            width: 82px;
            height: 82px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background: radial-gradient(
                circle,
                #ff7777 0%,
                #ed1717 45%,
                #610000 100%
            );

            box-shadow:
                0 0 20px rgba(255,20,20,0.8),
                0 0 45px rgba(255,20,20,0.4);

            animation: orbPulse 2.5s ease-in-out infinite;
        }

        .orb-core svg {
            width: 35px;
            height: 35px;
            color: white;
        }

        @keyframes rotateOrb {
            to { transform: rotate(360deg); }
        }

        @keyframes orbPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
        }

        /* Welcome text */

        .welcome-title {
            color: white;
            font-size: 27px;
            font-weight: 700;
            margin-top: 8px;
            text-align: center;
        }

        .welcome-subtitle {
            color: rgba(255,255,255,0.75);
            font-size: 15px;
            margin-top: 8px;
            text-align: center;
        }

        /* Suggested questions */

        .suggestions {
            width: 100%;

            display: flex;
            flex-direction: column;
            gap: 12px;

            margin-top: 30px;
        }

        .suggestion {
            width: 100%;
            min-height: 50px;

            display: flex;
            align-items: center;
            gap: 13px;

            padding: 10px 16px;

            border-radius: 28px;
            border: 1px solid rgba(255,255,255,0.12);

            background: rgba(20,15,15,0.25);
            backdrop-filter: blur(5px);

            color: white;
            font-size: 14px;
            text-align: left;

            cursor: pointer;

            transition: all 0.25s ease;
        }

        .suggestion:hover {
            border-color: rgba(255,50,50,0.7);
            box-shadow: 0 0 14px rgba(255,30,30,0.2);
            transform: translateX(3px);
        }

        .suggestion-icon {
            color: #ff4141;
            font-size: 19px;
            font-weight: bold;
        }

        /* Input area */

        .composer {
            width: 100%;
            min-height: 64px;
            flex-shrink: 0;

            display: flex;
            align-items: center;
            gap: 10px;

            padding: 8px 10px 8px 18px;

            border-radius: 35px;
            border: 1px solid rgba(255,60,60,0.65);

            background: rgba(15,10,10,0.35);

            box-shadow:
                0 0 12px rgba(255,30,30,0.12),
                inset 0 0 10px rgba(255,30,30,0.05);
        }

        .composer input {
            flex: 1;
            min-width: 0;

            border: none;
            outline: none;

            background: transparent;

            color: white;
            font-size: 14px;
        }

        .composer input::placeholder {
            color: rgba(255,255,255,0.65);
        }

        .send-button {
            width: 44px;
            height: 44px;

            border: none;
            border-radius: 50%;

            background: #ed2222;
            color: white;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;
            transition: all 0.2s;
        }

        .send-button:hover {
            background: #ff3939;
            box-shadow: 0 0 15px rgba(255,30,30,0.6);
            transform: scale(1.06);
        }

        .send-button svg {
            width: 20px;
            height: 20px;
        }

        
        /* Single question and answer display */

        .result-view {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-top: 24px;
        }

        .message-label {
            color: rgba(255,255,255,0.65);
            font-size: 12px;
            margin-bottom: 7px;
        }

        .user-message {
            padding: 13px 15px;
            border-radius: 16px;
            background: rgba(255,255,255,0.09);
            border: 1px solid rgba(255,255,255,0.12);
            color: white;
            font-size: 14px;
            line-height: 1.5;
            overflow-wrap: anywhere;
        }

        .ai-message {
            padding: 16px;
            border-radius: 16px;
            background: rgba(220,35,45,0.10);
            border: 1px solid rgba(255,65,75,0.25);
            color: white;
            font-size: 14px;
            line-height: 1.65;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }



        @media (max-width: 500px) {
            .ai-panel {
                right: 10px;
                width: calc(100vw - 20px);
                height: calc(100vh - 20px);
            }
        }
    `;

    // -------------------------
    // FLOATING BUTTON
    // -------------------------

    const button = document.createElement("button");

    button.className = "ai-button";
    button.title = "Ask this video";
    button.setAttribute("aria-label", "Open Video AI assistant");

    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3L13.8 9.2L20 11L13.8 12.8L12 19L10.2 12.8L4 11L10.2 9.2L12 3Z"/>
            <path d="M19 14L20 17L23 18L20 19L19 22L18 19L15 18L18 17L19 14Z"/>
        </svg>
    `;

    // -------------------------
    // SIDEBAR
    // -------------------------

    const panel = document.createElement("section");
    panel.className = "ai-panel";

    panel.innerHTML = `
        <div class="panel-header">

            <div class="brand">
                <div class="brand-icon">▶</div>
                <span>ANUJ YT RAG</span>
            </div>

            <div class="header-actions">
                <button class="minimize" title="Minimize">−</button>
                <button class="close" title="Close">×</button>
            </div>

        </div>

        <div class="panel-content">

            <div class="orb-container">
                <div class="orb-ring"></div>
                <div class="orb-ring second"></div>

                <div class="orb-core">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>

            <div class="welcome-title">
                Ask this video
            </div>

            <div class="welcome-subtitle">
                Your AI video companion
            </div>

            <div class="suggestions">

                <button class="suggestion" data-question="Summarize this video">
                    <span class="suggestion-icon">✦</span>
                    Summarize this video
                </button>

                <button class="suggestion" data-question="Explain the key points">
                    <span class="suggestion-icon">♧</span>
                    Explain the key points
                </button>

                <button class="suggestion" data-question="What are the main arguments?">
                    <span class="suggestion-icon">☷</span>
                    What are the main arguments?
                </button>

                <button class="suggestion" data-question="Tell me more about this topic">
                    <span class="suggestion-icon">?</span>
                    Tell me more about this topic
                </button>

            </div>

            
            <div class="result-view hidden">

                <div>
                    <div class="message-label">YOU</div>
                    <div class="user-message"></div>
                </div>

                <div>
                    <div class="message-label">ANUJ'S YT RAG</div>
                    <div class="ai-message"></div>
                </div>

            </div>


        </div>

        <form class="composer">
            <input
                type="text"
                placeholder="Ask anything about this video..."
                aria-label="Ask a question about this video"
            />

            <button class="send-button" type="submit" aria-label="Send question">
                <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2L15 22L11 13L2 9Z"/>
                </svg>
            </button>
        </form>
    `;

    // -------------------------
    // INTERACTIONS
    // -------------------------

    function openPanel() {
        panel.classList.add("open");
        button.classList.add("hidden");
    }

    function closePanel() {
        panel.classList.remove("open");
        button.classList.remove("hidden");
    }

    button.addEventListener("click", openPanel);

    panel.querySelector(".close").addEventListener("click", closePanel);
    panel.querySelector(".minimize").addEventListener("click", closePanel);

    panel.querySelectorAll(".suggestion").forEach((suggestion) => {
        suggestion.addEventListener("click", () => {
            const input = panel.querySelector("input");
            input.value = suggestion.dataset.question;
            input.focus();
        });
    });

    


panel.querySelector(".composer").addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = panel.querySelector(".composer input");
    const question = input.value.trim();

    if (!question) return;

    const videoId = new URL(window.location.href).searchParams.get("v");

    if (!videoId) {
        console.error("No YouTube video detected.");
        return;
    }

    const resultView = panel.querySelector(".result-view");
    const userMessage = panel.querySelector(".user-message");
    const aiMessage = panel.querySelector(".ai-message");
    const sendButton = panel.querySelector(".send-button");

    // Show the single question-answer view
    resultView.classList.remove("hidden");

    panel.querySelector(".orb-container").classList.add("hidden");
    panel.querySelector(".welcome-title").classList.add("hidden");
    panel.querySelector(".welcome-subtitle").classList.add("hidden");
    panel.querySelector(".suggestions").classList.add("hidden");

    // Replace previous question and answer
    userMessage.textContent = question;
    aiMessage.textContent = "Thinking...";
    
    input.value = "";
    sendButton.disabled = true;

    try {
        const response = await chrome.runtime.sendMessage({
            type: "ASK_VIDEO",
            video_id: videoId,
            question: question
        });

        if (!response || !response.success) {
            throw new Error(response?.error || "Unable to contact backend.");
        }

        aiMessage.textContent = response.data.answer;

    } catch (error) {
        console.error("Backend connection failed:", error);
        aiMessage.textContent = "Sorry, something went wrong.\n\n" + error.message;

    } finally {
        sendButton.disabled = false;
    }
});


// Mount the UI into the Shadow DOM
shadow.appendChild(style);
shadow.appendChild(button);
shadow.appendChild(panel);

// Add the host to the YouTube page
document.body.appendChild(host);

})();

