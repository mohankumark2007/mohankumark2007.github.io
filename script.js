/**
 * ==============================================================================
 * MOHAN KUMAR K — INDIVIDUAL USER TELEMETRY & NAVIGATION ENGINE (script.js)
 * ==============================================================================
 * Automatically tracks individual visitor sessions, comprehensive page journeys,
 * active time spent per section, and detailed user actions.
 * Logs live data directly to Google Sheet ID: 1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM
 * 
 * Auto-Populated Columns:
 * Column A: Timestamp
 * Column B: IP Address
 * Column C: City
 * Column D: Region
 * Column E: Country
 * Column F: User Agent
 * Column G: Screen Resolution
 * Column H: Time Spent (e.g. 2m 14s)
 * Column I: Pages Visited (e.g. Home [25s] ➔ Files [40s] ➔ AI Chat [Active])
 * Column J: Activity Log (e.g. Switched to Dark Theme; Opened MITM Lab; Asked AI Bot)
 * Column K: Session ID
 * ==============================================================================
 */

(function () {
  'use strict';

  // Active Deployed Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy_wPfPb6WrkTO-sdYwgB6k03YRaAoPbKLA-0XlDd_t9G-vHm3qSzrvHZ-DG5dnwkGrw/exec';

  function getScriptUrl() {
    try {
      const stored = localStorage.getItem('GOOGLE_SCRIPT_URL');
      if (stored && stored.startsWith('https://script.google.com/')) {
        return stored.trim();
      }
    } catch (_) {}
    return GOOGLE_SCRIPT_URL;
  }

  // ─── 1. SESSION INITIALIZATION ─────────────────────────────────
  let sessionId = sessionStorage.getItem('mk_user_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem('mk_user_session_id', sessionId);
  }

  const sessionStartTime = Date.now();
  let currentRoute = (window.location.hash.replace('#', '') || 'home').toLowerCase();
  let routeStartTime = Date.now();
  
  // Track page durations: { 'home': 12, 'files': 45 }
  const pageDurations = {};
  pageDurations[currentRoute] = 0;

  // Track sequential navigation trail: ['Home [20s]', 'Files [45s]']
  const navigationTrail = [formatRouteName(currentRoute)];

  // Track chronological interaction events (capped at 25 most relevant events)
  const activityEvents = [
    `Opened site on /#${currentRoute}`
  ];

  function formatRouteName(route) {
    const map = {
      'home': 'Home',
      'socials': 'Socials',
      'achievements': 'Achievements',
      'files': 'Lab Files & Reports',
      'ai': 'AI Assistant',
      'admin': 'Admin Portal'
    };
    return map[route] || (route.charAt(0).toUpperCase() + route.slice(1));
  }

  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
  }

  function getTotalTimeSpentString() {
    const totalSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    return formatDuration(totalSeconds);
  }

  function getPagesVisitedSummary() {
    // Commit current route active time
    const elapsedOnCurrent = Math.round((Date.now() - routeStartTime) / 1000);
    const trailCopy = [...navigationTrail];
    
    // Annotate latest active section
    if (trailCopy.length > 0) {
      trailCopy[trailCopy.length - 1] = `${formatRouteName(currentRoute)} [${formatDuration((pageDurations[currentRoute] || 0) + elapsedOnCurrent)}]`;
    }
    
    return trailCopy.join(' ➔ ');
  }

  function getActivityLogSummary() {
    return activityEvents.slice(-15).join('; ');
  }

  function recordActivity(actionText) {
    if (!actionText) return;
    const timeOffset = formatDuration(Math.round((Date.now() - sessionStartTime) / 1000));
    activityEvents.push(`[${timeOffset}] ${actionText}`);
    if (activityEvents.length > 30) activityEvents.shift();
  }

  // ─── 2. MULTI-TIER GEOLOCATION RESOLUTION ─────────────────────
  let cachedGeo = null;

  async function resolveGeoData() {
    if (cachedGeo) return cachedGeo;

    const geo = {
      ip: 'Unknown',
      isp: 'Unknown',
      latitude: '—',
      longitude: '—',
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown'
    };

    // Primary: ipapi.co
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (res.ok) {
        const d = await res.json();
        if (d && (d.ip || d.city)) {
          geo.ip = d.ip || 'Unknown';
          geo.isp = d.org || d.asn || 'Unknown';
          geo.latitude = d.latitude !== undefined ? d.latitude : '—';
          geo.longitude = d.longitude !== undefined ? d.longitude : '—';
          geo.city = d.city || 'Unknown';
          geo.region = d.region || 'Unknown';
          geo.country = d.country_name || d.country || 'Unknown';
          cachedGeo = geo;
          return geo;
        }
      }
    } catch (_) {}

    // Secondary Fallback: ipwho.is
    try {
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), 3000);
      const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal, cache: 'no-store' });
      clearTimeout(timer2);
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2 && d2.ip) {
          geo.ip = d2.ip || 'Unknown';
          geo.isp = (d2.connection && (d2.connection.isp || d2.connection.org)) || d2.isp || 'Unknown';
          geo.latitude = d2.latitude !== undefined ? d2.latitude : '—';
          geo.longitude = d2.longitude !== undefined ? d2.longitude : '—';
          geo.city = d2.city || 'Unknown';
          geo.region = d2.region || 'Unknown';
          geo.country = d2.country || 'Unknown';
          cachedGeo = geo;
          return geo;
        }
      }
    } catch (_) {}

    // Tertiary Fallback: basic public IP check
    try {
      const res3 = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (res3.ok) {
        const d3 = await res3.json();
        if (d3 && d3.ip) {
          geo.ip = d3.ip;
          geo.city = 'Geo Blocked';
          geo.country = 'Geo Blocked';
          cachedGeo = geo;
          return geo;
        }
      }
    } catch (_) {}

    geo.ip = 'AdBlock / Restricted';
    cachedGeo = geo;
    return geo;
  }

  // ─── 3. TRANSMISSION PIPELINE TO GOOGLE SHEETS ────────────────
  async function syncSessionToGoogleSheets(isBeacon = false) {
    const endpoint = getScriptUrl();
    if (!endpoint || endpoint.includes('YOUR_DEPLOYED_WEB_APP_URL')) return;

    const geo = cachedGeo || {
      ip: 'Detecting...',
      isp: 'Detecting...',
      latitude: '—',
      longitude: '—',
      city: 'Detecting...',
      region: 'Detecting...',
      country: 'Detecting...'
    };

    const payload = {
      sessionId: sessionId,
      timestamp: new Date(sessionStartTime).toISOString(),
      ip: geo.ip,
      isp: geo.isp,
      latitude: geo.latitude,
      longitude: geo.longitude,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      userAgent: navigator.userAgent || 'Unknown',
      screenResolution: `${window.screen.width || 0}x${window.screen.height || 0}`,
      timeSpent: getTotalTimeSpentString(),
      pagesVisited: getPagesVisitedSummary(),
      activityLog: getActivityLogSummary()
    };

    const bodyString = JSON.stringify(payload);

    // 1. Image Beacon (100% reliable across Mobile Safari, Android, and restricted networks)
    try {
      const params = new URLSearchParams({
        action: 'log',
        sessionId: payload.sessionId || '',
        timestamp: payload.timestamp || '',
        ip: payload.ip || '',
        isp: payload.isp || '',
        latitude: String(payload.latitude || ''),
        longitude: String(payload.longitude || ''),
        city: payload.city || '',
        region: payload.region || '',
        country: payload.country || '',
        userAgent: (payload.userAgent || '').slice(0, 180),
        screenResolution: payload.screenResolution || '',
        timeSpent: payload.timeSpent || '',
        pagesVisited: (payload.pagesVisited || '').slice(0, 250),
        activityLog: (payload.activityLog || '').slice(-250)
      });
      const img = new Image();
      img.src = `${endpoint}?${params.toString()}`;
    } catch (_) {}

    // 2. Beacon for page unload
    if (isBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'text/plain;charset=utf-8' });
        navigator.sendBeacon(endpoint, blob);
      } catch (_) {}
      return;
    }

    // 3. Standard background POST fetch
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyString,
        keepalive: true
      });
    } catch (err) {
      console.debug('[Telemetry] Sync note:', err.message);
    }
  }

  // ─── 4. INTERACTION & NAVIGATION DETECTORS ────────────────────
  function handleRouteTransition(newRoute) {
    const normalized = (newRoute || 'home').toLowerCase().replace('#', '');
    if (normalized === currentRoute) return;

    // Finalize time on previous route
    const timeOnPrev = Math.round((Date.now() - routeStartTime) / 1000);
    pageDurations[currentRoute] = (pageDurations[currentRoute] || 0) + timeOnPrev;

    // Update navigation trail
    if (navigationTrail.length > 0) {
      navigationTrail[navigationTrail.length - 1] = `${formatRouteName(currentRoute)} [${formatDuration(pageDurations[currentRoute])}]`;
    }
    navigationTrail.push(formatRouteName(normalized));

    // Record activity
    recordActivity(`Navigated to ${formatRouteName(normalized)}`);

    // Shift to new route
    currentRoute = normalized;
    routeStartTime = Date.now();
    pageDurations[currentRoute] = pageDurations[currentRoute] || 0;

    // Debounced sync
    scheduleSync(1500);
  }

  let syncTimeout = null;
  function scheduleSync(delay = 2000) {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncSessionToGoogleSheets(false), delay);
  }

  // Hook into URL hash changes (clean router support)
  window.addEventListener('hashchange', () => {
    handleRouteTransition(window.location.hash);
  });

  // Intercept global navigation trigger
  const originalNavigateTo = window.navigateToTab;
  window.navigateToTab = function (route, updateHistory) {
    handleRouteTransition(route);
    if (typeof originalNavigateTo === 'function') {
      return originalNavigateTo(route, updateHistory);
    }
  };

  // Event Listeners for Clicks, Theme Toggles & Interactions
  function initUserActivityListeners() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [data-track], .file-card');
      if (!target) return;

      // 1. Theme toggle button
      if (target.id === 'theme-toggle-btn' || target.closest('#theme-toggle-btn')) {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'Dark' : 'Light';
        recordActivity(`Toggled Theme to ${nextTheme}`);
        scheduleSync(1000);
        return;
      }

      // 2. Resource & Project Reports clicks
      const cardTitle = target.querySelector('.file-title')?.textContent?.trim() || target.getAttribute('title') || target.textContent?.trim();
      if (target.classList.contains('file-card') || target.closest('.file-card')) {
        recordActivity(`Viewed Resource: "${cardTitle?.slice(0, 40) || 'Project Item'}"`);
        scheduleSync(2000);
        return;
      }

      // 3. AI Chatbot interactions
      if (target.id === 'chat-send-btn' || target.closest('#chat-send-btn')) {
        const chatInput = document.getElementById('chat-input');
        const promptSnippet = chatInput?.value?.trim()?.slice(0, 35) || 'Question';
        recordActivity(`Prompted AI: "${promptSnippet}..."`);
        scheduleSync(2000);
        return;
      }

      // 4. Feedback widget
      if (target.id === 'feedback-trigger' || target.closest('#feedback-trigger')) {
        recordActivity(`Opened Feedback Widget`);
        scheduleSync(2000);
        return;
      }

      // 5. External links (GitHub, LinkedIn, Email)
      if (target.tagName === 'A' && target.href && !target.href.startsWith(window.location.origin) && !target.href.startsWith('javascript:')) {
        recordActivity(`Clicked External Link: ${target.href.replace('https://', '').slice(0, 45)}`);
        syncSessionToGoogleSheets(true);
        return;
      }
    }, { passive: true });

    // Track deep scrolling engagement
    let hasScrolledHalfway = false;
    window.addEventListener('scroll', () => {
      if (hasScrolledHalfway) return;
      const scrollPos = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight > 1000 && scrollPos / docHeight > 0.6) {
        hasScrolledHalfway = true;
        recordActivity(`Engaged in deep scroll on ${formatRouteName(currentRoute)}`);
        scheduleSync(3000);
      }
    }, { passive: true });

    // Save final state when visitor switches tab or leaves website
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        recordActivity('Visitor switched tab / left window');
        syncSessionToGoogleSheets(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      syncSessionToGoogleSheets(true);
    });

    // 25-second periodic heartbeat while active
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncSessionToGoogleSheets(false);
      }
    }, 25000);
  }

  // ─── 5. BOOTSTRAP INITIALIZATION ──────────────────────────────
  async function boot() {
    initUserActivityListeners();

    // 1. Immediately ping with client/device metrics on arrival
    syncSessionToGoogleSheets(false);

    // 2. Resolve IP, ISP & GPS coordinates in parallel without waiting
    resolveGeoData().then(() => {
      // 3. Immediately update row with full geolocation and ISP details
      syncSessionToGoogleSheets(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose global recording helper
  window.recordUserAction = recordActivity;

})();
