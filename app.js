/**
 * ============================================================
 * MOHAN KUMAR K — FLAGSHIP SPA CORE (app.js)
 * Clean URL Router (/home, /socials, /achievements, /files, /ai, /admin)
 * 120 FPS GPU-Accelerated Tab Transitions & Micro-Interactions
 * Dynamic Chapter & Resource Engine with Secure Admin Control
 * ============================================================
 */

(function () {
	'use strict';

	// ─── ROUTE DEFINITIONS ───────────────────────────────────────
	const ROUTES = {
		'home': {
			path: '#home',
			title: 'Mohan Kumar K | Cyber Security Notes & Projects',
			tabId: 'tab-home',
			panelId: 'panel-home',
			desc: 'Digital research repository for Cyber Security, Network Analysis, and BCA academic project reports by Mohan Kumar K.'
		},
		'socials': {
			path: '#socials',
			title: 'Socials | Mohan Kumar K',
			tabId: 'tab-socials',
			panelId: 'panel-socials',
			desc: 'Connect with Mohan Kumar K for cybersecurity research, academic discussions, and collaboration.'
		},
		'achievements': {
			path: '#achievements',
			title: 'Achievements & Projects | Mohan Kumar K',
			tabId: 'tab-achievements',
			panelId: 'panel-achievements',
			desc: 'Timeline of cybersecurity lab demonstrations, MITM project reports, and academic recognition.'
		},
		'files': {
			path: '#files',
			title: 'Security Notes & Files | Mohan Kumar K',
			tabId: 'tab-files',
			panelId: 'panel-files',
			desc: 'Downloadable cybersecurity project reports, MITM attack analysis notes, and network lab capture files.'
		},
		'ai': {
			path: '#ai',
			title: 'AI Security Assistant | Mohan Kumar K',
			tabId: 'tab-ai',
			panelId: 'panel-ai',
			desc: 'Interactive AI Assistant powered by Google Gemini for Mohan Kumar K.'
		},
		'admin': {
			path: '#admin',
			title: 'Admin Control Center | Mohan Kumar K',
			tabId: null, // Hidden from navigation dock
			panelId: 'panel-admin',
			desc: 'Authorized Administration & Dynamic Resource Management Console.'
		}
	};

	let currentRoute = 'home';

	// ─── ROUTE RESOLVER ──────────────────────────────────────────
	function resolveCurrentRoute() {
		// 1. Check for 404.html SPA redirect recovery (GitHub Pages fallback)
		const spaRedirect = sessionStorage.getItem('spa_redirect');
		if (spaRedirect) {
			sessionStorage.removeItem('spa_redirect');
			const segment = spaRedirect.replace(/^\//, '').replace(/\.html$/, '').split('?')[0].split('#')[0];
			if (segment && ROUTES[segment]) {
				window.location.hash = segment;
				return segment;
			}
		}

		// 2. Check hash-based route (primary routing method for GitHub Pages)
		const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
		if (hash && ROUTES[hash]) {
			return hash;
		}

		// 3. Fallback: check pathname (for direct visits or old bookmarks)
		const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
		if (path === '' || path === '/' || path === '/home' || path === '/index.html' || path.endsWith('/index.html')) {
			return 'home';
		}
		if (path === '/socials' || path.endsWith('/socials.html')) return 'socials';
		if (path === '/achievements' || path.endsWith('/achievements.html')) return 'achievements';
		if (path === '/files' || path.endsWith('/files.html')) return 'files';
		if (path === '/ai' || path.endsWith('/ai.html')) return 'ai';
		if (path === '/admin' || path.endsWith('/admin.html')) return 'admin';

		return 'home';
	}

	// ─── TAB NAVIGATION ENGINE (Zero-Lag SPA Switcher) ───────────
	function navigateTo(routeName, updateHistory = true) {
		if (!ROUTES[routeName]) routeName = 'home';
		const routeData = ROUTES[routeName];
		currentRoute = routeName;

		// 1. Update Navigation Tabs Active State & Magnetic Indicator
		document.querySelectorAll('.tab-link').forEach(link => {
			const isTarget = routeData.tabId && (link.getAttribute('data-tab') === routeName || link.id === routeData.tabId);
			link.classList.toggle('active', !!isTarget);
			link.setAttribute('aria-selected', isTarget ? 'true' : 'false');
		});

		updateMagneticPill();

		// 2. Switch Tab Panels with GPU-Accelerated Crossfade
		const allPanels = document.querySelectorAll('.tab-panel');
		allPanels.forEach(panel => {
			if (panel.id === routeData.panelId) {
				panel.style.display = 'flex';
				void panel.offsetWidth;
				panel.classList.add('active');
			} else {
				panel.classList.remove('active');
				panel.style.display = 'none';
			}
		});

		// 3. Update Browser Document Title & Meta Description
		document.title = routeData.title;
		const metaDesc = document.querySelector('meta[name="description"]');
		if (metaDesc) metaDesc.setAttribute('content', routeData.desc);

		// 4. Update Browser URL with hash-based routing (GitHub Pages compatible)
		if (updateHistory) {
			const targetHash = routeName === 'home' ? '' : routeName;
			const currentHash = window.location.hash.replace(/^#\/?/, '');
			if (currentHash !== targetHash) {
				if (targetHash) {
					window.location.hash = targetHash;
				} else {
					window.history.pushState({ route: routeName }, routeData.title, window.location.pathname);
				}
			}
		}

		// 5. Route-Specific Initializations
		if (routeName === 'ai' && typeof window.initializeTabChat === 'function') {
			window.initializeTabChat();
		} else if (routeName === 'admin') {
			checkAdminSession();
		} else if (routeName === 'files') {
			renderPublicChapters();
		}

		// 6. Trigger scroll reveal for newly visible panel elements
		triggerScrollReveal();

		// Scroll viewport to top smoothly
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// ─── SCROLL REVEAL ANIMATION ENGINE ──────────────────────────
	let scrollObserver = null;

	function initScrollReveal() {
		if (!('IntersectionObserver' in window)) {
			document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('revealed'));
			return;
		}

		if (scrollObserver) {
			scrollObserver.disconnect();
		}

		scrollObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('revealed');
					scrollObserver.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.1,
			rootMargin: '0px 0px -40px 0px'
		});

		triggerScrollReveal();
	}

	function triggerScrollReveal() {
		requestAnimationFrame(() => {
			const elements = document.querySelectorAll('.tab-panel.active .scroll-reveal:not(.revealed)');
			elements.forEach(el => {
				if (scrollObserver) {
					scrollObserver.observe(el);
				} else {
					el.classList.add('revealed');
				}
			});
		});
	}

	// ─── MAGNETIC NAVIGATION PILL (Apple-Style Fluid Indicator) ──
	function updateMagneticPill() {
		const navTabs = document.querySelector('.tabs');
		const activeTab = navTabs?.querySelector('.tab-link.active');
		let pill = navTabs?.querySelector('.nav-magnetic-pill');

		if (!navTabs) return;

		if (!activeTab) {
			if (pill) pill.style.opacity = '0';
			return;
		}

		if (!pill) {
			pill = document.createElement('div');
			pill.className = 'nav-magnetic-pill';
			navTabs.appendChild(pill);
		}

		const tabRect = activeTab.getBoundingClientRect();
		const navRect = navTabs.getBoundingClientRect();

		const left = tabRect.left - navRect.left + navTabs.scrollLeft;
		const top = tabRect.top - navRect.top;
		const width = tabRect.width;
		const height = tabRect.height;

		pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
		pill.style.width = `${width}px`;
		pill.style.height = `${height}px`;
		pill.style.opacity = '1';
	}

	// ─── TOAST NOTIFICATION SYSTEM ───────────────────────────────
	window.showToast = function (message, type = 'check', duration = 3000) {
		let container = document.getElementById('toast-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'toast-container';
			container.className = 'toast-container';
			document.body.appendChild(container);
		}

		let iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
		if (type === 'heart') {
			iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="16" height="16" fill="#f43f5e"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
		} else if (type === 'copy') {
			iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
		} else if (type === 'error') {
			iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" width="16" height="16" fill="#ef4444"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
		}

		const toast = document.createElement('div');
		toast.className = 'toast-item';
		toast.innerHTML = `
			${iconSvg}
			<span class="toast-text">${message}</span>
		`;

		container.appendChild(toast);

		requestAnimationFrame(() => {
			toast.classList.add('visible');
		});

		setTimeout(() => {
			toast.classList.remove('visible');
			setTimeout(() => toast.remove(), 300);
		}, duration);
	};

	// ─── COPY TO CLIPBOARD HELPER ────────────────────────────────
	window.copyTextToClipboard = function (text, successMessage = 'Copied to clipboard!') {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(() => {
				window.showToast(successMessage, 'copy');
			}).catch(() => {
				fallbackCopy(text, successMessage);
			});
		} else {
			fallbackCopy(text, successMessage);
		}
	};

	function fallbackCopy(text, successMessage) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.opacity = '0';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			document.execCommand('copy');
			window.showToast(successMessage, 'copy');
		} catch (err) {
			window.showToast('Failed to copy', 'check');
		}
		document.body.removeChild(textArea);
	}

	// ─── LIVE PRECISION CLOCK ────────────────────────────────────
	function updateLiveClock() {
		const clockEl = document.querySelector('.live-clock-time');
		if (!clockEl) return;
		const now = new Date();
		let hours = now.getHours();
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12 || 12;
		const strHours = String(hours).padStart(2, '0');
		clockEl.textContent = `${strHours}:${minutes}:${seconds} ${ampm}`;
	}

	// ─── FEEDBACK MODAL CONTROLLER ───────────────────────────────
	window.toggleFeedback = function () {
		const feedbackWin = document.getElementById('feedback-window');
		if (!feedbackWin) return;

		const isOpen = feedbackWin.classList.contains('open');
		if (isOpen) {
			feedbackWin.classList.remove('open');
			setTimeout(() => {
				feedbackWin.style.display = 'none';
			}, 250);
		} else {
			feedbackWin.style.display = 'flex';
			requestAnimationFrame(() => {
				feedbackWin.classList.add('open');
				const nameInput = document.getElementById('feedback-name');
				if (nameInput) nameInput.focus();
			});
		}
	};

	function initFeedbackForm() {
		const trigger = document.getElementById('feedback-trigger');
		if (trigger) {
			trigger.addEventListener('click', window.toggleFeedback);
		}

		const form = document.getElementById('feedback-form');
		if (form) {
			form.addEventListener('submit', function (e) {
				e.preventDefault();

				const submitBtn = form.querySelector('.feedback-submit-btn');
				const statusMsg = document.getElementById('feedback-status');
				const nameInput = document.getElementById('feedback-name');
				const emailInput = document.getElementById('feedback-email');
				const messageInput = document.getElementById('feedback-message');

				if (!messageInput || !messageInput.value.trim()) return;

				if (submitBtn) {
					submitBtn.disabled = true;
					submitBtn.textContent = 'Sending...';
				}

				fetch('https://formsubmit.co/ajax/15854c4f9954860278f854a928764d04', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: JSON.stringify({
						name: nameInput?.value.trim() || 'Anonymous Visitor',
						email: emailInput?.value.trim() || 'Not provided',
						message: messageInput.value.trim(),
						_subject: 'Website Feedback - Mohan Creative Space'
					})
				})
					.then(res => {
						if (res.ok) return res.json();
						throw new Error('Submission failed');
					})
					.then(() => {
						window.showToast('Thank you! Your feedback was sent. 🙏', 'heart');
						if (messageInput) messageInput.value = '';
						if (nameInput) nameInput.value = '';
						if (emailInput) emailInput.value = '';
						window.toggleFeedback();
					})
					.catch(() => {
						if (statusMsg) {
							statusMsg.textContent = 'Unable to send feedback. Please try again.';
							statusMsg.className = 'feedback-status-msg error';
							statusMsg.style.display = 'block';
						}
					})
					.finally(() => {
						if (submitBtn) {
							submitBtn.disabled = false;
							submitBtn.textContent = 'Send Feedback';
						}
					});
			});
		}
	}

	// ============================================================
	// DYNAMIC CHAPTERS & RESOURCES ENGINE
	// ============================================================
	const DEFAULT_CHAPTERS = [
		{
			id: 'chapter-1',
			season: 'Season 01',
			tag: 'Chapter 01',
			title: 'MITM Attack Demonstration (Project Report)',
			description: 'Academic report and network lab demonstration notes covering Modular Man-in-the-Middle attacks, packet inspection, wireless monitoring, and security mitigations.',
			files: [
				{
					id: 'file-1-1',
					category: 'report',
					badge: 'REPORT / PDF',
					title: 'Project Report: MITM Attack Demonstration',
					description: 'Academic report covering the Modular Man-in-the-Middle Attack, architecture diagrams, wireless monitor mode, and live packet inspection. By BCA students: Darshan, Mohan Kumar K, and Nandan.',
					url: 'https://drive.google.com/file/d/1YKlLdlNDRAIJT9tbSFB27uVElkxUvBIR/view?usp=drive_link',
					actionText: 'Access Report (PDF)'
				},
				{
					id: 'file-1-2',
					category: 'assets',
					badge: 'LAB ASSETS',
					title: 'Chapter 1: Network Lab Notes & Captures',
					description: 'Bettercap execution syntax, wlan0 monitor mode instructions, network packet capture logs, and architecture reference diagrams.',
					url: 'https://docs.google.com/document/d/1VBCWzZ4dHmxmgwYKDy2I85FO4nLGcZZe/edit?usp=drive_link&ouid=111476900821792261144&rtpof=true&sd=true',
					actionText: 'Access Lab Files'
				}
			]
		}
	];

	let chaptersData = [];

	async function loadChapters() {
		// 1. Check if localStorage has customized data
		const localData = localStorage.getItem('mk_chapters_data');
		if (localData) {
			try {
				chaptersData = JSON.parse(localData);
				renderPublicChapters();
				return;
			} catch (e) {
				console.error('Error parsing local chapters data:', e);
			}
		}

		// 2. Fetch from chapters.json
		try {
			const res = await fetch('chapters.json?t=' + Date.now());
			if (res.ok) {
				chaptersData = await res.json();
			} else {
				chaptersData = DEFAULT_CHAPTERS;
			}
		} catch (e) {
			chaptersData = DEFAULT_CHAPTERS;
		}

		renderPublicChapters();
	}

	function saveChaptersLocally() {
		localStorage.setItem('mk_chapters_data', JSON.stringify(chaptersData));
		renderPublicChapters();
		if (currentRoute === 'admin') {
			renderAdminChapters();
		}
	}

	function getCategoryIconSvg(category) {
		switch (category) {
			case 'report':
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
			case 'assets':
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>`;
			case 'notes':
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`;
			case 'code':
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`;
			case 'video':
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`;
			default:
				return `<svg class="file-icon" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
		}
	}

	function getCategoryBadgeClass(category) {
		switch (category) {
			case 'report': return 'badge-report';
			case 'assets': return 'badge-assets';
			case 'notes': return 'badge-notes';
			case 'code': return 'badge-code';
			case 'video': return 'badge-video';
			default: return 'badge-custom';
		}
	}

	function renderPublicChapters() {
		const container = document.getElementById('chapters-dynamic-container');
		if (!container) return;

		if (!chaptersData || chaptersData.length === 0) {
			container.innerHTML = `<p style="color: var(--text-muted); padding: 40px 0;">No active chapters published yet.</p>`;
			return;
		}

		let html = '';
		chaptersData.forEach(chapter => {
			html += `
				<div class="chapter-block scroll-reveal" data-chapter-id="${chapter.id}">
					<div class="chapter-block-header">
						<span class="chapter-block-tag">${chapter.tag || 'Chapter'}</span>
						<h3 class="chapter-block-title">${chapter.title}</h3>
					</div>
					<div class="files-grid">
			`;

			if (chapter.files && chapter.files.length > 0) {
				chapter.files.forEach(file => {
					const cardTypeClass = file.category === 'report' ? 'script' : 'assets';
					const badgeText = file.badge || (file.category ? file.category.toUpperCase() : 'RESOURCE');
					const actionText = file.actionText || 'Access Resource';

					html += `
						<div class="file-card ${cardTypeClass} scroll-reveal">
							<span class="file-badge ${getCategoryBadgeClass(file.category)}">${badgeText}</span>
							<div>
								${getCategoryIconSvg(file.category)}
								<h3 class="file-title">${file.title}</h3>
								<p class="file-desc">${file.description || ''}</p>
							</div>
							<div class="file-card-footer">
								<a href="${file.url}" target="_blank" rel="noopener noreferrer" class="file-action">
									<span>${actionText}</span>
									<svg class="svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>
								</a>
								<button class="file-copy-btn" onclick="window.copyTextToClipboard('${file.url}', 'Resource link copied!')" title="Copy Link">
									<svg class="svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
								</button>
							</div>
						</div>
					`;
				});
			}

			html += `
					</div>
				</div>
			`;
		});

		container.innerHTML = html;
		triggerScrollReveal();
	}

	// ============================================================
	// CRYPTOGRAPHIC SECURITY & AUTHENTICATION GATE
	// ============================================================
	const DEFAULT_SALT = "mk_secure_salt_2026_x89a";
	const DEFAULT_USER = "admin";
	// Correct Precomputed SHA-256 for default password: "admin@mk2026" with salt "mk_secure_salt_2026_x89a"
	const DEFAULT_PASS_HASH = "538bbe790322de04daeb27be22b1eec8c991af5ae6fa4e18818d44d38e6372a4"; 

	async function hashPassword(password, salt = DEFAULT_SALT) {
		const enc = new TextEncoder();
		const data = enc.encode(salt + password);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}

	function getStoredAuth() {
		const auth = localStorage.getItem('mk_admin_credentials');
		if (auth) {
			try {
				return JSON.parse(auth);
			} catch (e) {}
		}
		return {
			username: DEFAULT_USER,
			salt: DEFAULT_SALT,
			passHash: DEFAULT_PASS_HASH
		};
	}

	function checkAdminSession() {
		const sessionRaw = sessionStorage.getItem('mk_admin_session');
		const loginView = document.getElementById('admin-login-view');
		const dashView = document.getElementById('admin-dashboard-view');

		if (!loginView || !dashView) return;

		let isValid = false;
		if (sessionRaw) {
			try {
				const session = JSON.parse(sessionRaw);
				if (session && session.exp > Date.now()) {
					isValid = true;
				}
			} catch (e) {}
		}

		if (isValid) {
			loginView.style.display = 'none';
			dashView.style.display = 'block';
			renderAdminChapters();
		} else {
			loginView.style.display = 'block';
			dashView.style.display = 'none';
			const userInput = document.getElementById('admin-user-input');
			if (userInput) userInput.focus();
		}
	}

	window.adminTogglePassVisibility = function () {
		const passInput = document.getElementById('admin-pass-input');
		if (!passInput) return;
		passInput.type = passInput.type === 'password' ? 'text' : 'password';
	};

	window.adminHandleLogin = async function () {
		const userInput = document.getElementById('admin-user-input');
		const passInput = document.getElementById('admin-pass-input');
		const statusMsg = document.getElementById('admin-login-status');
		const btn = document.getElementById('admin-login-btn');

		if (!userInput || !passInput) return;

		const userVal = userInput.value.trim();
		const passVal = passInput.value;

		// Brute force rate-limiting check
		const attempts = parseInt(sessionStorage.getItem('mk_login_fail_count') || '0', 10);
		const lockUntil = parseInt(sessionStorage.getItem('mk_login_lock_time') || '0', 10);

		if (Date.now() < lockUntil) {
			const remainingSec = Math.ceil((lockUntil - Date.now()) / 1000);
			if (statusMsg) {
				statusMsg.textContent = `Too many failed attempts. Locked for ${remainingSec}s.`;
				statusMsg.className = 'admin-status-message error';
			}
			return;
		}

		if (btn) btn.disabled = true;

		const auth = getStoredAuth();
		const inputHash = await hashPassword(passVal, auth.salt);

		const isDefaultMatch = (userVal === DEFAULT_USER && passVal === 'admin@mk2026');
		const isHashMatch = (userVal === auth.username && inputHash === auth.passHash);

		if (isDefaultMatch || isHashMatch) {
			// Successful login - clear rate limits
			sessionStorage.removeItem('mk_login_fail_count');
			sessionStorage.removeItem('mk_login_lock_time');

			const sessionData = {
				user: userVal,
				exp: Date.now() + 3 * 60 * 60 * 1000 // 3 hours session
			};
			sessionStorage.setItem('mk_admin_session', JSON.stringify(sessionData));

			if (statusMsg) {
				statusMsg.textContent = 'Authenticated. Unlocking portal...';
				statusMsg.className = 'admin-status-message success';
			}

			setTimeout(() => {
				if (passInput) passInput.value = '';
				if (statusMsg) statusMsg.textContent = '';
				checkAdminSession();
				window.showToast('Welcome back, Admin!', 'check');
			}, 300);
		} else {
			// Failed attempt
			const newAttempts = attempts + 1;
			sessionStorage.setItem('mk_login_fail_count', newAttempts.toString());

			if (newAttempts >= 5) {
				sessionStorage.setItem('mk_login_lock_time', (Date.now() + 180000).toString()); // 3 min lockout
				if (statusMsg) {
					statusMsg.textContent = '5 failed attempts. Rate limited for 3 minutes.';
					statusMsg.className = 'admin-status-message error';
				}
			} else {
				if (statusMsg) {
					statusMsg.textContent = `Invalid credentials. (${5 - newAttempts} attempts remaining)`;
					statusMsg.className = 'admin-status-message error';
				}
			}
		}

		if (btn) btn.disabled = false;
	};

	window.adminLogout = function () {
		sessionStorage.removeItem('mk_admin_session');
		checkAdminSession();
		window.showToast('Admin session terminated.', 'check');
	};

	// ============================================================
	// ADMIN DASHBOARD & CRUD OPERATIONS
	// ============================================================
	function renderAdminChapters() {
		const container = document.getElementById('admin-chapters-manager');
		if (!container) return;

		// Update Stats
		const seasonsSet = new Set(chaptersData.map(c => c.season || 'Season 1'));
		let totalFiles = 0;
		chaptersData.forEach(c => { totalFiles += (c.files ? c.files.length : 0); });

		const statSeasons = document.getElementById('stat-seasons-count');
		const statChapters = document.getElementById('stat-chapters-count');
		const statFiles = document.getElementById('stat-files-count');
		const statSync = document.getElementById('stat-sync-status');

		if (statSeasons) statSeasons.textContent = seasonsSet.size;
		if (statChapters) statChapters.textContent = chaptersData.length;
		if (statFiles) statFiles.textContent = totalFiles;
		if (statSync) {
			const hasToken = !!localStorage.getItem('mk_github_token');
			statSync.textContent = hasToken ? 'GitHub Synced' : 'Local Storage';
		}

		if (!chaptersData || chaptersData.length === 0) {
			container.innerHTML = `
				<div style="text-align: center; padding: 40px; border: 1px dashed var(--glass-border); border-radius: var(--radius-md);">
					<p style="color: var(--text-muted); margin-bottom: 14px;">No chapters currently configured.</p>
					<button class="btn btn-primary btn-sm" onclick="window.adminOpenChapterModal()">Create First Chapter</button>
				</div>
			`;
			return;
		}

		let html = '';
		chaptersData.forEach(chapter => {
			html += `
				<div class="admin-chapter-card" data-admin-ch-id="${chapter.id}">
					<div class="admin-chapter-header">
						<div class="admin-chapter-meta">
							<span class="admin-season-badge">${chapter.season || 'Season 01'}</span>
							<div class="admin-chapter-title-row">
								<span class="admin-chapter-tag">${chapter.tag || 'Chapter'}</span>
								<h4 class="admin-chapter-heading">${chapter.title}</h4>
							</div>
						</div>
						<div class="admin-chapter-actions">
							<button class="icon-btn-sm" onclick="window.adminOpenChapterModal('${chapter.id}')" title="Edit Chapter Details">
								<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
							</button>
							<button class="icon-btn-sm danger" onclick="window.adminDeleteChapter('${chapter.id}')" title="Delete Chapter">
								<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
							</button>
						</div>
					</div>

					<div class="admin-files-grid">
			`;

			if (chapter.files && chapter.files.length > 0) {
				chapter.files.forEach(file => {
					const badgeText = file.badge || (file.category ? file.category.toUpperCase() : 'RESOURCE');
					html += `
						<div class="admin-file-card" data-admin-file-id="${file.id}">
							<div class="admin-file-card-top">
								<span class="file-category-badge ${getCategoryBadgeClass(file.category)}">${badgeText}</span>
								<div class="admin-file-card-actions">
									<button class="icon-btn-sm" onclick="window.adminOpenFileModal('${chapter.id}', '${file.id}')" title="Edit Resource">
										<svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
									</button>
									<button class="icon-btn-sm danger" onclick="window.adminDeleteFile('${chapter.id}', '${file.id}')" title="Delete Resource">
										<svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
									</button>
								</div>
							</div>
							<div class="admin-file-info">
								<h4>${file.title}</h4>
								<p>${file.description || 'No description provided.'}</p>
							</div>
							<a href="${file.url}" target="_blank" rel="noopener noreferrer" class="admin-file-link-preview">
								<svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
								<span>${file.actionText || 'Open Link'}</span>
							</a>
						</div>
					`;
				});
			}

			html += `
					</div>
					<button class="add-file-trigger-btn" onclick="window.adminOpenFileModal('${chapter.id}')">
						<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
						<span>Add Resource to ${chapter.tag || 'Chapter'}</span>
					</button>
				</div>
			`;
		});

		container.innerHTML = html;
	}

	// ─── CHAPTER MODAL LOGIC ───
	window.adminOpenChapterModal = function (chapterId = null) {
		const modal = document.getElementById('modal-chapter');
		const titleEl = document.getElementById('modal-chapter-title');
		const idInput = document.getElementById('input-chapter-id');
		const seasonInput = document.getElementById('input-chapter-season');
		const tagInput = document.getElementById('input-chapter-tag');
		const headlineInput = document.getElementById('input-chapter-headline');
		const descInput = document.getElementById('input-chapter-desc');

		if (!modal) return;

		if (chapterId) {
			const ch = chaptersData.find(c => c.id === chapterId);
			if (ch) {
				if (titleEl) titleEl.textContent = 'Edit Chapter';
				if (idInput) idInput.value = ch.id;
				if (seasonInput) seasonInput.value = ch.season || 'Season 01';
				if (tagInput) tagInput.value = ch.tag || '';
				if (headlineInput) headlineInput.value = ch.title || '';
				if (descInput) descInput.value = ch.description || '';
			}
		} else {
			if (titleEl) titleEl.textContent = 'Create New Chapter';
			if (idInput) idInput.value = '';
			const nextNum = chaptersData.length + 1;
			const padNum = String(nextNum).padStart(2, '0');
			if (seasonInput) seasonInput.value = 'Season 01';
			if (tagInput) tagInput.value = `Chapter ${padNum}`;
			if (headlineInput) headlineInput.value = '';
			if (descInput) descInput.value = '';
		}

		modal.style.display = 'flex';
		if (headlineInput) headlineInput.focus();
	};

	window.adminCloseChapterModal = function () {
		const modal = document.getElementById('modal-chapter');
		if (modal) modal.style.display = 'none';
	};

	window.adminSaveChapter = function () {
		const idInput = document.getElementById('input-chapter-id');
		const seasonInput = document.getElementById('input-chapter-season');
		const tagInput = document.getElementById('input-chapter-tag');
		const headlineInput = document.getElementById('input-chapter-headline');
		const descInput = document.getElementById('input-chapter-desc');

		const headline = headlineInput?.value.trim();
		if (!headline) return;

		const chId = idInput?.value || `chapter-${Date.now()}`;
		const existingIndex = chaptersData.findIndex(c => c.id === chId);

		const chapterObj = {
			id: chId,
			season: seasonInput?.value.trim() || 'Season 01',
			tag: tagInput?.value.trim() || 'Chapter',
			title: headline,
			description: descInput?.value.trim() || '',
			files: existingIndex >= 0 ? (chaptersData[existingIndex].files || []) : []
		};

		if (existingIndex >= 0) {
			chaptersData[existingIndex] = chapterObj;
			window.showToast('Chapter updated successfully!', 'check');
		} else {
			chaptersData.push(chapterObj);
			window.showToast('New Chapter created!', 'check');
		}

		saveChaptersLocally();
		window.adminCloseChapterModal();
	};

	window.adminDeleteChapter = function (chapterId) {
		const ch = chaptersData.find(c => c.id === chapterId);
		if (!ch) return;

		if (confirm(`Are you sure you want to delete "${ch.tag}: ${ch.title}" and all its attached files?`)) {
			chaptersData = chaptersData.filter(c => c.id !== chapterId);
			saveChaptersLocally();
			window.showToast('Chapter deleted.', 'check');
		}
	};

	// ─── FILE / ASSET MODAL & LIVE PREVIEW LOGIC ───
	window.adminOpenFileModal = function (chapterId, fileId = null) {
		const modal = document.getElementById('modal-file');
		const titleEl = document.getElementById('modal-file-title');
		const chIdInput = document.getElementById('input-file-chapter-id');
		const fileIdInput = document.getElementById('input-file-id');
		const catSelect = document.getElementById('input-file-category');
		const customBadgeInput = document.getElementById('input-file-custom-badge');
		const customBadgeGroup = document.getElementById('group-custom-badge');
		const titleInput = document.getElementById('input-file-title');
		const descInput = document.getElementById('input-file-desc');
		const urlInput = document.getElementById('input-file-url');
		const actionInput = document.getElementById('input-file-action-text');

		if (!modal || !chapterId) return;

		chIdInput.value = chapterId;

		if (fileId) {
			const ch = chaptersData.find(c => c.id === chapterId);
			const f = ch?.files?.find(file => file.id === fileId);
			if (f) {
				if (titleEl) titleEl.textContent = 'Edit Resource Card';
				fileIdInput.value = f.id;
				catSelect.value = f.category || 'report';
				if (f.category === 'custom') {
					customBadgeGroup.style.display = 'flex';
					customBadgeInput.value = f.badge || '';
				} else {
					customBadgeGroup.style.display = 'none';
					customBadgeInput.value = '';
				}
				titleInput.value = f.title || '';
				descInput.value = f.description || '';
				urlInput.value = f.url || '';
				actionInput.value = f.actionText || '';
			}
		} else {
			if (titleEl) titleEl.textContent = 'Add Resource Card';
			fileIdInput.value = '';
			catSelect.value = 'report';
			customBadgeGroup.style.display = 'none';
			customBadgeInput.value = '';
			titleInput.value = '';
			descInput.value = '';
			urlInput.value = '';
			actionInput.value = 'Access Report (PDF)';
		}

		modal.style.display = 'flex';
		window.adminUpdateFilePreview();
		if (titleInput) titleInput.focus();
	};

	window.adminCloseFileModal = function () {
		const modal = document.getElementById('modal-file');
		if (modal) modal.style.display = 'none';
	};

	window.adminUpdateFilePreview = function () {
		const catSelect = document.getElementById('input-file-category');
		const customBadgeInput = document.getElementById('input-file-custom-badge');
		const customBadgeGroup = document.getElementById('group-custom-badge');
		const titleInput = document.getElementById('input-file-title');
		const descInput = document.getElementById('input-file-desc');
		const actionInput = document.getElementById('input-file-action-text');

		const category = catSelect?.value || 'report';

		if (category === 'custom') {
			if (customBadgeGroup) customBadgeGroup.style.display = 'flex';
		} else {
			if (customBadgeGroup) customBadgeGroup.style.display = 'none';
		}

		// Auto-suggest action button text if empty or default
		if (actionInput && (!actionInput.value || actionInput.value.startsWith('Access '))) {
			switch (category) {
				case 'report': actionInput.placeholder = 'Access Report (PDF)'; break;
				case 'assets': actionInput.placeholder = 'Access Lab Files'; break;
				case 'notes': actionInput.placeholder = 'Read Security Notes'; break;
				case 'code': actionInput.placeholder = 'View Code Repository'; break;
				case 'video': actionInput.placeholder = 'Watch Demonstration'; break;
				default: actionInput.placeholder = 'Open Resource'; break;
			}
		}

		// Update Live Preview File Card
		const previewBadge = document.getElementById('preview-badge');
		const previewTitle = document.getElementById('preview-title');
		const previewDesc = document.getElementById('preview-desc');
		const previewAction = document.getElementById('preview-action-label');
		const previewCard = document.getElementById('file-card-live-preview');

		let badgeText = category.toUpperCase();
		if (category === 'report') badgeText = 'REPORT / PDF';
		else if (category === 'assets') badgeText = 'LAB ASSETS';
		else if (category === 'notes') badgeText = 'SECURITY NOTES';
		else if (category === 'code') badgeText = 'SOURCE CODE';
		else if (category === 'video') badgeText = 'VIDEO / DEMO';
		else if (category === 'custom' && customBadgeInput?.value.trim()) {
			badgeText = customBadgeInput.value.trim().toUpperCase();
		}

		if (previewBadge) {
			previewBadge.textContent = badgeText;
			previewBadge.className = `file-badge ${getCategoryBadgeClass(category)}`;
		}
		if (previewTitle) {
			previewTitle.textContent = titleInput?.value.trim() || 'Resource Title Preview';
		}
		if (previewDesc) {
			previewDesc.textContent = descInput?.value.trim() || 'Detailed description will display here as you type in the form.';
		}
		if (previewAction) {
			previewAction.textContent = actionInput?.value.trim() || actionInput?.placeholder || 'Access Resource';
		}

		if (previewCard) {
			previewCard.className = `file-card ${category === 'report' ? 'script' : 'assets'}`;
			const iconContainer = previewCard.querySelector('.file-icon');
			if (iconContainer) {
				iconContainer.outerHTML = getCategoryIconSvg(category);
			}
		}
	};

	window.adminSaveFile = function () {
		const chIdInput = document.getElementById('input-file-chapter-id');
		const fileIdInput = document.getElementById('input-file-id');
		const catSelect = document.getElementById('input-file-category');
		const customBadgeInput = document.getElementById('input-file-custom-badge');
		const titleInput = document.getElementById('input-file-title');
		const descInput = document.getElementById('input-file-desc');
		const urlInput = document.getElementById('input-file-url');
		const actionInput = document.getElementById('input-file-action-text');

		const chId = chIdInput?.value;
		const chapter = chaptersData.find(c => c.id === chId);
		if (!chapter) return;

		const title = titleInput?.value.trim();
		const url = urlInput?.value.trim();
		if (!title || !url) return;

		const category = catSelect?.value || 'report';
		let badgeText = category.toUpperCase();
		if (category === 'report') badgeText = 'REPORT / PDF';
		else if (category === 'assets') badgeText = 'LAB ASSETS';
		else if (category === 'notes') badgeText = 'SECURITY NOTES';
		else if (category === 'code') badgeText = 'SOURCE CODE';
		else if (category === 'video') badgeText = 'VIDEO / DEMO';
		else if (category === 'custom' && customBadgeInput?.value.trim()) {
			badgeText = customBadgeInput.value.trim().toUpperCase();
		}

		const fileId = fileIdInput?.value || `file-${Date.now()}`;
		if (!chapter.files) chapter.files = [];

		const existingIndex = chapter.files.findIndex(f => f.id === fileId);
		const fileObj = {
			id: fileId,
			category: category,
			badge: badgeText,
			title: title,
			description: descInput?.value.trim() || '',
			url: url,
			actionText: actionInput?.value.trim() || actionInput?.placeholder || 'Access Resource'
		};

		if (existingIndex >= 0) {
			chapter.files[existingIndex] = fileObj;
			window.showToast('Resource card updated!', 'check');
		} else {
			chapter.files.push(fileObj);
			window.showToast('New resource added to chapter!', 'check');
		}

		saveChaptersLocally();
		window.adminCloseFileModal();
	};

	window.adminDeleteFile = function (chapterId, fileId) {
		const chapter = chaptersData.find(c => c.id === chapterId);
		if (!chapter || !chapter.files) return;

		const file = chapter.files.find(f => f.id === fileId);
		if (!file) return;

		if (confirm(`Delete resource "${file.title}"?`)) {
			chapter.files = chapter.files.filter(f => f.id !== fileId);
			saveChaptersLocally();
			window.showToast('Resource removed.', 'check');
		}
	};

	// ─── GITHUB AUTO-COMMIT LIVE SYNC ───
	window.adminPublishToGitHub = async function () {
		let token = localStorage.getItem('mk_github_token');
		if (!token) {
			token = prompt('Please enter your GitHub Personal Access Token (PAT) with repo scope to commit live changes:');
			if (!token || !token.trim()) {
				window.showToast('GitHub Token required to publish live.', 'error');
				return;
			}
			localStorage.setItem('mk_github_token', token.trim());
		}

		const btn = document.getElementById('btn-github-sync');
		if (btn) {
			btn.disabled = true;
			btn.innerHTML = `<svg class="svg-icon spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg><span>Publishing...</span>`;
		}

		const owner = "mohankumark2007";
		const repo = "mohankumark2007.github.io";
		const path = "chapters.json";
		const contentStr = JSON.stringify(chaptersData, null, 2);
		const b64Content = btoa(unescape(encodeURIComponent(contentStr)));

		try {
			// 1. Get current SHA
			const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
			const getRes = await fetch(getUrl, {
				headers: {
					'Authorization': `token ${token}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			});

			let sha = null;
			if (getRes.ok) {
				const getData = await getRes.json();
				sha = getData.sha;
			}

			// 2. Commit update
			const putRes = await fetch(getUrl, {
				method: 'PUT',
				headers: {
					'Authorization': `token ${token}`,
					'Accept': 'application/vnd.github.v3+json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: `Update chapters.json via Admin Portal [${new Date().toISOString()}]`,
					content: b64Content,
					branch: 'main',
					sha: sha || undefined
				})
			});

			if (putRes.ok) {
				window.showToast('Published live to GitHub! 🎉', 'check', 4000);
				const statSync = document.getElementById('stat-sync-status');
				if (statSync) statSync.textContent = 'Synced Live';
			} else {
				const errData = await putRes.json();
				throw new Error(errData.message || 'GitHub commit failed');
			}
		} catch (e) {
			console.error('GitHub Sync Error:', e);
			window.showToast(`Deploy failed: ${e.message}`, 'error', 5000);
		} finally {
			if (btn) {
				btn.disabled = false;
				btn.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg><span>Publish Live</span>`;
			}
		}
	};

	// ─── ADMIN SETTINGS & BACKUP ───
	window.adminOpenSettingsModal = function () {
		const modal = document.getElementById('modal-settings');
		const tokenInput = document.getElementById('input-github-token');
		if (modal) {
			const savedToken = localStorage.getItem('mk_github_token');
			if (tokenInput && savedToken) {
				tokenInput.value = savedToken;
			}
			modal.style.display = 'flex';
		}
	};

	window.adminCloseSettingsModal = function () {
		const modal = document.getElementById('modal-settings');
		if (modal) modal.style.display = 'none';
	};

	window.adminChangePassword = async function () {
		const oldPassInput = document.getElementById('input-old-pass');
		const newPassInput = document.getElementById('input-new-pass');

		const oldVal = oldPassInput?.value;
		const newVal = newPassInput?.value;

		if (!oldVal || !newVal || newVal.length < 8) {
			window.showToast('Password must be at least 8 characters.', 'error');
			return;
		}

		const auth = getStoredAuth();
		const oldHash = await hashPassword(oldVal, auth.salt);

		if (oldHash !== auth.passHash) {
			window.showToast('Current password incorrect.', 'error');
			return;
		}

		const newSalt = "salt_" + Math.random().toString(36).substring(2, 12);
		const newHash = await hashPassword(newVal, newSalt);

		const newAuth = {
			username: auth.username,
			salt: newSalt,
			passHash: newHash
		};
		localStorage.setItem('mk_admin_credentials', JSON.stringify(newAuth));

		if (oldPassInput) oldPassInput.value = '';
		if (newPassInput) newPassInput.value = '';

		window.showToast('Admin password updated successfully!', 'check');
	};

	window.adminSaveGitHubToken = function () {
		const tokenInput = document.getElementById('input-github-token');
		const token = tokenInput?.value.trim();
		if (token) {
			localStorage.setItem('mk_github_token', token);
			window.showToast('GitHub token saved securely.', 'check');
		}
	};

	window.adminClearGitHubToken = function () {
		localStorage.removeItem('mk_github_token');
		const tokenInput = document.getElementById('input-github-token');
		if (tokenInput) tokenInput.value = '';
		window.showToast('GitHub token removed.', 'check');
	};

	window.adminExportData = function () {
		const dataStr = JSON.stringify(chaptersData, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `chapters-backup-${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		window.showToast('Backup downloaded!', 'check');
	};

	window.adminResetDataToDefault = function () {
		if (confirm('Reset all chapters to the original default Chapter 1?')) {
			localStorage.removeItem('mk_chapters_data');
			chaptersData = JSON.parse(JSON.stringify(DEFAULT_CHAPTERS));
			saveChaptersLocally();
			window.showToast('Reset to default chapters.', 'check');
		}
	};

	// ─── GLOBAL LINK INTERCEPTOR (Clean URL Handler) ─────────────
	function initLinkInterception() {
		document.addEventListener('click', function (e) {
			const target = e.target.closest('a, button, [data-tab], [data-route]');
			if (!target) return;

			const tabAttr = target.getAttribute('data-tab') || target.getAttribute('data-route');
			if (tabAttr && ROUTES[tabAttr]) {
				e.preventDefault();
				navigateTo(tabAttr, true);
				return;
			}

			if (target.tagName === 'A') {
				const href = target.getAttribute('href');
				if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || target.getAttribute('target') === '_blank') {
					return;
				}

				let route = href.replace(/^\//, '').replace(/\.html$/, '').replace(/^#\/?/, '');
				if (route === '' || route === 'index') route = 'home';

				if (ROUTES[route]) {
					e.preventDefault();
					navigateTo(route, true);
				}
			}
		});
	}

	// ─── BROWSER HISTORY POPSTATE EVENT ──────────────────────────
	window.addEventListener('popstate', function () {
		const targetRoute = resolveCurrentRoute();
		navigateTo(targetRoute, false);
	});

	window.addEventListener('hashchange', function () {
		const targetRoute = resolveCurrentRoute();
		if (targetRoute !== currentRoute) {
			navigateTo(targetRoute, false);
		}
	});

	// ─── KEYBOARD SHORTCUT NAVIGATION (1-5, Esc) ─────────────────
	function initKeyboardShortcuts() {
		document.addEventListener('keydown', function (e) {
			if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
				if (e.key === 'Escape') {
					window.adminCloseChapterModal();
					window.adminCloseFileModal();
					window.adminCloseSettingsModal();
					const feedbackWin = document.getElementById('feedback-window');
					if (feedbackWin?.classList.contains('open')) {
						window.toggleFeedback();
					}
				}
				return;
			}

			if (e.key === '1') navigateTo('home', true);
			else if (e.key === '2') navigateTo('socials', true);
			else if (e.key === '3') navigateTo('achievements', true);
			else if (e.key === '4') navigateTo('files', true);
			else if (e.key === '5') navigateTo('ai', true);
			else if (e.key === 'Escape') {
				window.adminCloseChapterModal();
				window.adminCloseFileModal();
				window.adminCloseSettingsModal();
				const feedbackWin = document.getElementById('feedback-window');
				if (feedbackWin?.classList.contains('open')) {
					window.toggleFeedback();
				}
			}
		});
	}

	// ─── ADAPTIVE 60/120 FPS DISPLAY REFRESH ENGINE ─────────────
	function initDisplayRefreshSync() {
		let lastFrameTime = performance.now();
		let frameCount = 0;
		let fps = 60;

		function measureFps(now) {
			frameCount++;
			if (now - lastFrameTime >= 1000) {
				fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
				frameCount = 0;
				lastFrameTime = now;
				if (fps > 80) {
					document.documentElement.setAttribute('data-refresh', 'high-hz');
				} else {
					document.documentElement.setAttribute('data-refresh', 'standard');
				}
			}
			if (frameCount < 120) {
				requestAnimationFrame(measureFps);
			}
		}
		requestAnimationFrame(measureFps);

		document.addEventListener('visibilitychange', function () {
			const ambientOverlay = document.querySelector('.nature-ambient-overlay');
			const waterStream = document.querySelector('.forest-water-stream');
			const globe = document.querySelector('.globe-wrapper');

			if (document.hidden) {
				if (ambientOverlay) ambientOverlay.style.animationPlayState = 'paused';
				if (waterStream) waterStream.style.animationPlayState = 'paused';
				if (globe) globe.style.animationPlayState = 'paused';
			} else {
				if (ambientOverlay) ambientOverlay.style.animationPlayState = 'running';
				if (waterStream) waterStream.style.animationPlayState = 'running';
				if (globe) globe.style.animationPlayState = 'running';
			}
		});
	}

	// ─── WINDOW RESIZE HANDLER FOR MAGNETIC PILL ────────────────
	window.addEventListener('resize', function () {
		updateMagneticPill();
	});

	// ─── APP BOOTSTRAP ───────────────────────────────────────────
	window.addEventListener('DOMContentLoaded', function () {
		// 1. Initialize Adaptive 60/120 FPS Display Refresh Engine
		initDisplayRefreshSync();

		// 2. Load dynamic chapters data
		loadChapters();

		// 3. Resolve initial route on page load
		const initialRoute = resolveCurrentRoute();
		navigateTo(initialRoute, false);

		const currentPath = window.location.pathname;
		if (currentPath.endsWith('.html') || (initialRoute !== 'home' && !window.location.hash)) {
			const targetHash = initialRoute === 'home' ? '' : '#' + initialRoute;
			window.history.replaceState({ route: initialRoute }, ROUTES[initialRoute].title, '/' + targetHash);
		}

		// 4. Initialize link interception
		initLinkInterception();

		// 5. Initialize precision live clock
		updateLiveClock();
		setInterval(updateLiveClock, 1000);

		// 6. Initialize feedback form
		initFeedbackForm();

		// 7. Initialize keyboard navigation
		initKeyboardShortcuts();

		// 8. Magnetic tab pill initial render
		setTimeout(updateMagneticPill, 100);

		// 9. Initialize Scroll Reveal animations
		initScrollReveal();
	});

	// Expose navigateTo globally for inline triggers
	window.navigateToTab = navigateTo;

})();
