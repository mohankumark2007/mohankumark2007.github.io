(function() {
    // 1. Determine theme (Local Storage preference or System default)
    const savedTheme = localStorage.getItem('theme');
    let theme = 'dark'; // Fallback default (Enchanted Night Forest)
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
        theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        theme = 'light';
    }
    
    // 2. Set attribute on html element immediately on parse to avoid loading flash
    document.documentElement.setAttribute('data-theme', theme);

    // 3. Update meta theme-color immediately
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'light' ? '#f3f7f4' : '#040e09');
    }
})();

function updateThemeColorMeta(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'light' ? '#f3f7f4' : '#040e09');
    }
}

// Toggle Feedback window
window.toggleFeedback = function() {
    const feedbackWin = document.getElementById('feedback-window');
    if (!feedbackWin) return;
    
    if (feedbackWin.classList.contains('open')) {
        feedbackWin.classList.remove('open');
        setTimeout(() => {
            feedbackWin.style.display = 'none';
        }, 300);
    } else {
        feedbackWin.style.display = 'flex';
        // Allow layout to register display before animation
        setTimeout(() => {
            feedbackWin.classList.add('open');
        }, 10);
    }
};

// Live Clock Update Function
function updateLiveClock() {
    const clockEl = document.querySelector('.live-clock-time');
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    clockEl.textContent = `${strHours}:${minutes}:${seconds} ${ampm}`;
}

// DOMContentLoaded binding for theme toggle, live clock, and feedback form
window.addEventListener('DOMContentLoaded', () => {
    // Start Live Clock
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Theme Toggle
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeColorMeta(currentTheme);
        });
    }
    
    // Sync with OS color scheme changes if user hasn't explicitly set a preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const systemTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeColorMeta(systemTheme);
        }
    });

    // Feedback Trigger Click
    const trigger = document.getElementById('feedback-trigger');
    if (trigger) {
        trigger.addEventListener('click', toggleFeedback);
    }
    
    // Feedback Form Submit Handler
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.feedback-submit-btn');
            const statusMsg = document.getElementById('feedback-status');
            const nameInput = document.getElementById('feedback-name');
            const emailInput = document.getElementById('feedback-email');
            const messageInput = document.getElementById('feedback-message');
            
            if (!messageInput || !messageInput.value.trim()) return;
            
            // Show sending status
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            
            if (statusMsg) {
                statusMsg.className = 'feedback-status-msg';
                statusMsg.style.display = 'none';
            }
            
            // AJAX Submit to FormSubmit.co (using secure hashed endpoint to prevent email harvesting)
            fetch('https://formsubmit.co/ajax/15854c4f9954860278f854a928764d04', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Anonymous',
                    email: emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'Not provided',
                    message: messageInput.value.trim(),
                    _subject: 'Website Feedback - Mohan Creative Space'
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                if (statusMsg) {
                    statusMsg.textContent = 'Feedback sent successfully! Thank you. 🙏';
                    statusMsg.className = 'feedback-status-msg success';
                }
                // Clear input message
                if (messageInput) messageInput.value = '';
                
                // Hide window after a brief delay
                setTimeout(() => {
                    toggleFeedback();
                    if (statusMsg) {
                        statusMsg.style.display = 'none';
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Send Feedback';
                    }
                }, 2500);
            })
            .catch(error => {
                if (statusMsg) {
                    statusMsg.textContent = 'Failed to send feedback. Please try again.';
                    statusMsg.className = 'feedback-status-msg error';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Feedback';
                }
            });
        });
    }
});
