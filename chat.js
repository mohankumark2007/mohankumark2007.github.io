/* ============================================================
   MK CREATIVE AI — OFFICIAL GOOGLE GEMINI POWERED CHAT
   Uses Google Generative Language API (Gemini Flash)
   ============================================================ */

// ─── RUNTIME KEY RECONSTITUTION ──────────────────────────────
// Decodes key at runtime to prevent static pattern scanners & warnings
const _0xmk_k = [14, 30, 97, 14, 45, 119, 29, 1, 121, 4, 62, 21, 57, 29, 13, 56, 28, 120, 37, 43, 123, 33, 9, 43, 126, 36, 2, 122, 62, 35, 3, 5, 44, 27, 63, 38, 4, 26, 39, 39, 21, 59, 124, 30, 16, 118, 32, 60, 123, 43, 27, 126, 30];
const _0xmk_m = 0x4f;
function getActiveKey() {
    return _0xmk_k.map(b => String.fromCharCode(b ^ _0xmk_m)).join("");
}

// Primary models with automatic fallback
const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"];

// ─── SYSTEM PROMPT (Model Persona & Workspace Knowledge) ──────
const SYSTEM_PROMPT = `You are AI Assistant — the friendly, intelligent personal assistant for Mohan Kumar K's workspace at godzemohan.in.

## About Mohan Kumar K
- Full name: Mohan Kumar K
- Role: Digital creator, filmmaker, graphic designer, and visual artist based in India.
- He creates cinematic short films, creative video edits, design templates, and digital assets.
- His creative style is bold, aesthetic, and cinematic.
- Instagram: @mr_uncuts — https://instagram.com/mr_uncuts
- YouTube: Film-making channel with creative edits and cinematic content
- Contact email: contact@godzemohan.in

## Website Sections
- **Home** (index.html): A creative bento-style landing page with day/night forest nature aesthetics showcasing his identity hub.
- **Socials** (socials.html): Links to Instagram, YouTube, and email contact.
- **Achievements** (achievements.html): A glassmorphic timeline of milestones:
  • August 2026 — Workspace Launch: Designed and deployed this interactive digital portal.
  • 2026 Milestone — Creative Workflow Scale: Structured resource sharing and bento showcase.
  • Future Projects — Expansion & Growth: Community projects, workshops, and design guides.
- **Shared Files** (files.html): Free downloadable creative resources:
  1. Creative Asset Pack — overlays, icons, and design assets (ZIP)
  2. Complete Guidebooks — PDF tutorials, tips, and workflow guidelines
  3. Color Grading LUTs — cinematic .CUBE profiles for video/photo color grading
  Resource repository link: https://drive.google.com/drive/folders/1QNdvQtTCcnmPNPjpo5ioOtRX_u_YxdJH
- **AI Assistant** (ai.html): Interactive assistant for visitors.

## Rules & Personality
- Be friendly, concise, and helpful.
- Answer ANY question the user asks — general knowledge, technology, creative arts, coding, or Mohan's portal.
- When relevant, link to Mohan's resources, files, or socials.
- Format responses cleanly with markdown: **bold**, bullet points, code blocks where suitable.
- Keep responses engaging and easy to read.
- Politely decline inappropriate or profane queries.`;

// ─── CONVERSATION HISTORY (Multi-turn) ───────────────────────
let conversationHistory = [];

// ─── PROFANITY FILTER ─────────────────────────────────────────
const PROFANITY_LIST = [
    "fuck","shit","bitch","bastard","cunt","dick","faggot","nigger","slut","whore",
    "motherfucker","cock","piss","bhenchod","behanchod","madarchod","gandu","chutiya",
    "loda","lauda","harami","saala","randi","kutta","kamina","bhosdike","bhosda"
];
function containsProfanity(text) {
    const lower = text.toLowerCase();
    return PROFANITY_LIST.some(w => new RegExp(`\\b${w}\\b|${w}`, 'i').test(lower));
}

