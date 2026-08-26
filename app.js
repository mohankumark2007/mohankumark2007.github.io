/**
 * ============================================================
 * MOHAN KUMAR K — FLAGSHIP SPA CORE (app.js)
 * Clean URL Router (/home, /socials, /achievements, /files, /ai)
 * 120 FPS GPU-Accelerated Tab Transitions & Micro-Interactions
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
				// Update hash to reflect the intended route
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

		return 'home';
	}

	// ─── TAB NAVIGATION ENGINE (Zero-Lag SPA Switcher) ───────────
	function navigateTo(routeName, updateHistory = true) {
		if (!ROUTES[routeName]) routeName = 'home';
		const routeData = ROUTES[routeName];
		currentRoute = routeName;

		// 1. Update Navigation Tabs Active State & Magnetic Indicator
		document.querySelectorAll('.tab-link').forEach(link => {
			const isTarget = link.getAttribute('data-tab') === routeName || link.id === routeData.tabId;
			link.classList.toggle('active', isTarget);
			if (isTarget) {
				link.setAttribute('aria-selected', 'true');
			} else {
				link.setAttribute('aria-selected', 'false');
			}
		});

		updateMagneticPill();

		// 2. Switch Tab Panels with GPU-Accelerated Crossfade
		const allPanels = document.querySelectorAll('.tab-panel');
		allPanels.forEach(panel => {
			if (panel.id === routeData.panelId) {
				panel.style.display = 'flex';
				// Force reflow for smooth hardware animation
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
					// For home, use pushState to clear the hash cleanly
					window.history.pushState({ route: routeName }, routeData.title, window.location.pathname);
				}
			}
		}

		// 5. Special route behaviors
		if (routeName === 'ai' && typeof window.initializeTabChat === 'function') {
			window.initializeTabChat();
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
			// Fallback: reveal all immediately if IntersectionObserver not supported
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

		if (!navTabs || !activeTab) return;

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

	// ─── GLOBAL LINK INTERCEPTOR (Clean URL Handler) ─────────────
	function initLinkInterception() {
		document.addEventListener('click', function (e) {
			const target = e.target.closest('a, button, [data-tab], [data-route]');
			if (!target) return;

			// Check for data-tab or data-route
			const tabAttr = target.getAttribute('data-tab') || target.getAttribute('data-route');
			if (tabAttr && ROUTES[tabAttr]) {
				e.preventDefault();
				navigateTo(tabAttr, true);
				return;
			}

			// Check for internal anchor links (e.g. href="/socials", href="socials.html", href="#socials")
			if (target.tagName === 'A') {
				const href = target.getAttribute('href');
				if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || target.getAttribute('target') === '_blank') {
					return;
				}

				// Clean route extraction
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
	// Handle both popstate and hashchange for navigation
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
			// Don't trigger when typing in input, textarea, or chat
			if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
				if (e.key === 'Escape') {
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
				const feedbackWin = document.getElementById('feedback-window');
				if (feedbackWin?.classList.contains('open')) {
					window.toggleFeedback();
				}
			}
		});
	}

	// ─── ADAPTIVE 60/120 FPS DISPLAY REFRESH ENGINE ─────────────
	function initDisplayRefreshSync() {
		// Detect display refresh rate and calibrate animation cycles
		let lastFrameTime = performance.now();
		let frameCount = 0;
		let fps = 60;

		function measureFps(now) {
			frameCount++;
			if (now - lastFrameTime >= 1000) {
				fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
				frameCount = 0;
				lastFrameTime = now;
				// Tag html element with refresh class for fine-tuned CSS compositing
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

		// Page Visibility Optimization (Pauses ambient animations when tab is inactive)
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

		// 2. Resolve initial route on page load
		const initialRoute = resolveCurrentRoute();
		navigateTo(initialRoute, false);

		// Clean up URL if opened with path-based route (redirect to hash-based)
		const currentPath = window.location.pathname;
		if (currentPath.endsWith('.html') || (initialRoute !== 'home' && !window.location.hash)) {
			const targetHash = initialRoute === 'home' ? '' : '#' + initialRoute;
			window.history.replaceState({ route: initialRoute }, ROUTES[initialRoute].title, '/' + targetHash);
		}

		// 3. Initialize link interception
		initLinkInterception();

		// 4. Initialize precision live clock
		updateLiveClock();
		setInterval(updateLiveClock, 1000);

		// 5. Initialize feedback form
		initFeedbackForm();

		// 6. Initialize keyboard navigation
		initKeyboardShortcuts();

		// 7. Magnetic tab pill initial render
		setTimeout(updateMagneticPill, 100);

		// 8. Initialize Scroll Reveal animations
		initScrollReveal();
	});

	// Expose navigateTo globally for inline triggers
	window.navigateToTab = navigateTo;

})();
