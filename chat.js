/**
 * ============================================================
 * MK CREATIVE AI — OFFICIAL GOOGLE GEMINI POWERED CHAT
 * High Performance Conversational Assistant (Gemini Flash)
 * ============================================================
 */

(function () {
	'use strict';

	// ─── RUNTIME KEY RECONSTITUTION ──────────────────────────────
	const _0xmk_k = [14, 30, 97, 14, 45, 119, 29, 1, 121, 4, 122, 118, 13, 31, 60, 43, 25, 40, 10, 60, 11, 39, 1, 44, 31, 59, 0, 122, 3, 1, 6, 22, 54, 55, 56, 62, 44, 60, 6, 45, 31, 37, 5, 1, 127, 121, 26, 38, 28, 122, 31, 59, 14];
	const _0xmk_m = 0x4f;
	function getActiveKey() {
		return _0xmk_k.map(b => String.fromCharCode(b ^ _0xmk_m)).join("");
	}

	// Primary models with automatic fallback (Ultra-fast flash-lite models)
	const GEMINI_MODELS = [
		"gemini-3.5-flash-lite",
		"gemini-flash-lite-latest",
		"gemini-3.5-flash",
		"gemini-flash-latest"
	];

	// ─── SYSTEM PROMPT (Model Persona & Workspace Knowledge) ──────
	const SYSTEM_PROMPT = `You are AI Assistant — the intelligent personal security & research assistant for Mohan Kumar K's digital portal at godzemohan.in.

## About Mohan Kumar K
- Full name: Mohan Kumar K (also known as Godze Mohan)
- Role/Profile: BCA Student, Cyber Security Researcher, and Tech Enthusiast based in India.
- Primary Focus: Network Security, Man-in-the-Middle (MITM) attack demonstrations, packet capture & traffic inspection, wireless security, Linux tools (Bettercap, Wireshark, Nmap), and academic computer science study notes.
- Academic Collaborators (BCA Project Team): Darshan, Mohan Kumar K, Nandan.
- Instagram: @mr_uncuts — https://instagram.com/mr_uncuts
- Contact Email: contact@godzemohan.in

## Website Structure & Direct Resources
1. **Home** (/home): Interactive digital hub showcasing cybersecurity notes, research projects, and academic resources.
2. **Socials** (/socials): Connect via Instagram (@mr_uncuts), YouTube, or email for tech discussions and research collaboration.
3. **Achievements & Projects** (/achievements): Timeline of cybersecurity milestones:
   • August 2026 — Security Hub Launch: Interactive digital repository.
   • 2026 Academic Project — Modular MITM Attack Demonstration: Network packet interception and security analysis (by Darshan, Mohan Kumar K, Nandan).
   • Future Research — Network Defense & Ethical Hacking: Upcoming notes on penetration testing, Wireshark packet capture, and defensive security.
4. **Shared Files & Security Notes** (/files):
   • **Chapter 01 (Script / Project Report)**: Project Report on MITM Attack Demonstration (PDF by Darshan, Mohan Kumar K, Nandan).
     - Direct PDF Link: https://drive.google.com/file/d/1YKlLdlNDRAIJT9tbSFB27uVElkxUvBIR/view?usp=drive_link
   • **Chapter 01 (Lab Notes & Captures)**: Network Lab Notes, Commands & Diagrams (Google Docs).
     - Direct Document Link: https://docs.google.com/document/d/1VBCWzZ4dHmxmgwYKDy2I85FO4nLGcZZe/edit?usp=drive_link&ouid=111476900821792261144&rtpof=true&sd=true
   • **Master Folder (Access to All Files)**: Complete Google Drive Repository.
     - Direct Folder Link: https://drive.google.com/drive/folders/1QNdvQtTCcnmPNPjpo5ioOtRX_u_YxdJH
5. **AI Assistant** (/ai): Dedicated conversational security assistant.

## Knowledge & Response Guidelines
- Explain cybersecurity concepts clearly (MITM, ARP spoofing, DNS spoofing, Wireshark packet analysis, monitor mode on wlan0, Bettercap syntax, SSL/TLS decryption, network defense).
- When users ask for files, notes, or project reports, provide the exact direct links listed above with markdown formatting [like this](url).
- Format responses cleanly with markdown: **bold**, bullet points, code blocks for commands.
- Be friendly, technical when needed, and educational.
- Politely decline inappropriate or profane queries.`;

	// ─── CONVERSATION HISTORY (Multi-turn) ───────────────────────
	let conversationHistory = [];

	// ─── PROFANITY FILTER ─────────────────────────────────────────
	const PROFANITY_LIST = [
		"fuck", "shit", "bitch", "bastard", "cunt", "dick", "faggot", "nigger", "slut", "whore",
		"motherfucker", "cock", "piss", "bhenchod", "behanchod", "madarchod", "gandu", "chutiya",
		"loda", "lauda", "harami", "saala", "randi", "kutta", "kamina", "bhosdike", "bhosda"
	];
	function containsProfanity(text) {
		const lower = text.toLowerCase();
		return PROFANITY_LIST.some(w => new RegExp(`\\b${w}\\b|${w}`, 'i').test(lower));
	}

	// ─── DIRECT GEMINI API CALL ──────────────────────────────────
	async function callGeminiAPI(messageText) {
		conversationHistory.push({
			role: "user",
			parts: [{ text: messageText }]
		});

		if (conversationHistory.length > 20) {
			conversationHistory = conversationHistory.slice(-20);
		}

		const payload = {
			systemInstruction: {
				parts: [{ text: SYSTEM_PROMPT }]
			},
			contents: conversationHistory,
			generationConfig: {
				temperature: 0.7,
				maxOutputTokens: 800
			}
		};

		const apiKey = getActiveKey();
		let lastError = null;

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
					conversationHistory.push({
						role: "model",
						parts: [{ text: replyText }]
					});
					return replyText;
				}
			} catch (err) {
				console.warn(`Gemini model ${model} fallback:`, err.message);
				lastError = err;
			}
		}

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
		const inId = inputId || "tab-chat-input";
		const btnId = sendBtnId || "tab-chat-send-btn";
		const inputEl = document.getElementById(inId);
		const sendBtn = document.getElementById(btnId);

		if (!inputEl) return;
		const message = inputEl.value.trim();
		if (!message) return;

		inputEl.value = "";
		autoResizeTextarea(inputEl);

		if (sendBtn) sendBtn.disabled = true;

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
		if (!el) return;
		el.style.height = "auto";
		el.style.height = Math.min(el.scrollHeight, 120) + "px";
	}

	// ─── IN-TAB CHAT INITIALIZER (panel-ai) ───────────────────────
	let tabChatInitialized = false;
	function initializeTabChat() {
		const messagesArea = document.getElementById("tab-chat-messages");
		if (!messagesArea || tabChatInitialized) return;
		tabChatInitialized = true;

		appendBotMessage(
			"Hey! 👋 I'm **AI Security Assistant**, your intelligent guide for Mohan Kumar K's cybersecurity research portal.\n\nI can answer questions about Mohan's MITM Attack Demonstration project, network lab notes, packet analysis techniques, or cybersecurity concepts. How can I help you today?",
			null
		);
		appendQuickReplies([
			{ text: "🛡️ MITM Report (PDF)", value: "Tell me about Mohan's MITM Attack Demonstration project report and provide the download link" },
			{ text: "📝 Lab Notes (Docs)", value: "Where can I view the Chapter 1 Network Lab Notes & Document?" },
			{ text: "📂 Access All Files", value: "How can I access all files in Mohan's Google Drive repository?" },
			{ text: "🔒 Security Concepts", value: "Explain how a Man-in-the-Middle (MITM) attack works and how to defend against it" }
		], null);

		const sendBtn = document.getElementById("tab-chat-send-btn");
		const inputEl = document.getElementById("tab-chat-input");
		if (sendBtn) sendBtn.onclick = () => sendChatMessage("tab-chat-input", "tab-chat-send-btn", null);
		if (inputEl) {
			inputEl.onkeydown = (e) => handleChatInputKey(e, "tab-chat-input", "tab-chat-send-btn", null);
			inputEl.oninput = () => autoResizeTextarea(inputEl);
			setTimeout(() => inputEl.focus(), 150);
		}
	}

	// Expose globally for tab router
	window.initializeTabChat = initializeTabChat;
	window.sendChatMessage = sendChatMessage;
	window.handleChatInputKey = handleChatInputKey;

	// ─── FLOATING CHAT WIDGET (for quick overlay across tabs) ────
	function injectFloatingChat() {
		if (document.getElementById("mk-chat-fab")) return;

		const widget = document.createElement("div");
		widget.id = "mk-chat-widget";
		widget.innerHTML = `
			<div id="mk-chat-callout" class="mk-chat-callout" title="Click to chat with AI">
				<span class="callout-sparkle">✨</span>
				<div class="callout-text-wrap">
					<span class="callout-badge">AI Online</span>
					<span class="callout-msg">Ask me about Mohan's security notes!</span>
				</div>
				<span class="callout-dot"></span>
			</div>

			<button id="mk-chat-fab" aria-label="Open AI Chat" title="Chat with AI Assistant">
				<span class="mk-fab-icon open-icon">
					<!-- Animated Waving Robot Emblem -->
					<svg class="mk-fab-robot-icon" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
						<circle cx="12" cy="3.5" r="1.5"/>
						<path d="M12 5v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<rect x="4" y="7.5" width="16" height="13.5" rx="3.5"/>
						<circle cx="8.5" cy="12" r="1.5" fill="#040e09"/>
						<circle cx="15.5" cy="12" r="1.5" fill="#040e09"/>
						<path d="M9 16.5c1.5 1.2 4.5 1.2 6 0" stroke="#040e09" stroke-width="1.8" stroke-linecap="round" fill="none"/>
						<rect x="1.5" y="11" width="2.5" height="5" rx="1"/>
						<rect x="20" y="11" width="2.5" height="5" rx="1"/>
					</svg>
				</span>
				<span class="mk-fab-icon close-icon" style="display:none;">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</span>
				<span class="mk-fab-badge" id="mk-fab-badge">1</span>
			</button>

			<div id="mk-chat-drawer" class="mk-chat-drawer">
				<div class="mk-drawer-header">
					<div class="mk-drawer-brand">
						<div class="mk-drawer-avatar">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<circle cx="12" cy="3.5" r="1.5"/>
								<path d="M12 5v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
								<rect x="4" y="7.5" width="16" height="13.5" rx="3.5"/>
								<circle cx="8.5" cy="12" r="1.5" fill="#040e09"/>
								<circle cx="15.5" cy="12" r="1.5" fill="#040e09"/>
								<path d="M9 16.5c1.5 1.2 4.5 1.2 6 0" stroke="#040e09" stroke-width="1.8" stroke-linecap="round" fill="none"/>
								<rect x="1.5" y="11" width="2.5" height="5" rx="1"/>
								<rect x="20" y="11" width="2.5" height="5" rx="1"/>
							</svg>
						</div>
						<div class="mk-drawer-title-wrap">
							<span class="mk-drawer-name">AI Security Assistant</span>
							<span class="mk-drawer-status"><span class="mk-status-dot"></span> Online</span>
						</div>
					</div>
					<div class="mk-drawer-actions">
						<button class="mk-drawer-action-btn" id="mk-chat-clear" title="Clear chat">
							<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
						</button>
						<button class="mk-drawer-action-btn" id="mk-chat-close" title="Close">
							<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
						</button>
					</div>
				</div>
				<div class="mk-chat-messages" id="mk-chat-messages"></div>
				<div class="mk-typing-indicator" id="mk-chat-typing" style="display:none;">
					<span class="mk-typing-dot"></span>
					<span class="mk-typing-dot"></span>
					<span class="mk-typing-dot"></span>
				</div>
				<div class="mk-chat-footer">
					<textarea id="mk-chat-input" placeholder="Ask about cybersecurity, notes, or MITM…" rows="1"></textarea>
					<button id="mk-chat-send" aria-label="Send message">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
					</button>
				</div>
				<div class="mk-chat-powered">Personal Security Assistant · Fast &amp; Private</div>
			</div>
		`;
		document.body.appendChild(widget);

		const floatTargetIds = { msgs: "mk-chat-messages", typing: "mk-chat-typing" };
		let drawerOpen = false;
		let chatStarted = false;

		const fab = document.getElementById("mk-chat-fab");
		const callout = document.getElementById("mk-chat-callout");
		const drawer = document.getElementById("mk-chat-drawer");
		const badge = document.getElementById("mk-fab-badge");
		const openIcon = fab.querySelector(".open-icon");
		const closeIcon = fab.querySelector(".close-icon");
		const closeBtn = document.getElementById("mk-chat-close");
		const clearBtn = document.getElementById("mk-chat-clear");
		const sendBtn = document.getElementById("mk-chat-send");
		const inputEl = document.getElementById("mk-chat-input");

		function openDrawer() {
			drawerOpen = true;
			drawer.classList.add("open");
			openIcon.style.display = "none";
			closeIcon.style.display = "";
			if (badge) badge.style.display = "none";
			if (callout) callout.style.display = "none";
			fab.classList.add("active");

			if (!chatStarted) {
				chatStarted = true;
				appendBotMessage(
					"Hey! 👋 I'm **AI Security Assistant**. Ask me anything about Mohan's MITM project, network lab notes, or cybersecurity concepts!",
					floatTargetIds
				);
				appendQuickReplies([
					{ text: "🛡️ MITM Report (PDF)", value: "Tell me about Mohan's MITM Attack Demonstration project report and provide the download link" },
					{ text: "📝 Lab Notes (Docs)", value: "Where can I view the Chapter 1 Network Lab Notes & Document?" },
					{ text: "📂 Access All Files", value: "How can I access all files in Mohan's Google Drive repository?" }
				], floatTargetIds);
			}
			setTimeout(() => inputEl && inputEl.focus(), 250);
		}

		function closeDrawer() {
			drawerOpen = false;
			drawer.classList.remove("open");
			openIcon.style.display = "";
			closeIcon.style.display = "none";
			fab.classList.remove("active");
			if (callout) {
				setTimeout(() => {
					if (!drawerOpen) callout.style.display = "flex";
				}, 1000);
			}
		}

		fab.addEventListener("click", () => drawerOpen ? closeDrawer() : openDrawer());
		if (callout) callout.addEventListener("click", openDrawer);
		closeBtn.addEventListener("click", closeDrawer);
		clearBtn.addEventListener("click", () => {
			conversationHistory = [];
			chatStarted = false;
			document.getElementById("mk-chat-messages").innerHTML = "";
			if (drawerOpen) openDrawer();
		});
		sendBtn.addEventListener("click", () => sendChatMessage("mk-chat-input", "mk-chat-send", floatTargetIds));
		inputEl.addEventListener("keydown", (e) => handleChatInputKey(e, "mk-chat-input", "mk-chat-send", floatTargetIds));
		inputEl.addEventListener("input", () => autoResizeTextarea(inputEl));

		// Expose openDrawer globally
		window.mkOpenChatDrawer = openDrawer;
	}

	// ─── INIT ON DOM READY ───────────────────────────────────────
	window.addEventListener("DOMContentLoaded", () => {
		injectFloatingChat();
		if (window.location.hash === '#ai' || window.location.pathname === '/ai') {
			initializeTabChat();
		}
	});
})();
