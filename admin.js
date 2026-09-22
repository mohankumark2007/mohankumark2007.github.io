/**
 * ==============================================================================
 * MOHAN KUMAR K — ADMIN PORTAL TELEMETRY & USER TRACK RECORD HELPER (admin.js)
 * ==============================================================================
 * Connects the Admin Portal Dashboard with the live Google Sheet:
 * ID: 1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM
 * 
 * Features:
 * - Fetches real-time individual visitor logs including Time Spent & Pages Visited.
 * - Interactive User Track Record inspector modal for examining every visitor action.
 * - Live search & filter capabilities.
 * ==============================================================================
 */

(function () {
  'use strict';

  const DEFAULT_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy_wPfPb6WrkTO-sdYwgB6k03YRaAoPbKLA-0XlDd_t9G-vHm3qSzrvHZ-DG5dnwkGrw/exec';
  const SPREADSHEET_ID = '1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM';

  function getActiveScriptUrl() {
    try {
      const stored = localStorage.getItem('GOOGLE_SCRIPT_URL');
      if (stored && stored.startsWith('https://script.google.com/')) {
        return stored.trim();
      }
    } catch (_) {}
    return DEFAULT_GOOGLE_SCRIPT_URL;
  }

  async function fetchVisitorLogs(customUrl) {
    const url = customUrl || getActiveScriptUrl();

    if (!url || url.includes('YOUR_DEPLOYED_WEB_APP_URL')) {
      throw new Error('Google Apps Script Web App URL is not set.');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to reach Google Apps Script.`);
    }

    const json = await response.json();

    if (json.status === 'success' && Array.isArray(json.data)) {
      return json.data;
    } else if (json.data && Array.isArray(json.data)) {
      return json.data;
    } else {
      throw new Error(json.message || 'Malformed response from Google Apps Script.');
    }
  }

  function formatTimestamp(rawTimestamp) {
    if (!rawTimestamp) return '—';
    try {
      const d = new Date(rawTimestamp);
      if (isNaN(d.getTime())) return String(rawTimestamp);
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (_) {
      return String(rawTimestamp);
    }
  }

  let _cachedLogs = [];

  function renderVisitorLogsTable(targetTbody, records) {
    const tbody = typeof targetTbody === 'string' ? document.getElementById(targetTbody) : targetTbody;
    if (!tbody) return;

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 36px 16px; color: #888;">
            <div style="font-size: 1.1rem; margin-bottom: 6px;">No telemetry records yet</div>
            <div style="font-size: 0.82rem; color: #666;">Waiting for visitor sessions to log into Sheet1...</div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = records.map((item, index) => {
      const location = [item.city, item.country].filter(Boolean).filter(s => s !== 'Unknown').join(', ') || 'Unknown Location';
      const formattedTime = formatTimestamp(item.timestamp);
      const isAdBlocked = item.ip && (item.ip.includes('Restricted') || item.ip.includes('AdBlock'));

      const ipBadge = isAdBlocked
        ? `<span style="padding: 2px 6px; background: rgba(244,63,94,0.15); color: #f43f5e; border-radius: 4px; font-size: 0.78rem; font-family: monospace;">${item.ip}</span>`
        : `<span style="padding: 2px 6px; background: rgba(0,255,204,0.1); color: #00ffcc; border-radius: 4px; font-size: 0.8rem; font-family: monospace; font-weight: 600;">${item.ip || '—'}</span>`;

      // Time spent badge
      const timeSpentStr = item.timeSpent || '0s';
      const timeBadge = `<span style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; background: rgba(16,185,129,0.15); color: #34d399; border-radius: 999px; font-size: 0.78rem; font-weight: 600; font-family: monospace;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${timeSpentStr}
      </span>`;

      // Pages Visited journey
      const pagesStr = item.pagesVisited || 'Home';
      const journeyDisplay = `<div style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: #a3c4b5; font-family: monospace;" title="${pagesStr}">
        ${pagesStr}
      </div>`;

      // Action count & Inspect button
      const actionsCount = (item.activityLog ? item.activityLog.split(';').length : 1);

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.15s ease;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 8px; white-space: nowrap; font-size: 0.82rem; color: #ddd;">
            ${formattedTime}
          </td>
          <td style="padding: 10px 8px; white-space: nowrap;">
            ${ipBadge}
            <div style="font-size: 0.73rem; color: #889990; margin-top: 3px;">
              ${location}
              ${item.isp && item.isp !== 'Unknown' ? ` • <span style="color:#00ffcc; opacity:0.9;">${item.isp}</span>` : ''}
            </div>
          </td>
          <td style="padding: 10px 8px; white-space: nowrap;">
            ${timeBadge}
          </td>
          <td style="padding: 10px 8px;">
            ${journeyDisplay}
          </td>
          <td style="padding: 10px 8px; white-space: nowrap;">
            <button type="button" class="btn btn-glass btn-sm" onclick="window.inspectUserTrackRecord(${index})" style="font-size: 0.75rem; padding: 3px 8px; border-color: rgba(0,255,204,0.3); color: #00ffcc;" title="View all actions performed by this user">
              <span>Inspect (${actionsCount} acts) ➔</span>
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // ─── INSPECT INDIVIDUAL USER TRACK RECORD ─────────────────────
  window.inspectUserTrackRecord = function (index) {
    if (!_cachedLogs || !_cachedLogs[index]) return;
    const item = _cachedLogs[index];

    const modal = document.getElementById('modal-user-track-record');
    if (!modal) return;

    // Set header & quick stats
    document.getElementById('utr-modal-title').textContent = `User Track Record: ${item.ip}`;
    document.getElementById('utr-time-spent').textContent = item.timeSpent || '0s';
    document.getElementById('utr-ip').textContent = item.ip || '—';
    document.getElementById('utr-location').textContent = [item.city, item.region, item.country].filter(Boolean).filter(s => s !== 'Unknown').join(', ') || 'Unknown';
    
    // ISP & Coordinates
    const ispEl = document.getElementById('utr-isp');
    if (ispEl) ispEl.textContent = item.isp || 'Unknown';

    const coordsEl = document.getElementById('utr-coords');
    if (coordsEl) {
      if (item.latitude && item.latitude !== '—' && item.longitude && item.longitude !== '—') {
        coordsEl.innerHTML = `${item.latitude}, ${item.longitude} <a href="https://www.google.com/maps?q=${item.latitude},${item.longitude}" target="_blank" rel="noopener noreferrer" style="color:#00ffcc; margin-left:6px; text-decoration:underline;">[Google Maps ↗]</a>`;
      } else {
        coordsEl.textContent = '—';
      }
    }

    document.getElementById('utr-screen').textContent = item.screenResolution || '—';
    document.getElementById('utr-session-id').textContent = item.sessionId || '—';
    document.getElementById('utr-ua').textContent = item.userAgent || '—';

    // Navigation Journey
    document.getElementById('utr-pages-visited').textContent = item.pagesVisited || 'Home';

    // Activity List timeline
    const activityContainer = document.getElementById('utr-activity-list');
    if (activityContainer) {
      const actions = item.activityLog ? item.activityLog.split(';') : ['Site opened'];
      activityContainer.innerHTML = actions.map(act => {
        const cleanAct = act.trim();
        if (!cleanAct) return '';
        return `
          <div style="display: flex; align-items: flex-start; gap: 8px; padding: 7px 10px; background: rgba(255,255,255,0.03); border-radius: 6px; font-size: 0.8rem; border-left: 3px solid #00ffcc;">
            <span style="color: #fff;">${cleanAct}</span>
          </div>`;
      }).filter(Boolean).join('');
    }

    modal.style.display = 'flex';
  };

  window.closeUserTrackRecordModal = function () {
    const modal = document.getElementById('modal-user-track-record');
    if (modal) modal.style.display = 'none';
  };

  async function loadTelemetryDashboard() {
    const tbody = document.getElementById('analytics-table-body');
    const totalEl = document.getElementById('analytics-total-visits');
    const avgEl = document.getElementById('analytics-avg-duration');
    const sheetLinkEl = document.getElementById('telemetry-sheet-link');

    if (sheetLinkEl) {
      sheetLinkEl.href = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
    }

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 28px; color: #00ffcc; font-family: monospace;">
            <div style="display: inline-block; animation: spin 1s linear infinite; margin-right: 8px;">⟳</div>
            Streaming live visitor sessions and navigation track records...
          </td>
        </tr>`;
    }

    try {
      const logs = await fetchVisitorLogs();
      _cachedLogs = logs;

      if (totalEl) totalEl.textContent = logs.length;

      if (avgEl) {
        const countries = new Set(logs.map(l => l.country).filter(c => c && c !== 'Unknown'));
        avgEl.textContent = `${countries.size} Countries`;
      }

      renderVisitorLogsTable(tbody, logs);
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="padding: 24px; text-align: center; color: #f43f5e;">
              <div style="font-weight: 600; margin-bottom: 6px;">Telemetry Retrieval Notice</div>
              <div style="font-size: 0.85rem; color: #bbb; max-width: 500px; margin: 0 auto; line-height: 1.4;">
                ${err.message}
              </div>
              <div style="margin-top: 14px;">
                <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit" target="_blank" rel="noopener noreferrer" class="btn btn-glass btn-sm" style="color:#00ffcc; border-color:#00ffcc;">
                  <span>Open Target Google Sheet Directly ↗</span>
                </a>
              </div>
            </td>
          </tr>`;
      }
    }
  }

  function filterVisitorLogs(query) {
    if (!_cachedLogs || _cachedLogs.length === 0) return;
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderVisitorLogsTable('analytics-table-body', _cachedLogs);
      return;
    }

    const filtered = _cachedLogs.filter(item => {
      return (item.ip && item.ip.toLowerCase().includes(q)) ||
             (item.city && item.city.toLowerCase().includes(q)) ||
             (item.country && item.country.toLowerCase().includes(q)) ||
             (item.pagesVisited && item.pagesVisited.toLowerCase().includes(q)) ||
             (item.activityLog && item.activityLog.toLowerCase().includes(q)) ||
             (item.userAgent && item.userAgent.toLowerCase().includes(q));
    });

    renderVisitorLogsTable('analytics-table-body', filtered);
  }

  window.TelemetryAdmin = {
    SPREADSHEET_ID,
    fetchVisitorLogs,
    renderVisitorLogsTable,
    loadTelemetryDashboard,
    filterVisitorLogs,
    getActiveScriptUrl
  };

  window.fetchVisitorLogs = fetchVisitorLogs;
  window.loadTelemetryDashboard = loadTelemetryDashboard;
  window.filterVisitorLogs = filterVisitorLogs;

})();
