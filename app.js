// Active tab state tracking
let currentTab = 'home';

// Switch tab content locally (runs completely offline/without server)
function loadTab(tabName) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // Don't switch if the clicked tab is already active
    if (tabName === currentTab) return;
    
    const nextPanel = document.getElementById(`panel-${tabName}`);
    if (!nextPanel) return;
    
    if (tabName === 'ai') {
        initializeTabChat();
    }
    
    // 1. Fade-out existing content
    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';
    
    // Wait for CSS transition (150ms) before updating visibility
    setTimeout(() => {
        // Hide all panels
        const panels = document.getElementsByClassName('tab-panel');
        for (let i = 0; i < panels.length; i++) {
            panels[i].classList.remove('active');
        }
        
        // Show target panel
        nextPanel.classList.add('active');
        
        // 2. Update active link states in header navigation
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        
        const activeBtn = document.getElementById("tab-" + tabName);
        if (activeBtn) {
            activeBtn.classList.add("active");
        }
        
        // 3. Fade-in new content
        contentArea.style.opacity = '1';
        contentArea.style.transform = 'translateY(0)';
        currentTab = tabName;
    }, 150);
}

// Router function to match URL hash with tabs
function handleRouting() {
    // Read hash, strip '#', default to 'home' if empty or invalid
    let hash = window.location.hash.substring(1) || 'home';
    
    const validTabs = ['home', 'socials', 'achievements', 'files', 'ai'];
    if (!validTabs.includes(hash)) {
        hash = 'home';
    }
    
    // Ensure chat content is initialized if landing directly on AI tab
    if (hash === 'ai') {
        initializeTabChat();
    }
    
    // If we're loading the initial page and it matches currentTab, just ensure the active UI state is highlighted
    if (hash === currentTab) {
        const panels = document.getElementsByClassName('tab-panel');
        for (let i = 0; i < panels.length; i++) {
            if (panels[i].id === `panel-${hash}`) {
                panels[i].classList.add('active');
            } else {
                panels[i].classList.remove('active');
            }
        }
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        const activeBtn = document.getElementById("tab-" + hash);
        if (activeBtn) {
            activeBtn.classList.add("active");
        }
        return;
    }
    
    loadTab(hash);
}

// Listen for back/forward and link clicks via hashchange
window.addEventListener('hashchange', handleRouting);

// Ensure correct active state and routing on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    handleRouting();
});

/* --- LOCAL AI ASSISTANT TAB CHAT CONTROLLER --- */
let chatState = {
    waitingForFollowUp: null, // Tracks if bot is waiting for a yes/no follow-up
};

// Global lightweight profanity & slang blocker list
const PROFANITY_LIST = [
    // English Profanities
    "fuck", "shit", "ass", "bitch", "bastard", "cunt", "dick", "pussy", "faggot", "nigger", "slut", "whore", "asshole",
    "motherfucker", "cock", "crap", "piss", "bollocks", "wanker", "prick", "twat", "choad", "dumbass", "jackass",
    "clit", "cum", "semen", "vagina", "penis", "anal", "anus",
    // Common Hindi/Indian Slang
    "bhenchod", "behanchod", "madarchod", "gandu", "chutiya", "loda", "lauda", "harami", "saala", "saale", "randi",
    "kutta", "kamina", "bhosdike", "bhosda", "bhadwa", "chut", "gaand", "laund", "lund", "hijra", "chakka",
    // Spanish Slang
    "mierda", "cabron", "puta", "puto", "maricon", "joder", "pendejo", "verga", "chinga", "cojones",
    // French Slang
    "merde", "putain", "connard", "salope", "chier", "encule",
    // Italian Slang
    "cazzo", "merda", "stronzo", "puttana", "vaffanculo",
    // German Slang
    "scheisse", "arschloch", "schlampe", "wichser", "hurensohn"
];

function containsProfanity(text) {
    const lower = text.toLowerCase();
    // Match word boundaries or substring to catch variations
    return PROFANITY_LIST.some(badWord => {
        const regex = new RegExp(`\\b${badWord}\\b|${badWord}`, 'i');
        return regex.test(lower);
    });
}

function initializeTabChat() {
    // Initial setup check inside active tab area
    const messagesArea = document.getElementById('tab-chat-messages');
    if (messagesArea && messagesArea.children.length === 0) {
        appendBotMessage("Hello! I am MK AI, Mohan Kumar K's creative assistant. 🤖\n\nHow can I help you explore his workspace today?");
        appendQuickReplies([
            { text: "📂 Access Shared Files", value: "files" },
            { text: "🔗 Connect on Socials", value: "socials" },
            { text: "🏆 View Achievements", value: "achievements" },
            { text: "✉️ Send Email", value: "email" }
        ]);
    }
}

function appendBotMessage(text) {
    appendMessage(text, 'bot');
}

function appendUserMessage(text) {
    appendMessage(text, 'user');
}