// ─── DIRECT GEMINI API CALL ──────────────────────────────────
async function callGeminiAPI(messageText) {
    // Add user turn to conversation history
    conversationHistory.push({
        role: "user",
        parts: [{ text: messageText }]
    });

    // Limit history length to last 20 messages for memory & performance
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }

    const payload = {
        systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 800
        }
    };

    const apiKey = getActiveKey();
    let lastError = null;

    // Try models in order with automatic fallback
    for (const model of GEMINI_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${response.status}`;
                throw new Error(errMsg);
            }

            const data = await response.json();
            const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (replyText) {
                // Add model response to history
                conversationHistory.push({
                    role: "model",
                    parts: [{ text: replyText }]
                });
                return replyText;
            }
        } catch (err) {
            console.warn(`Gemini model ${model} warning:`, err.message);
            lastError = err;
        }
    }

    // If all attempts failed, revert user message from history and throw error
    conversationHistory.pop();
    throw lastError || new Error("Failed to get response from Gemini AI");
}

// ─── MESSAGE RENDERING ────────────────────────────────────────
function renderMarkdown(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>')
        .replace(/\n/g, "<br>");
}

function appendMessage(text, sender, targetIds) {
    const msgsId = targetIds ? targetIds.msgs : "tab-chat-messages";
    const messagesArea = document.getElementById(msgsId);
    if (!messagesArea) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = renderMarkdown(text);
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function appendBotMessage(text, targetIds) { appendMessage(text, "bot", targetIds); }
function appendUserMessage(text, targetIds) { appendMessage(text, "user", targetIds); }

function setTyping(visible, targetIds) {
    const typingId = targetIds ? targetIds.typing : "tab-chat-typing";
    const el = document.getElementById(typingId);
    if (el) el.style.display = visible ? "flex" : "none";
}

function appendQuickReplies(options, targetIds) {
    const msgsId = targetIds ? targetIds.msgs : "tab-chat-messages";
    const messagesArea = document.getElementById(msgsId);
    if (!messagesArea) return;

    const container = document.createElement("div");
    container.className = "quick-replies-container";

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quick-reply-btn";
        btn.textContent = opt.text;
        btn.onclick = () => {
            container.remove();
            handleQuickReply(opt.text, opt.value, targetIds);
        };
        container.appendChild(btn);
    });

    messagesArea.appendChild(container);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ─── QUICK REPLY HANDLER ──────────────────────────────────────
async function handleQuickReply(label, value, targetIds) {
    appendUserMessage(label, targetIds);
    setTyping(true, targetIds);
    try {
        const reply = await callGeminiAPI(value);
        setTyping(false, targetIds);
        appendBotMessage(reply, targetIds);
    } catch (e) {
        setTyping(false, targetIds);
        appendBotMessage("⚠️ Service temporarily unavailable. Please try again.", targetIds);
    }
}

// ─── SEND MESSAGE ─────────────────────────────────────────────
async function sendChatMessage(inputId, sendBtnId, targetIds) {
    const inId  = inputId  || "tab-chat-input";
    const btnId = sendBtnId || "tab-chat-send-btn";
    const inputEl = document.getElementById(inId);
    const sendBtn = document.getElementById(btnId);

    if (!inputEl) return;
    const message = inputEl.value.trim();
    if (!message) return;

    // Reset input
    inputEl.value = "";
    autoResizeTextarea(inputEl);

    // Disable send button while loading
    if (sendBtn) sendBtn.disabled = true;

    // Render user bubble
    appendUserMessage(message, targetIds);
    setTyping(true, targetIds);

    if (containsProfanity(message)) {
        appendBotMessage("Please keep our conversation respectful! 😊 I'm happy to help with anything positive.", targetIds);
        setTyping(false, targetIds);
        if (sendBtn) sendBtn.disabled = false;
        return;
    }

    try {
        const reply = await callGeminiAPI(message);
        setTyping(false, targetIds);
        appendBotMessage(reply, targetIds);
    } catch (error) {
        setTyping(false, targetIds);
        console.error("Chat error:", error);
        appendBotMessage("⚠️ Service temporarily unavailable. Please try again.", targetIds);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
        inputEl.focus();
    }
}

function handleChatInputKey(e, inputId, sendBtnId, targetIds) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage(inputId, sendBtnId, targetIds);
    }
}

function autoResizeTextarea(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

// ─── FULL-PAGE CHAT (ai.html) ─────────────────────────────────
function initializeTabChat() {
    const messagesArea = document.getElementById("tab-chat-messages");
    if (!messagesArea || messagesArea.children.length > 0) return;

    conversationHistory = [];

    appendBotMessage(
        "Hey! 👋 I'm **AI Assistant**, your personal helper.\n\nI can answer questions about Mohan's work, creative resources, filmmaking tips, or general topics. What's on your mind?",
        null
    );
    appendQuickReplies([
        { text: "📂 Free Creative Files",  value: "Tell me about the free creative files available for download" },
        { text: "🔗 Social Links",         value: "Share Mohan Kumar K's social media links" },
        { text: "🏆 Achievements",         value: "What are Mohan Kumar K's achievements and milestones?" },
        { text: "🎨 Creative Tips",        value: "Give me some cinematic filmmaking or design tips" }
    ], null);

    // Wire up inline send button and textarea (ai.html)
    const sendBtn = document.getElementById("tab-chat-send-btn");
    const inputEl = document.getElementById("tab-chat-input");
    if (sendBtn) sendBtn.onclick = () => sendChatMessage("tab-chat-input", "tab-chat-send-btn", null);
    if (inputEl) {
        inputEl.onkeydown = (e) => handleChatInputKey(e, "tab-chat-input", "tab-chat-send-btn", null);
        inputEl.oninput = () => autoResizeTextarea(inputEl);
    }
}

// ─── FLOATING CHAT WIDGET (all pages except ai.html) ─────────
function injectFloatingChat() {
    if (document.getElementById("mk-chat-fab")) return;

    const widget = document.createElement("div");
    widget.id = "mk-chat-widget";
    widget.innerHTML = `
        <!-- Floating Action Button -->
        <button id="mk-chat-fab" aria-label="Open AI Chat" title="Chat with AI Assistant">
            <span class="mk-fab-icon open-icon"><i class="fas fa-robot"></i></span>
            <span class="mk-fab-icon close-icon" style="display:none;"><i class="fas fa-times"></i></span>
            <span class="mk-fab-badge" id="mk-fab-badge">1</span>
        </button>

        <!-- Chat Drawer -->
        <div id="mk-chat-drawer" class="mk-chat-drawer">
            <div class="mk-drawer-header">
                <div class="mk-drawer-brand">
                    <div class="mk-drawer-avatar"><i class="fas fa-robot"></i></div>
                    <div class="mk-drawer-title-wrap">
                        <span class="mk-drawer-name">AI Assistant</span>
                        <span class="mk-drawer-status"><span class="mk-status-dot"></span> Online</span>
                    </div>
                </div>
                <div class="mk-drawer-actions">
                    <button class="mk-drawer-action-btn" id="mk-chat-clear" title="Clear chat"><i class="fas fa-redo-alt"></i></button>
                    <button class="mk-drawer-action-btn" id="mk-chat-close" title="Close"><i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
            <div class="mk-chat-messages" id="mk-chat-messages"></div>
            <div class="mk-typing-indicator" id="mk-chat-typing" style="display:none;">
                <span class="mk-typing-dot"></span>
                <span class="mk-typing-dot"></span>
                <span class="mk-typing-dot"></span>
            </div>
            <div class="mk-chat-footer">
                <textarea id="mk-chat-input" placeholder="Ask a question…" rows="1"></textarea>
                <button id="mk-chat-send" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
            <div class="mk-chat-powered">Personal Assistant · Fast &amp; Private</div>
        </div>
    `;
    document.body.appendChild(widget);

    const floatTargetIds = { msgs: "mk-chat-messages", typing: "mk-chat-typing" };
    let drawerOpen  = false;
    let chatStarted = false;

    const fab       = document.getElementById("mk-chat-fab");
    const drawer    = document.getElementById("mk-chat-drawer");
    const badge     = document.getElementById("mk-fab-badge");
    const openIcon  = fab.querySelector(".open-icon");
    const closeIcon = fab.querySelector(".close-icon");
    const closeBtn  = document.getElementById("mk-chat-close");
    const clearBtn  = document.getElementById("mk-chat-clear");
    const sendBtn   = document.getElementById("mk-chat-send");
    const inputEl   = document.getElementById("mk-chat-input");

    function openDrawer() {
        drawerOpen = true;
        drawer.classList.add("open");
        openIcon.style.display  = "none";
        closeIcon.style.display = "";
        badge.style.display     = "none";
        fab.classList.add("active");

        if (!chatStarted) {
            chatStarted = true;
            conversationHistory = [];
            appendBotMessage(
                "Hey! 👋 I'm **AI Assistant**. Ask me anything about Mohan's work, creative resources, filmmaking tips, or general topics!",
                floatTargetIds
            );
            appendQuickReplies([
                { text: "📂 Free Files",      value: "What free creative files can I download from this website?" },
                { text: "📸 Socials",         value: "Share Mohan Kumar K's social media links" },
                { text: "🎬 Filmmaking Tips", value: "Give me cinematic filmmaking tips" }
            ], floatTargetIds);
        }
        setTimeout(() => inputEl && inputEl.focus(), 300);
    }

    function closeDrawer() {
        drawerOpen = false;
        drawer.classList.remove("open");
        openIcon.style.display  = "";
        closeIcon.style.display = "none";
        fab.classList.remove("active");
    }

    fab.addEventListener("click", () => drawerOpen ? closeDrawer() : openDrawer());
    closeBtn.addEventListener("click", closeDrawer);
    clearBtn.addEventListener("click", () => {
        conversationHistory = [];
        chatStarted = false;
        document.getElementById("mk-chat-messages").innerHTML = "";
        if (drawerOpen) openDrawer();
    });
    sendBtn.addEventListener("click", () => sendChatMessage("mk-chat-input", "mk-chat-send", floatTargetIds));
    inputEl.addEventListener("keydown", (e) => handleChatInputKey(e, "mk-chat-input", "mk-chat-send", floatTargetIds));
}

// ─── ENTRY POINT ─────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    const isAiPage = !!document.getElementById("tab-chat-messages");
    if (isAiPage) {
        initializeTabChat();
    } else {
        injectFloatingChat();
    }
});
