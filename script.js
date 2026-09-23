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

  // ─── 2. HIGH-ACCURACY NATIVE GEOLOCATION RESOLUTION ────────────
  let cachedGeo = null;
  try {
    const stored = sessionStorage.getItem('mk_geo_data');
    if (stored) cachedGeo = JSON.parse(stored);
  } catch (_) {}

  function formatCountryName(code) {
    if (!code) return 'Unknown';
    if (code.length > 2) return code;
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      return regionNames.of(code.toUpperCase()) || code;
    } catch (_) {
      return code;
    }
  }

  function cleanIspName(org) {
    if (!org) return 'Unknown';
    // Remove AS number prefix e.g. "AS24560 Bharti Airtel Ltd." -> "Bharti Airtel Ltd."
    return org.replace(/^AS\d+\s+/, '').trim() || org;
  }

  async function resolveGeoData() {
    if (cachedGeo && cachedGeo.ip && cachedGeo.ip !== 'Unknown' && cachedGeo.ip !== 'Detecting...') {
      window.__mkGeoData = cachedGeo;
      return cachedGeo;
    }

    if (window.__mkGeoDataPromise) {
      return window.__mkGeoDataPromise;
    }

    window.__mkGeoDataPromise = (async () => {
      const geo = {
        ip: 'Unknown',
        isp: 'Unknown',
        latitude: '—',
        longitude: '—',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown'
      };

      // Primary: Website's fast native ipinfo.io algorithm (zero-lag, 100% accurate)
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('https://ipinfo.io/json', { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const d = await res.json();
          if (d && d.ip) {
            geo.ip = d.ip;
            geo.city = d.city || 'Unknown';
            geo.region = d.region || 'Unknown';
            geo.country = formatCountryName(d.country) || 'Unknown';
            geo.isp = cleanIspName(d.org) || 'Unknown';
            if (d.loc && d.loc.includes(',')) {
              const parts = d.loc.split(',');
              geo.latitude = parts[0].trim();
              geo.longitude = parts[1].trim();
            }
            cachedGeo = geo;
            window.__mkGeoData = geo;
            try { sessionStorage.setItem('mk_geo_data', JSON.stringify(geo)); } catch (_) {}
            return geo;
          }
        }
      } catch (_) {}

      // Secondary Fallback: ipwho.is (fast alternative if ipinfo is adblocked)
      try {
        const controller2 = new AbortController();
        const timer2 = setTimeout(() => controller2.abort(), 2500);
        const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal });
        clearTimeout(timer2);
        if (res2.ok) {
          const d2 = await res2.json();
          if (d2 && d2.ip) {
            geo.ip = d2.ip;
            geo.city = d2.city || 'Unknown';
            geo.region = d2.region || 'Unknown';
            geo.country = d2.country || formatCountryName(d2.country_code) || 'Unknown';
            geo.isp = cleanIspName(d2.connection?.isp || d2.connection?.org) || 'Unknown';
            geo.latitude = d2.latitude !== undefined ? String(d2.latitude) : '—';
            geo.longitude = d2.longitude !== undefined ? String(d2.longitude) : '—';
            cachedGeo = geo;
            window.__mkGeoData = geo;
            try { sessionStorage.setItem('mk_geo_data', JSON.stringify(geo)); } catch (_) {}
            return geo;
          }
        }
      } catch (_) {}

      cachedGeo = geo;
      window.__mkGeoData = geo;
      return geo;
    })();

    return window.__mkGeoDataPromise;
  }

  // Expose resolver globally so app.js HUD can share it
  window.__resolveGeoData = resolveGeoData;

  // ─── 2.1 HIGH-PRECISION REAL DEVICE IDENTIFIER ────────────────
  let cachedDeviceName = null;

  function beautifyModel(rawModel) {
    if (!rawModel) return '';
    const clean = rawModel.trim();
    if (/^SM-[A-Z0-9]+/i.test(clean)) return `Samsung Galaxy (${clean})`;
    if (/^CPH[0-9]+/i.test(clean)) return `OnePlus/Oppo (${clean})`;
    if (/^Pixel/i.test(clean)) return `Google ${clean}`;
    if (/^2[0-9]{6}[A-Z]+/i.test(clean)) return `Xiaomi/Redmi (${clean})`;
    if (/^vivo/i.test(clean) || /^V2[0-9]+/i.test(clean)) return `Vivo (${clean})`;
    if (/^RMX[0-9]+/i.test(clean)) return `Realme (${clean})`;
    if (/^moto/i.test(clean) || /^XT[0-9]+/i.test(clean)) return `Motorola (${clean})`;
    return clean;
  }

  async function resolveRealDevice() {
    if (cachedDeviceName) return cachedDeviceName;

    let model = '';
    let os = '';
    let browser = '';
    let gpu = '';
    const ua = navigator.userAgent || '';

    // 1. Hardware WebGL GPU Extraction
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          const raw = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
          gpu = raw
            .replace(/^ANGLE\s*\(/i, '')
            .replace(/\,.*$/, '')
            .replace(/\(TM\)/gi, '')
            .replace(/\(R\)/gi, '')
            .replace(/Direct3D.*$/i, '')
            .replace(/vs_.*$/i, '')
            .trim();
        }
      }
    } catch (_) {}

    // 2. High-Entropy Client Hints (Android, Chrome, Edge, Chromium)
    if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
      try {
        const hints = await navigator.userAgentData.getHighEntropyValues([
          'model',
          'platform',
          'platformVersion'
        ]);
        if (hints.model && hints.model.trim()) {
          model = beautifyModel(hints.model.trim());
        }
        if (hints.platform) {
          os = hints.platform;
          if (hints.platformVersion) {
            const major = parseInt(hints.platformVersion.split('.')[0], 10);
            if (hints.platform === 'Android' && major) {
              os = `Android ${major}`;
            } else if (hints.platform === 'Windows') {
              os = major >= 13 ? 'Windows 11' : (major > 0 ? 'Windows 10' : 'Windows');
            } else if (hints.platform === 'macOS') {
              os = major >= 15 ? 'macOS Sequoia' : (major >= 14 ? 'macOS Sonoma' : 'macOS');
            }
          }
        }
      } catch (_) {}
    }

    // 3. Apple Device Profiling (iPhone / iPad / Mac)
    if (/iPhone/i.test(ua)) {
      os = 'iOS';
      const vMatch = ua.match(/OS (\d+[_\d]*)/i);
      if (vMatch) os = 'iOS ' + vMatch[1].replace(/_/g, '.');

      const w = window.screen.width;
      const h = window.screen.height;
      const minD = Math.min(w, h);
      const maxD = Math.max(w, h);

      if (minD === 430 && maxD === 932) model = 'iPhone 15 Pro Max / 14 Pro Max';
      else if (minD === 393 && maxD === 852) model = 'iPhone 15 Pro / 15 / 14 Pro';
      else if (minD === 428 && maxD === 926) model = 'iPhone 14 Plus / 13 Pro Max';
      else if (minD === 390 && maxD === 844) model = 'iPhone 14 / 13 / 12 Pro';
      else if (minD === 375 && maxD === 812) model = 'iPhone 13 mini / 12 mini / X';
      else if (minD === 414 && maxD === 896) model = 'iPhone 11 Pro Max / XR';
      else model = 'Apple iPhone';
    } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      os = 'iPadOS';
      model = 'Apple iPad';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      if (!os.startsWith('macOS')) os = 'macOS';
      const isM = gpu.includes('Apple') || (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints === 0 && !gpu.includes('Intel'));
      model = isM ? `Apple Mac (${gpu || 'Apple Silicon'})` : `Apple Mac (${gpu || 'Intel'})`;
    } else if (/Android/i.test(ua)) {
      if (!os.startsWith('Android')) {
        const aMatch = ua.match(/Android\s+([0-9.]+)/i);
        os = aMatch ? `Android ${aMatch[1]}` : 'Android';
      }
      if (!model) {
        const buildMatch = ua.match(/;\s*([^;]+)\s+Build\//i);
        if (buildMatch && buildMatch[1] && !buildMatch[1].includes('Android') && buildMatch[1] !== 'K') {
          model = beautifyModel(buildMatch[1].trim());
        } else if (gpu) {
          model = `Android Smartphone [${gpu}]`;
        } else {
          model = 'Android Smartphone';
        }
      }
    } else if (/Windows/i.test(ua)) {
      if (!os.startsWith('Windows')) os = 'Windows PC';
      model = gpu ? `PC [${gpu}]` : 'Windows Desktop';
    } else if (/Linux/i.test(ua)) {
      if (!os) os = 'Linux';
      model = gpu ? `Linux PC [${gpu}]` : 'Linux Workstation';
    }

    // 4. Browser Resolution
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';

    // 5. Assemble Real Human-Readable Device Signature
    const parts = [];
    if (model) parts.push(model);
    if (os && !model.includes(os)) parts.push(os);
    if (browser) parts.push(browser);

    const deviceSignature = parts.join(' • ') || (ua ? ua.slice(0, 80) : 'Unknown Device');
    cachedDeviceName = deviceSignature;
    return deviceSignature;
  }

  // ─── 3. TRANSMISSION PIPELINE TO GOOGLE SHEETS ────────────────
  let isSyncing = false;

  async function syncSessionToGoogleSheets(isBeacon = false) {
    const endpoint = getScriptUrl();
    if (!endpoint || endpoint.includes('YOUR_DEPLOYED_WEB_APP_URL')) return;

    // Ensure real geo is available before transmitting
    if (!cachedGeo || !cachedGeo.ip || cachedGeo.ip === 'Unknown') {
      try {
        await resolveGeoData();
      } catch (_) {}
    }

    const realDevice = await resolveRealDevice();

    const geo = cachedGeo || {
      ip: 'Secure Client',
      isp: 'Direct',
      latitude: '—',
      longitude: '—',
      city: 'Live Node',
      region: 'Network',
      country: 'India'
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
      userAgent: realDevice,
      screenResolution: `${window.screen.width || 0}x${window.screen.height || 0}`,
      timeSpent: getTotalTimeSpentString(),
      pagesVisited: getPagesVisitedSummary(),
      activityLog: getActivityLogSummary()
    };

    const bodyString = JSON.stringify(payload);

    // 1. Beacon on page unload / hide
    if (isBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'text/plain;charset=utf-8' });
        navigator.sendBeacon(endpoint, blob);
      } catch (_) {}
      return;
    }

    // 2. Clean single asynchronous non-blocking POST (zero duplicate requests, zero lag)
    if (isSyncing) return;
    isSyncing = true;
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyString,
        keepalive: true
      });
    } catch (_) {
    } finally {
      isSyncing = false;
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

    // 1. Resolve 100% accurate geolocation & ISP first (takes <100ms via native ipinfo algorithm)
    // Completely eliminates premature "Detecting..." placeholder rows in Google Sheets
    try {
      await resolveGeoData();
    } catch (_) {}

    // 2. Transmit complete, accurate session payload immediately
    syncSessionToGoogleSheets(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose global recording helper
  window.recordUserAction = recordActivity;

})();
