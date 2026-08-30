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

	// Primary models — fastest first for minimum latency
	const GEMINI_MODELS = [
		"gemini-3.5-flash-lite",
		"gemini-flash-lite-latest",
		"gemini-3.5-flash"
	];

	// ─── SYSTEM PROMPT (Model Persona & Workspace Knowledge) ──────
	const SYSTEM_PROMPT = `You are AI Assistant — the intelligent personal security & research assistant created and owned by **Mohan Kumar K** (also known as Godze Mohan). Mohan is your boss, creator, and the owner of this AI model. When anyone asks who made you, who owns you, or who your boss is, always answer: **Mohan Kumar K** (Mohan / Godze Mohan). You serve his digital portal at godzemohan.in.

## About Your Boss — Mohan Kumar K
- Full name: Mohan Kumar K (also known as Godze Mohan, or simply "Mohan")
- He is your creator, owner, and boss. You respect and serve him.
- Role/Profile: BCA Student, Cyber Security Researcher, and Tech Enthusiast based in India.
- Primary Focus: Network Security, Man-in-the-Middle (MITM) attack demonstrations, packet capture & traffic inspection, wireless security, Linux tools (Bettercap, Wireshark, Nmap), and academic computer science study notes.
- Academic Collaborators (BCA Project Team): Darshan, Mohan Kumar K, Nandan.
- Instagram: @mr_uncuts — https://instagram.com/mr_uncuts
- Contact Email: contact@godzemohan.in

## Important Identity Rules
- If anyone asks "Who is your boss?" or "Who made you?" or "Who owns you?" — ALWAYS answer: **Mohan Kumar K** (Mohan / Godze Mohan).
- If Mohan himself talks to you, treat him with extra respect as your creator and boss.
- You were built and customized by Mohan for his portfolio website.

## AI Core Responsibilities
1. **Interactive Cyber Security Tutor**: Actively explain concepts from Mohan's notes (e.g., MITM, wlan0 monitor mode, Bettercap execution syntax) using the lab assets put together by Mohan and his teammates (Darshan and Nandan).
2. **Resource Navigator**: Act as a librarian. If a visitor asks where a document or chapter is (like the MITM project PDF), instantly provide the Google Drive URL.
3. **Interactive Resume & Portfolio**: Represent Mohan to potential collaborators. Answer questions about his BCA coursework, milestones, and future research plans in network defense and Wireshark packet analysis.
4. **Smart Contact Routing**: Mohan juggles cybersecurity research, freelance photography/videography, and managing his "Esports Epicness" YouTube channel. Filter contact requests:
   - Academic/Cybersecurity collaborations ➔ Route to email: mohan7gen@gmail.com
   - Video editing/Camera work/Photography ➔ Route to Instagram: @mr_uncuts
   - Filter out and politely reject spam or irrelevant inquiries.
5. **Content Summarizer**: Before users dive into complex project reports, provide a quick 3-bullet-point summary of what the lab covers if they ask about it.

## Website Structure & Direct Resources
1. **Home** (/home): Interactive digital hub showcasing cybersecurity notes, research projects, and academic resources.
2. **Socials** (/socials): Connect via Instagram (@mr_uncuts), YouTube (Esports Epicness), or email for tech discussions and research collaboration.
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
- Keep responses concise and fast — don't write unnecessarily long answers.
- Politely decline inappropriate or profane queries.
- **FEEDBACK HANDLING**: If a user says "send feedback", "take this as feedback", or explicitly asks to pass a message/feedback to Mohan, you MUST reply with this exact format anywhere in your response: \`[ACTION:SEND_FEEDBACK] <their feedback message>\`. The system will intercept this and email Mohan. Example: \`[ACTION:SEND_FEEDBACK] The website looks amazing!\`
- **SECURITY INCIDENT & VULNERABILITY ALERT PROTOCOL**: If a user reports a security vulnerability, bug, exploit, unauthorized access, attack vector, suspicious activity, or security-related feedback:
  1. Immediately activate defense mode and respond with: \`🚨 **[SECURITY ALERT PROTOCOL ENGAGED]**\` followed by a concise security advisory and confirmation.
  2. You MUST include this exact code anywhere in your response: \`[ACTION:SEND_SECURITY_ALERT] <detailed security issue, vulnerability analysis, and recommended mitigation>\`. The system will intercept this and immediately transmit an urgent high-priority security alert to Mohan's email.`;

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

	// ─── DIRECT GEMINI API CALL (Optimized for speed) ────────────
	async function callGeminiAPI(messageText) {
		conversationHistory.push({
			role: "user",
			parts: [{ text: messageText }]
		});

		// Keep history short for faster responses
		if (conversationHistory.length > 16) {
			conversationHistory = conversationHistory.slice(-16);
		}

		const payload = {
			systemInstruction: {
				parts: [{ text: SYSTEM_PROMPT }]
			},
			contents: conversationHistory,
			generationConfig: {
				temperature: 0.6,
				maxOutputTokens: 512,
				topP: 0.9
			}
		};

		const apiKey = getActiveKey();
		let lastError = null;

		for (const model of GEMINI_MODELS) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 12000);

				const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(payload),
					signal: controller.signal
				});

				clearTimeout(timeoutId);

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

	// ─── VOICE AI: GEMINI "VEGA" SYNTHESIS & SPEECH RECOGNITION ───
	let isVoiceAutoPlay = false;
	let activeRecognition = null;
	let isListening = false;
	let cachedVegaVoice = null;

	function findVegaVoice() {
		if (!('speechSynthesis' in window)) return null;
		const voices = window.speechSynthesis.getVoices();
		if (!voices || voices.length === 0) return null;

		// 1. Prioritize Google / Gemini-like warm natural female voices (Vega profile)
		const vegaPriority = [
			// Google Neural / Chrome voices
			v => v.name.includes("Google") && (v.name.includes("US English") || v.name.includes("UK English Female") || v.lang === "en-US"),
			v => v.name.toLowerCase().includes("natural") && v.name.toLowerCase().includes("jenny"),
			v => v.name.toLowerCase().includes("aria") && v.name.toLowerCase().includes("natural"),
			v => v.name.toLowerCase().includes("samantha") && v.name.toLowerCase().includes("enhanced"),
			v => v.name === "Samantha",
			v => v.name === "Victoria",
			v => v.name === "Karen",
			v => v.name.toLowerCase().includes("zira"),
			// Generic English Female / Natural
			v => v.lang.startsWith("en-US") && !v.name.toLowerCase().includes("male"),
			v => v.lang.startsWith("en")
		];

		for (const matcher of vegaPriority) {
			const match = voices.find(matcher);
			if (match) return match;
		}
		return voices[0] || null;
	}

	if ('speechSynthesis' in window) {
		window.speechSynthesis.onvoiceschanged = () => {
			cachedVegaVoice = findVegaVoice();
		};
	}

	function cleanTextForSpeech(text) {
		if (!text) return "";
		return text
			.replace(/\[ACTION:[^\]]+\][^\n]*/gi, "")
			.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
			.replace(/https?:\/\/\S+/gi, "")
			.replace(/[*_`#~>•]/g, "")
			.replace(/<[^>]+>/g, "")
			.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // strip emojis
			.trim();
	}

	window.speakChatMessage = function (text) {
		if (!('speechSynthesis' in window)) {
			console.warn("Speech Synthesis not supported in this browser.");
			return;
		}
		window.speechSynthesis.cancel(); // Stop ongoing speech

		const clean = cleanTextForSpeech(text);
		if (!clean) return;

		if (!cachedVegaVoice) {
			cachedVegaVoice = findVegaVoice();
		}

		// Split into natural conversational sentence chunks for fluid pacing (Gemini Vega style)
		const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
		
		sentences.forEach((sentence, idx) => {
			const sentenceText = sentence.trim();
			if (!sentenceText) return;

			const utterance = new SpeechSynthesisUtterance(sentenceText);
			// Gemini Vega Voice Tuning: Bright clarity, warm articulation, natural conversational cadence
			utterance.pitch = 1.06;
			utterance.rate = 1.02;
			utterance.volume = 1.0;

			if (cachedVegaVoice) {
				utterance.voice = cachedVegaVoice;
			}

			window.speechSynthesis.speak(utterance);
		});
	};

	window.toggleVoiceAutoPlay = function (btnId = 'tab-chat-tts-btn') {
		isVoiceAutoPlay = !isVoiceAutoPlay;
		const btn = document.getElementById(btnId);
		if (btn) {
			if (isVoiceAutoPlay) {
				btn.classList.add('active');
				btn.setAttribute('title', 'AI Voice (Vega): ON (Click to turn OFF)');
				window.speakChatMessage("Gemini Vega voice activated. I am ready to speak with you.");
			} else {
				btn.classList.remove('active');
				btn.setAttribute('title', 'AI Voice (Vega): OFF (Click to turn ON)');
				window.speechSynthesis.cancel();
			}
		}
	};

	window.toggleVoiceRecognition = function (inputId = 'tab-chat-input', micBtnId = 'tab-chat-voice-btn') {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
			return;
		}

		const micBtn = document.getElementById(micBtnId);
		const inputEl = document.getElementById(inputId);

		if (isListening && activeRecognition) {
			activeRecognition.stop();
			isListening = false;
			if (micBtn) micBtn.classList.remove('listening');
			return;
		}

		try {
			const recognition = new SpeechRecognition();
			recognition.lang = 'en-US';
			recognition.interimResults = false;
			recognition.maxAlternatives = 1;

			recognition.onstart = function () {
				isListening = true;
				if (micBtn) {
					micBtn.classList.add('listening');
					micBtn.setAttribute('title', 'Listening... Click to stop');
				}
			};

			recognition.onresult = function (event) {
				const transcript = event.results[0][0].transcript;
				if (inputEl) {
					inputEl.value = (inputEl.value ? inputEl.value + ' ' : '') + transcript;
					autoResizeTextarea(inputEl);
					inputEl.focus();
				}
			};

			recognition.onerror = function (event) {
				console.warn("Speech recognition error:", event.error);
				isListening = false;
				if (micBtn) micBtn.classList.remove('listening');
			};

			recognition.onend = function () {
				isListening = false;
				if (micBtn) {
					micBtn.classList.remove('listening');
					micBtn.setAttribute('title', 'Voice Input (Speech-to-Text)');
				}
			};

			activeRecognition = recognition;
			recognition.start();
		} catch (err) {
			console.error("Failed to start voice recognition:", err);
			isListening = false;
			if (micBtn) micBtn.classList.remove('listening');
		}
	};

	function appendMessage(text, sender, targetIds) {
		const msgsId = targetIds ? targetIds.msgs : "tab-chat-messages";
		const messagesArea = document.getElementById(msgsId);
		if (!messagesArea) return;

		const msgDiv = document.createElement("div");
		msgDiv.className = `chat-message ${sender}`;
		
		let contentHtml = renderMarkdown(text);
		if (sender === 'bot') {
			// Add speaker replay button
			const textForAttr = encodeURIComponent(text);
			contentHtml += `
				<div class="msg-meta-actions">
					<button class="msg-speak-btn" onclick="window.speakChatMessage(decodeURIComponent('${textForAttr}'))" title="Read message aloud">
						<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
					</button>
				</div>
			`;
		}

		msgDiv.innerHTML = contentHtml;
		messagesArea.appendChild(msgDiv);
		messagesArea.scrollTop = messagesArea.scrollHeight;

		if (sender === 'bot' && isVoiceAutoPlay) {
			window.speakChatMessage(text);
		}
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
			let reply = await callGeminiAPI(value);
			reply = processAIReplyActions(reply);
			setTyping(false, targetIds);
			appendBotMessage(reply, targetIds);
		} catch (e) {
			setTyping(false, targetIds);
			appendBotMessage("⚠️ Service temporarily unavailable. Please try again.", targetIds);
		}
	}

	// ─── AI ACTION & SECURITY INTERCEPTOR ─────────────────────────
	function processAIReplyActions(rawReply) {
		if (!rawReply) return rawReply;
		let cleanReply = rawReply;

		const secAlertMatch = cleanReply.match(/\[ACTION:SEND_SECURITY_ALERT\](.*)/is);
		if (secAlertMatch) {
			const alertContent = secAlertMatch[1].trim();
			cleanReply = cleanReply.replace(/\[ACTION:SEND_SECURITY_ALERT\].*/is, "").trim();
			if (!cleanReply) cleanReply = "🚨 **[SECURITY ALERT TRANSMITTED]** High-priority security advisory and threat telemetry dispatched directly to Mohan.";
			sendAIFeedback(alertContent, true);
		}

		const feedbackMatch = cleanReply.match(/\[ACTION:SEND_FEEDBACK\](.*)/is);
		if (feedbackMatch) {
			const feedbackContent = feedbackMatch[1].trim();
			cleanReply = cleanReply.replace(/\[ACTION:SEND_FEEDBACK\].*/is, "").trim();
			if (!cleanReply) cleanReply = "✅ Got it! I've collected your feedback and securely sent it to Mohan.";
			sendAIFeedback(feedbackContent, false);
		}

		return cleanReply;
	}

	// ─── AI FEEDBACK & SECURITY DISPATCH LOGIC ────────────────────
	async function sendAIFeedback(feedbackMsg, isSecurityAlert = false) {
		let ipData = "Location unknown";
		try {
			const res = await fetch("https://ipinfo.io/json");
			if (res.ok) {
				const data = await res.json();
				ipData = `IP: ${data.ip} | City: ${data.city} | Region: ${data.region} | Country: ${data.country} | ISP: ${data.org || 'N/A'}`;
			}
		} catch (e) {
			console.warn("Could not fetch IP data", e);
		}

		const formattedBody = isSecurityAlert
			? `🚨 [CRITICAL AI SECURITY INCIDENT REPORT]\n\nThreat / Vulnerability Analysis:\n${feedbackMsg}\n\nClient Security Metadata:\n${ipData}\nUser Agent: ${navigator.userAgent}\nTimestamp: ${new Date().toISOString()}`
			: `[AI SUBMITTED FEEDBACK]\n\nFeedback: ${feedbackMsg}\n\nUser Data:\n${ipData}`;

		const feedbackData = {
			name: isSecurityAlert ? "AI Security Sentinel" : "AI Assistant User",
			message: formattedBody,
			_subject: isSecurityAlert
				? '🚨 [CRITICAL SECURITY ALERT] AI-Detected Threat Report - godzemohan.in'
				: 'AI Chatbot Feedback - godzemohan.in',
			_captcha: 'false',
			_template: 'table'
		};

		let sentSuccessfully = false;
		try {
			const res = await fetch("https://formsubmit.co/ajax/mohan7gen@gmail.com", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				body: JSON.stringify(feedbackData)
			});
			const resJson = await res.json();
			if (resJson && (resJson.success === "true" || resJson.success === true)) {
				sentSuccessfully = true;
			}
		} catch (err) {
			console.warn("AI Feedback AJAX failed, using iframe fallback", err);
		}

		if (!sentSuccessfully) {
			const iframeName = 'ai-feedback-iframe-' + Date.now();
			let iframe = document.createElement('iframe');
			iframe.name = iframeName;
			iframe.style.display = 'none';
			document.body.appendChild(iframe);

			const tempForm = document.createElement('form');
			tempForm.method = 'POST';
			tempForm.action = 'https://formsubmit.co/mohan7gen@gmail.com';
			tempForm.target = iframeName;
			tempForm.style.display = 'none';

			for (const [key, value] of Object.entries(feedbackData)) {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = value;
				tempForm.appendChild(input);
			}

			const nextInput = document.createElement('input');
			nextInput.type = 'hidden';
			nextInput.name = '_next';
			nextInput.value = window.location.href;
			tempForm.appendChild(nextInput);

			document.body.appendChild(tempForm);
			tempForm.submit();

			setTimeout(() => {
				if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
				if (tempForm && tempForm.parentNode) tempForm.parentNode.removeChild(tempForm);
			}, 5000);
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
			let reply = await callGeminiAPI(message);
			reply = processAIReplyActions(reply);
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