function appendMessage(text, sender) {
    const messagesArea = document.getElementById('tab-chat-messages');
    if (!messagesArea) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    // Support basic formatting like bolding and line breaks
    msgDiv.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function appendQuickReplies(options) {
    const messagesArea = document.getElementById('tab-chat-messages');
    if (!messagesArea) return;
    
    const container = document.createElement('div');
    container.className = 'quick-replies-container';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '8px';
    container.style.marginTop = '4px';
    container.style.marginBottom = '12px';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.textContent = opt.text;
        btn.style.background = 'rgba(156, 64, 255, 0.15)';
        btn.style.border = '1px solid rgba(156, 64, 255, 0.3)';
        btn.style.borderRadius = '12px';
        btn.style.color = '#fff';
        btn.style.padding = '8px 12px';
        btn.style.fontSize = '12px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s ease';
        
        btn.onmouseover = () => {
            btn.style.background = 'rgba(156, 64, 255, 0.3)';
            btn.style.borderColor = 'rgba(156, 64, 255, 0.5)';
        };
        btn.onmouseout = () => {
            btn.style.background = 'rgba(156, 64, 255, 0.15)';
            btn.style.borderColor = 'rgba(156, 64, 255, 0.3)';
        };
        
        btn.onclick = () => {
            container.remove();
            handleQuickReplyClick(opt.text, opt.value);
        };
        
        container.appendChild(btn);
    });
    
    messagesArea.appendChild(container);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function handleQuickReplyClick(label, value) {
    appendUserMessage(label);
    
    const typingIndicator = document.getElementById('tab-chat-typing');
    if (typingIndicator) typingIndicator.style.display = 'flex';
    
    setTimeout(() => {
        if (typingIndicator) typingIndicator.style.display = 'none';
        processBotResponse(value);
    }, 400);
}

function handleChatInputKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

function sendChatMessage() {
    const inputEl = document.getElementById('tab-chat-input');
    if (!inputEl) return;
    
    const message = inputEl.value.trim();
    if (!message) return;
    
    appendUserMessage(message);
    inputEl.value = '';
    
    const typingIndicator = document.getElementById('tab-chat-typing');
    if (typingIndicator) typingIndicator.style.display = 'flex';
    
    const messagesArea = document.getElementById('tab-chat-messages');
    if (messagesArea) messagesArea.scrollTop = messagesArea.scrollHeight;
    
    setTimeout(() => {
        if (typingIndicator) typingIndicator.style.display = 'none';
        
        // 1. Check for profanity or slang
        if (containsProfanity(message)) {
            appendBotMessage("Please keep our conversation polite and respectful! 😇 How can I help you explore Mohan's workspace today?");
            appendQuickReplies([
                { text: "📂 Access Shared Files", value: "files" },
                { text: "🔗 Connect on Socials", value: "socials" },
                { text: "🏆 View Achievements", value: "achievements" }
            ]);
            return;
        }
        
        // 2. Main response matching
        const responseValue = matchKeywords(message);
        processBotResponse(responseValue, message);
    }, 500);
}

function matchKeywords(text) {
    const lower = text.toLowerCase();
    
    if (chatState.waitingForFollowUp) {
        if (lower.includes('yes') || lower.includes('yeah') || lower.includes('sure') || lower.includes('yep') || lower.includes('open')) {
            return `confirm_${chatState.waitingForFollowUp}`;
        }
        if (lower.includes('no') || lower.includes('nope') || lower.includes('nah') || lower.includes('cancel')) {
            return `decline_${chatState.waitingForFollowUp}`;
        }
    }
    
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('hola') || lower.includes('sup') || lower.includes('greetings')) {
        return 'greeting';
    }
    if (lower.includes('file') || lower.includes('drive') || lower.includes('download') || lower.includes('asset') || lower.includes('pack') || lower.includes('lut') || lower.includes('pdf') || lower.includes('zip') || lower.includes('cube')) {
        return 'files';
    }
    if (lower.includes('instagram') || lower.includes('youtube') || lower.includes('insta') || lower.includes('yt') || lower.includes('social') || lower.includes('follow') || lower.includes('connect')) {
        return 'socials';
    }
    if (lower.includes('email') || lower.includes('mail') || lower.includes('contact') || lower.includes('write')) {
        return 'email';
    }
    if (lower.includes('achieve') || lower.includes('milestone') || lower.includes('history') || lower.includes('timeline') || lower.includes('award') || lower.includes('project') || lower.includes('launch')) {
        return 'achievements';
    }
    if (lower.includes('help') || lower.includes('what') || lower.includes('how') || lower.includes('bot') || lower.includes('assistant')) {
        return 'help';
    }
    
    return 'unknown';
}

