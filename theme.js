/**
 * ============================================================
 * MOHAN KUMAR K — FLAGSHIP THEME ENGINE (theme.js)
 * Immediate FOUC prevention & Silky Smooth View Transitions
 * ============================================================
 */

(function () {
	'use strict';

	// 1. Determine theme immediately on parse to eliminate White/Dark Flash (FOUC)
	const savedTheme = localStorage.getItem('theme');
	let theme = 'dark'; // Enchanted Forest Default

	if (savedTheme === 'light' || savedTheme === 'dark') {
		theme = savedTheme;
	} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		theme = 'light';
	}

	document.documentElement.setAttribute('data-theme', theme);
	updateMetaThemeColor(theme);

	function updateMetaThemeColor(currentTheme) {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', currentTheme === 'light' ? '#f4f8f5' : '#040e09');
		}
	}

	window.updateMetaThemeColor = updateMetaThemeColor;

	// 2. Silky Smooth Theme Switcher Engine
	function applyThemeSwitch(newTheme) {
		const updateDOM = () => {
			document.documentElement.setAttribute('data-theme', newTheme);
			localStorage.setItem('theme', newTheme);
			updateMetaThemeColor(newTheme);
		};

		// Enable temporary transition class for ultra-smooth CSS interpolation
		document.documentElement.classList.add('theme-transitioning');

		if (document.startViewTransition) {
			const transition = document.startViewTransition(() => {
				updateDOM();
			});
			transition.finished.finally(() => {
				setTimeout(() => {
					document.documentElement.classList.remove('theme-transitioning');
				}, 100);
			});
		} else {
			updateDOM();
			setTimeout(() => {
				document.documentElement.classList.remove('theme-transitioning');
			}, 450);
		}
	}

	// 3. DOM Ready listeners
	window.addEventListener('DOMContentLoaded', () => {
		const toggleBtn = document.getElementById('theme-toggle');
		if (toggleBtn) {
			toggleBtn.addEventListener('click', () => {
				const current = document.documentElement.getAttribute('data-theme');
				const target = current === 'light' ? 'dark' : 'light';
				applyThemeSwitch(target);
			});
		}

		// OS Preference Listener
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			if (!localStorage.getItem('theme')) {
				const systemTheme = e.matches ? 'dark' : 'light';
				applyThemeSwitch(systemTheme);
			}
		});
	});
})();