function processBotResponse(value, originalMsg = "") {
    let replyText = "";
    
    switch (value) {
        case 'greeting':
            replyText = "Hello! Nice to meet you. I can tell you all about Mohan Kumar K's creative files, how to follow his socials, or view his workspace achievements. What would you like to see?";
            appendBotMessage(replyText);
            appendQuickReplies([
                { text: "📂 Shared Files", value: "files" },
                { text: "🔗 Social Links", value: "socials" },
                { text: "🏆 Milestones", value: "achievements" }
            ]);
            break;
            
        case 'files':
            replyText = "Mohan has shared downloadable assets directly on Google Drive:\n\n1. **Creative Asset Pack** (overlays, assets, icons)\n2. **Complete Guidebooks** (tips & guidelines PDF)\n3. **Color Grading LUTs** (cinematic grading .CUBE profiles)\n\nWould you like to open the Google Drive folder now?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = 'drive_open';
            appendQuickReplies([
                { text: "Yes, open Drive 🚀", value: "confirm_drive_open" },
                { text: "No, ask something else", value: "decline_drive_open" }
            ]);
            break;
            
        case 'confirm_drive_open':
            replyText = "Opening Mohan's shared Drive repository now! Let me know if you need anything else.";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            window.open("https://drive.google.com/drive/folders/1QNdvQtTCcnmPNPjpo5ioOtRX_u_YxdJH", "_blank");
            break;
            
        case 'decline_drive_open':
            replyText = "No problem! We can keep exploring here. What else can I help you find?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            appendQuickReplies([
                { text: "🔗 Connect on Socials", value: "socials" },
                { text: "🏆 View Achievements", value: "achievements" },
                { text: "✉️ Send Email", value: "email" }
            ]);
            break;
            
        case 'socials':
            replyText = "You can follow Mohan Kumar K here:\n\n📸 **Instagram**: @mr_uncuts\n🎥 **YouTube**: For his latest visual creations\n\nWould you like to check out his Instagram profile?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = 'insta_open';
            appendQuickReplies([
                { text: "Yes, open Instagram 📸", value: "confirm_insta_open" },
                { text: "No, ask something else", value: "decline_insta_open" }
            ]);
            break;
            
        case 'confirm_insta_open':
            replyText = "Opening Instagram profile @mr_uncuts. See you there!";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            window.open("https://instagram.com/mr_uncuts", "_blank");
            break;
            
        case 'decline_insta_open':
            replyText = "Alright! What other information can I look up for you?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            appendQuickReplies([
                { text: "📂 Access Shared Files", value: "files" },
                { text: "🏆 Achievements List", value: "achievements" }
            ]);
            break;
            
        case 'email':
            replyText = "For work or direct inquiries, you can reach Mohan via email at:\n📧 **contact@godzemohan.in**\n\nWould you like to compose an email to him right now?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = 'email_compose';
            appendQuickReplies([
                { text: "Yes, compose email ✉️", value: "confirm_email_compose" },
                { text: "No, thanks", value: "decline_email_compose" }
            ]);
            break;
            
        case 'confirm_email_compose':
            replyText = "Opening your default mail client to compose message. Thanks for reaching out!";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            window.location.href = "mailto:contact@godzemohan.in";
            break;
            
        case 'decline_email_compose':
            replyText = "Understood. Let me know if you want to explore other parts of his portal.";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            appendQuickReplies([
                { text: "📂 Shared Files", value: "files" },
                { text: "🔗 Social Links", value: "socials" }
            ]);
            break;
            
        case 'achievements':
            replyText = "Mohan has reached several key creative milestones:\n\n🚀 **August 2026**: Launched this clean digital portal.\n📈 **Creative Scaling**: Structured template and LUT releases.\n🛠️ **Expansion**: Preparing community guides and asset downloads.\n\nWould you like me to switch the portal view to the Achievements tab?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = 'tab_achievements';
            appendQuickReplies([
                { text: "Yes, take me there 🏆", value: "confirm_tab_achievements" },
                { text: "No, stay here", value: "decline_tab_achievements" }
            ]);
            break;
            
        case 'confirm_tab_achievements':
            replyText = "Switching layout to achievements timeline! Look at the main page.";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            window.location.hash = "achievements";
            break;
            
        case 'decline_tab_achievements':
            replyText = "No problem! What else would you like to ask?";
            appendBotMessage(replyText);
            chatState.waitingForFollowUp = null;
            appendQuickReplies([
                { text: "📂 Shared Files", value: "files" },
                { text: "🔗 Connect on Socials", value: "socials" }
            ]);
            break;
            
        case 'help':
            replyText = "I can guide you through Mohan's creative resources, help you reach out to him, or toggle the portal tabs. Select one of the quick options below:";
            appendBotMessage(replyText);
            appendQuickReplies([
                { text: "📂 Access Shared Files", value: "files" },
                { text: "🔗 Connect on Socials", value: "socials" },
                { text: "🏆 View Achievements", value: "achievements" },
                { text: "✉️ Send Email", value: "email" }
            ]);
            break;
            
        case 'unknown':
        default:
            replyText = "I'm here to answer basic questions about this site! Feel free to ask about Mohan's socials, downloads, drive folder, or select a quick option:";
            appendBotMessage(replyText);
            appendQuickReplies([
                { text: "📂 Access Shared Files", value: "files" },
                { text: "🔗 Connect on Socials", value: "socials" },
                { text: "🏆 View Achievements", value: "achievements" },
                { text: "✉️ Send Email", value: "email" }
            ]);
            break;
    }
}
