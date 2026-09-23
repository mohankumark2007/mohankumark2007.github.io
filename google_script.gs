/**
 * ==============================================================================
 * GODZEMOHAN.IN — TELEMETRY & LIVE EXECUTIVE ANALYTICS DASHBOARD ENGINE
 * ==============================================================================
 * Target Spreadsheet ID: 1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM
 * 
 * Features:
 * 1. Real-time visitor logging (IP, ISP, Latitude, Longitude, City, Country, UA, Time Spent, Navigation Journey, Actions).
 * 2. Automated Live Executive Dashboard sheet ("📊 Live Dashboard"):
 *    - Real-time KPI Scorecards (Total Sessions, Unique Visitors, Top Country, Top City, Top ISP)
 *    - Live Geographic Distribution Table (Country & City breakdown)
 *    - Top Internet Service Providers (ISPs) Table
 *    - Client Device & Screen Resolution Breakdown
 *    - Top Navigation Trails & Page Journeys
 *    - Live Stream of Last 15 Sessions with full telemetry
 * 3. Custom Google Sheets Menu: "⚡ Web Telemetry" -> "📊 Rebuild Live Dashboard"
 * 4. Dual HTTP API support (doPost & doGet) with lock protection.
 * ==============================================================================
 */

const SPREADSHEET_ID = '1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM';
const DASHBOARD_SHEET_NAME = '📊 Live Dashboard';
const RAW_SHEET_NAME = '📋 Raw Logs';

// Telemetry Data Columns
const HEADERS = [
  'Timestamp',
  'IP Address',
  'ISP',
  'Latitude',
  'Longitude',
  'City',
  'Region',
  'Country',
  'User Agent',
  'Screen Resolution',
  'Time Spent',
  'Pages Visited',
  'Activity Log',
  'Session ID'
];

/**
 * Custom Menu inside Google Sheets interface for 1-click dashboard rebuilding & sanitation
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('⚡ Web Telemetry')
      .addItem('📊 Rebuild Live Dashboard', 'buildLiveDashboard')
      .addItem('🧹 Clean Dummy & Test Records', 'cleanCorruptedLogs')
      .addToUi();
  } catch (_) {}
}

/**
 * Automatically purges corrupted legacy column-shifted rows, synthetic test sessions,
 * and abandoned placeholders from the raw telemetry log sheet.
 * Guarantees that only 100% authentic, real visitor sessions remain.
 */
function cleanCorruptedLogs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rawSheet = getTargetSheet();
  const lastRow = rawSheet.getLastRow();
  if (lastRow <= 1) return { status: 'success', deleted: 0 };

  const lastCol = Math.max(rawSheet.getLastColumn(), HEADERS.length);
  const data = rawSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const rowsToDelete = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2;
    const ip = String(row[1] || '').trim();
    const isp = String(row[2] || '').trim();
    const city = String(row[5] || '').trim();
    const userAgent = String(row[8] || '').trim();
    const sessionId = String(row[13] || '').trim();

    // 1. Corrupted legacy shifted records (UserAgent string in City column or City > 40 chars)
    const isLegacyShifted = city.indexOf('Mozilla/') !== -1 || city.indexOf('Antigravity') !== -1 || city.length > 40;

    // 2. Synthetic test rows or diagnostic pings
    const isTestRow = sessionId.indexOf('test_') === 0 ||
                      ip === '103.110.170.2' ||
                      ip === '1.2.3.4' ||
                      userAgent.indexOf('Manual Diagnostic Test') !== -1 ||
                      userAgent.indexOf('Antigravity Test') !== -1 ||
                      userAgent.indexOf('Node Test') !== -1;

    // 3. Unresolved abandoned placeholder rows (Detecting... / Unknown / empty)
    const isPlaceholder = ip.indexOf('Detecting') !== -1 || 
                          city.indexOf('Detecting') !== -1 || 
                          isp.indexOf('Detecting') !== -1 || 
                          ip === '' || 
                          ip === 'Unknown';

    if (isLegacyShifted || isTestRow || isPlaceholder) {
      rowsToDelete.push(rowNum);
    }
  }

  // Delete from bottom to top so row indices remain valid
  for (let j = rowsToDelete.length - 1; j >= 0; j--) {
    rawSheet.deleteRow(rowsToDelete[j]);
  }

  Logger.log('Purged ' + rowsToDelete.length + ' dummy/corrupted rows from ' + rawSheet.getName());
  return { status: 'success', deleted: rowsToDelete.length };
}

/**
 * Targets the Raw Logs sheet, renaming from Sheet1 if necessary, and formatting headers
 */
function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  let sheet = null;
  // 1. Look for existing sheet named RAW_SHEET_NAME
  sheet = ss.getSheetByName(RAW_SHEET_NAME);
  
  // 2. If not found, look for original Sheet1 (gid 0) that is not the Dashboard
  if (!sheet) {
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== DASHBOARD_SHEET_NAME && sheets[i].getSheetId() === 0) {
        sheet = sheets[i];
        try {
          sheet.setName(RAW_SHEET_NAME);
        } catch (_) {}
        break;
      }
    }
  }

  // 3. Fallback to any non-dashboard sheet
  if (!sheet) {
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== DASHBOARD_SHEET_NAME) {
        sheet = sheets[i];
        break;
      }
    }
  }

  // 4. Create new raw sheet if none exists
  if (!sheet) {
    sheet = ss.insertSheet(RAW_SHEET_NAME);
  }

  // Format headers if needed
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
  } else {
    const currentCols = sheet.getLastColumn();
    if (currentCols < HEADERS.length) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      formatHeaderRow(sheet);
    }
  }

  return sheet;
}

function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0d1f18');
  headerRange.setFontColor('#00ffcc');
  headerRange.setFontFamily('Consolas');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  
  sheet.setColumnWidth(1, 185); // A: Timestamp
  sheet.setColumnWidth(2, 130); // B: IP Address
  sheet.setColumnWidth(3, 160); // C: ISP
  sheet.setColumnWidth(4, 110); // D: Latitude
  sheet.setColumnWidth(5, 110); // E: Longitude
  sheet.setColumnWidth(6, 120); // F: City
  sheet.setColumnWidth(7, 120); // G: Region
  sheet.setColumnWidth(8, 120); // H: Country
  sheet.setColumnWidth(9, 250); // I: User Agent
  sheet.setColumnWidth(10, 130); // J: Screen Resolution
  sheet.setColumnWidth(11, 120); // K: Time Spent
  sheet.setColumnWidth(12, 280); // L: Pages Visited
  sheet.setColumnWidth(13, 340); // M: Activity Log
  sheet.setColumnWidth(14, 160); // N: Session ID
}

/**
 * Searches for an existing row by Session ID
 */
function findRowBySessionId(sheet, sessionId) {
  if (!sessionId) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  const sessionCol = HEADERS.indexOf('Session ID') + 1; // Column 14
  const searchDepth = Math.min(lastRow - 1, 200);
  const startRow = lastRow - searchDepth + 1;
  const sessionColumnVals = sheet.getRange(startRow, sessionCol, searchDepth, 1).getValues();

  for (let i = sessionColumnVals.length - 1; i >= 0; i--) {
    if (String(sessionColumnVals[i][0]).trim() === String(sessionId).trim()) {
      return startRow + i;
    }
  }
  return -1;
}

/**
 * Saves a new visitor row or updates an ongoing session duration & navigation trail
 */
function saveOrUpdateSession(data) {
  const sheet = getTargetSheet();
  const sessionId = data.sessionId || data.session_id || '';
  const timeSpent = data.timeSpent || data.duration || '0s (active)';
  const pagesVisited = data.pagesVisited || data.routes || data.currentRoute || 'Home';
  const activityLog = data.activityLog || data.actions || 'Site opened';

  let targetRow = -1;
  if (sessionId) {
    targetRow = findRowBySessionId(sheet, sessionId);
  }

  // UPDATE EXISTING SESSION (Duration, Navigation Trail & Geo Enrichment)
  if (targetRow > 1) {
    const existingRow = sheet.getRange(targetRow, 1, 1, HEADERS.length).getValues()[0];
    const currentIp = String(existingRow[1] || '').trim();
    const currentCity = String(existingRow[5] || '').trim();

    const newIp = String(data.ip || data.ipAddress || '').trim();
    const newIsp = String(data.isp || data.org || '').trim();
    const newLat = data.latitude !== undefined && data.latitude !== null ? String(data.latitude) : '';
    const newLon = data.longitude !== undefined && data.longitude !== null ? String(data.longitude) : '';
    const newCity = String(data.city || '').trim();
    const newRegion = String(data.region || data.regionName || '').trim();
    const newCountry = String(data.country || data.country_name || '').trim();

    // Enrich existing session if IP/City was previously unpopulated or placeholder
    if ((currentIp === '' || currentIp === 'Detecting...' || currentIp === 'Unknown') && newIp && newIp !== 'Detecting...' && newIp !== 'Unknown') {
      sheet.getRange(targetRow, 2, 1, 7).setValues([[
        newIp,
        newIsp || existingRow[2],
        newLat || existingRow[3],
        newLon || existingRow[4],
        newCity || existingRow[5],
        newRegion || existingRow[6],
        newCountry || existingRow[7]
      ]]);
    } else if ((currentCity === '' || currentCity === 'Detecting...' || currentCity === 'Unknown') && newCity && newCity !== 'Detecting...' && newCity !== 'Unknown') {
      sheet.getRange(targetRow, 3, 1, 6).setValues([[
        newIsp || existingRow[2],
        newLat || existingRow[3],
        newLon || existingRow[4],
        newCity,
        newRegion || existingRow[6],
        newCountry || existingRow[7]
      ]]);
    }

    const timeSpentCol = HEADERS.indexOf('Time Spent') + 1; // Column 11
    sheet.getRange(targetRow, timeSpentCol, 1, 3).setValues([[
      timeSpent,
      pagesVisited,
      activityLog
    ]]);
    return { action: 'updated', row: targetRow, sessionId: sessionId };
  }

  // HARD GUARD: NEVER INSERT A PLACEHOLDER "Detecting..." ROW
  const rawIp = String(data.ip || data.ipAddress || '').trim();
  const rawCity = String(data.city || '').trim();
  const rawIsp = String(data.isp || data.org || '').trim();
  if (rawIp.indexOf('Detecting') !== -1 || rawCity.indexOf('Detecting') !== -1 || rawIsp.indexOf('Detecting') !== -1 || rawIp === '' || rawIp === 'Unknown') {
    return { action: 'ignored', reason: 'Placeholder IP rejected - real data required' };
  }

  // INSERT NEW VISITOR ROW
  const timestamp = data.timestamp || new Date().toISOString();
  const ipAddress = rawIp;
  const isp = data.isp || data.org || 'Unknown';
  const latitude = data.latitude !== undefined && data.latitude !== null ? String(data.latitude) : '—';
  const longitude = data.longitude !== undefined && data.longitude !== null ? String(data.longitude) : '—';
  const city = data.city || 'Unknown';
  const region = data.region || data.regionName || 'Unknown';
  const country = data.country || data.country_name || 'Unknown';
  const userAgent = data.userAgent || data.ua || 'Unknown';
  const screenRes = data.screenResolution || data.screen || 'Unknown';

  sheet.appendRow([
    timestamp,
    ipAddress,
    isp,
    latitude,
    longitude,
    city,
    region,
    country,
    userAgent,
    screenRes,
    timeSpent,
    pagesVisited,
    activityLog,
    sessionId
  ]);

  const newRow = sheet.getLastRow();
  const newRowRange = sheet.getRange(newRow, 1, 1, HEADERS.length);
  newRowRange.setFontFamily('Arial');
  newRowRange.setFontSize(10);
  newRowRange.setVerticalAlignment('middle');

  return { action: 'inserted', row: newRow, sessionId: sessionId };
}

/**
 * ==============================================================================
 * BUILD / REBUILD THE LIVE EXECUTIVE DASHBOARD IN GOOGLE SHEETS
 * ==============================================================================
 * Creates an executive-styled dashboard tab that recalculates LIVE via native formulas.
 */
function buildLiveDashboard() {
  // Purge any corrupted legacy or test rows first
  try {
    cleanCorruptedLogs();
  } catch (_) {}

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rawSheet = getTargetSheet();
  const rawName = rawSheet.getName();
  const rawRef = "'" + rawName.replace(/'/g, "''") + "'!";

  let dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(DASHBOARD_SHEET_NAME, 0);
  } else {
    // Ensure it is tab 1
    ss.setActiveSheet(dashSheet);
    ss.moveActiveSheet(1);
  }

  // Reset content & styles for clean build
  dashSheet.clear();
  dashSheet.clearFormats();

  // Set column widths
  dashSheet.setColumnWidth(1, 24);  // Margin Col A
  dashSheet.setColumnWidth(2, 175); // Col B
  dashSheet.setColumnWidth(3, 175); // Col C
  dashSheet.setColumnWidth(4, 175); // Col D
  dashSheet.setColumnWidth(5, 175); // Col E
  dashSheet.setColumnWidth(6, 175); // Col F
  dashSheet.setColumnWidth(7, 230); // Col G
  dashSheet.setColumnWidth(8, 230); // Col H

  // ── ROW 2: EXECUTIVE HEADER BANNER ──────────────────────────────────────────
  dashSheet.setRowHeight(2, 44);
  dashSheet.getRange('B2:H2').merge();
  const titleRange = dashSheet.getRange('B2');
  titleRange.setValue('⚡ GODZEMOHAN.IN — LIVE VISITOR ANALYTICS DASHBOARD');
  titleRange.setBackground('#0f172a');
  titleRange.setFontColor('#38bdf8');
  titleRange.setFontSize(14);
  titleRange.setFontWeight('bold');
  titleRange.setFontFamily('Arial');
  titleRange.setHorizontalAlignment('center');
  titleRange.setVerticalAlignment('middle');

  // ── ROW 3: STATUS BAR & AUTO-REFRESH CLOCK ──────────────────────────────────
  dashSheet.setRowHeight(3, 26);
  dashSheet.getRange('B3:E3').merge();
  const statusRange = dashSheet.getRange('B3');
  statusRange.setFormula('="🟢 TELEMETRY FEED: ONLINE | Total Verified Sessions: " & COUNTA(' + rawRef + 'A2:A)');
  statusRange.setBackground('#1e293b');
  statusRange.setFontColor('#10b981');
  statusRange.setFontSize(10);
  statusRange.setFontWeight('bold');
  statusRange.setFontFamily('Arial');
  statusRange.setVerticalAlignment('middle');

  dashSheet.getRange('F3:H3').merge();
  const refreshRange = dashSheet.getRange('F3');
  refreshRange.setFormula('="Last Recalculated: " & TEXT(NOW(), "YYYY-MM-DD HH:mm:ss") & " (Live Auto-Update)"');
  refreshRange.setBackground('#1e293b');
  refreshRange.setFontColor('#94a3b8');
  refreshRange.setFontSize(9);
  refreshRange.setFontFamily('Arial');
  refreshRange.setHorizontalAlignment('right');
  refreshRange.setVerticalAlignment('middle');

  // ── ROWS 5 & 6: 5 KPI METRIC SCORECARDS ─────────────────────────────────────
  dashSheet.setRowHeight(5, 22);
  dashSheet.setRowHeight(6, 42);

  const cards = [
    {
      col: 'B',
      label: '👥 TOTAL SESSIONS',
      formula: '=COUNTA(' + rawRef + 'A2:A)',
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd'
    },
    {
      col: 'C',
      label: '🌐 UNIQUE VISITORS',
      formula: '=COUNTUNIQUE(' + rawRef + 'B2:B)',
      color: '#0d9488',
      bg: '#f0fdfa',
      border: '#99f6e4'
    },
    {
      col: 'D',
      label: '📍 TOP COUNTRY',
      formula: '=IFERROR(INDEX(QUERY(' + rawRef + 'H2:H, "SELECT H, COUNT(H) WHERE H != \'\' AND H != \'Unknown\' AND H != \'Detecting...\' AND H != \'Geo Blocked\' GROUP BY H ORDER BY COUNT(H) DESC LIMIT 1 LABEL COUNT(H) \'\'"), 1, 1), "N/A")',
      color: '#4f46e5',
      bg: '#eef2ff',
      border: '#c7d2fe'
    },
    {
      col: 'E',
      label: '🏙️ TOP CITY',
      formula: '=IFERROR(INDEX(QUERY(' + rawRef + 'F2:F, "SELECT F, COUNT(F) WHERE F != \'\' AND F != \'Unknown\' AND F != \'Detecting...\' AND F != \'Geo Blocked\' GROUP BY F ORDER BY COUNT(F) DESC LIMIT 1 LABEL COUNT(F) \'\'"), 1, 1), "N/A")',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a'
    },
    {
      col: 'F',
      label: '📡 TOP ISP / NETWORK',
      formula: '=IFERROR(INDEX(QUERY(' + rawRef + 'C2:C, "SELECT C, COUNT(C) WHERE C != \'\' AND C != \'Unknown\' AND C != \'Detecting...\' GROUP BY C ORDER BY COUNT(C) DESC LIMIT 1 LABEL COUNT(C) \'\'"), 1, 1), "N/A")',
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0'
    }
  ];

  cards.forEach(function(card) {
    const lblCell = dashSheet.getRange(card.col + '5');
    lblCell.setValue(card.label);
    lblCell.setBackground(card.bg);
    lblCell.setFontColor(card.color);
    lblCell.setFontSize(9);
    lblCell.setFontWeight('bold');
    lblCell.setHorizontalAlignment('center');
    lblCell.setVerticalAlignment('bottom');

    const valCell = dashSheet.getRange(card.col + '6');
    valCell.setFormula(card.formula);
    valCell.setBackground(card.bg);
    valCell.setFontColor(card.color);
    valCell.setFontSize(17);
    valCell.setFontWeight('bold');
    valCell.setHorizontalAlignment('center');
    valCell.setVerticalAlignment('middle');

    dashSheet.getRange(card.col + '5:' + card.col + '6').setBorder(true, true, true, true, null, null, card.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  });

  // ── ROW 8: SECTION HEADERS (GEOGRAPHY & ISPs) ───────────────────────────────
  dashSheet.setRowHeight(8, 28);
  dashSheet.getRange('B8:D8').merge();
  const sec1 = dashSheet.getRange('B8');
  sec1.setValue('🌍 GEOGRAPHIC DISTRIBUTION (TOP CITIES & COUNTRIES)');
  sec1.setBackground('#1e293b');
  sec1.setFontColor('#f8fafc');
  sec1.setFontWeight('bold');
  sec1.setFontSize(10);
  sec1.setVerticalAlignment('middle');

  dashSheet.getRange('E8:H8').merge();
  const sec2 = dashSheet.getRange('E8');
  sec2.setValue('📡 INTERNET SERVICE PROVIDERS (ISPs) & TELECOM NETWORKS');
  sec2.setBackground('#1e293b');
  sec2.setFontColor('#f8fafc');
  sec2.setFontWeight('bold');
  sec2.setFontSize(10);
  sec2.setVerticalAlignment('middle');

  // ROW 9: Breakdown Queries
  dashSheet.getRange('B9').setFormula(
    '=IFERROR(QUERY(' + rawRef + 'F2:H, "SELECT H, F, COUNT(F) WHERE F != \'\' AND F != \'Unknown\' GROUP BY H, F ORDER BY COUNT(F) DESC LIMIT 8 LABEL H \'Country\', F \'City\', COUNT(F) \'Visitors\'"), {"Country", "City", "Visitors"; "No data yet", "—", 0})'
  );

  dashSheet.getRange('E9').setFormula(
    '=IFERROR(QUERY(' + rawRef + 'C2:C, "SELECT C, COUNT(C) WHERE C != \'\' AND C != \'Unknown\' GROUP BY C ORDER BY COUNT(C) DESC LIMIT 8 LABEL C \'Internet Service Provider (ISP)\', COUNT(C) \'Sessions\'"), {"Internet Service Provider (ISP)", "Sessions"; "No data yet", 0})'
  );

  // ── ROW 19: SECTION HEADERS (DEVICES & USER JOURNEYS) ───────────────────────
  dashSheet.setRowHeight(19, 28);
  dashSheet.getRange('B19:D19').merge();
  const sec3 = dashSheet.getRange('B19');
  sec3.setValue('📱 SCREEN RESOLUTIONS & CLIENT HARDWARE');
  sec3.setBackground('#1e293b');
  sec3.setFontColor('#f8fafc');
  sec3.setFontWeight('bold');
  sec3.setFontSize(10);
  sec3.setVerticalAlignment('middle');

  dashSheet.getRange('E19:H19').merge();
  const sec4 = dashSheet.getRange('E19');
  sec4.setValue('🧭 TOP NAVIGATION USER JOURNEYS & VISITED PAGES');
  sec4.setBackground('#1e293b');
  sec4.setFontColor('#f8fafc');
  sec4.setFontWeight('bold');
  sec4.setFontSize(10);
  sec4.setVerticalAlignment('middle');

  // ROW 20: Device & Journey Queries
  dashSheet.getRange('B20').setFormula(
    '=IFERROR(QUERY(' + rawRef + 'J2:J, "SELECT J, COUNT(J) WHERE J != \'\' AND J != \'Unknown\' GROUP BY J ORDER BY COUNT(J) DESC LIMIT 8 LABEL J \'Screen Resolution\', COUNT(J) \'Hits\'"), {"Screen Resolution", "Hits"; "No data yet", 0})'
  );

  dashSheet.getRange('E20').setFormula(
    '=IFERROR(QUERY(' + rawRef + 'L2:L, "SELECT L, COUNT(L) WHERE L != \'\' GROUP BY L ORDER BY COUNT(L) DESC LIMIT 8 LABEL L \'Journey Trail\', COUNT(L) \'Users\'"), {"Journey Trail", "Users"; "No data yet", 0})'
  );

  // ── ROW 30: SECTION HEADER (LIVE VISITOR STREAM) ────────────────────────────
  dashSheet.setRowHeight(30, 28);
  dashSheet.getRange('B30:H30').merge();
  const sec5 = dashSheet.getRange('B30');
  sec5.setValue('🔴 REAL-TIME VISITOR STREAM (LAST 15 ACTIVE SESSIONS)');
  sec5.setBackground('#0f172a');
  sec5.setFontColor('#38bdf8');
  sec5.setFontWeight('bold');
  sec5.setFontSize(10);
  sec5.setVerticalAlignment('middle');

  // ROW 31: Real-time query showing last 15 visitors
  dashSheet.getRange('B31').setFormula(
    '=IFERROR(QUERY(' + rawRef + 'A2:M, "SELECT A, B, C, F, H, K, L WHERE A != \'\' ORDER BY A DESC LIMIT 15 LABEL A \'Timestamp\', B \'IP Address\', C \'ISP\', F \'City\', H \'Country\', K \'Duration\', L \'Visited Pages\'"), {"Timestamp","IP Address","ISP","City","Country","Duration","Visited Pages"; "No logs yet","—","—","—","—","—","—"})'
  );

  return {
    status: 'success',
    message: 'Dashboard generated successfully',
    dashboardTab: DASHBOARD_SHEET_NAME,
    rawTab: rawName
  };
}

/**
 * Handles POST requests from godzemohan.in telemetry
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (_) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const result = saveOrUpdateSession(payload);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      result: result
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Handles GET requests:
 * 1. action=setupDashboard: Rebuilds the executive dashboard
 * 2. action=log or ip/sessionId: Saves telemetry beacon
 * 3. Default: Returns all telemetry rows for Admin Portal
 */
function doGet(e) {
  // 1. Dashboard build action
  if (e && e.parameter && (e.parameter.action === 'setupDashboard' || e.parameter.action === 'buildDashboard')) {
    try {
      const res = buildLiveDashboard();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        result: res
      }))
      .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 2. Sanitation Action: Purge corrupted legacy / dummy test logs
  if (e && e.parameter && (e.parameter.action === 'cleanLogs' || e.parameter.action === 'cleanCorruptedLogs')) {
    try {
      const res = cleanCorruptedLogs();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        result: res
      }))
      .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 3. Telemetry Beacon Logging
  if (e && e.parameter && (e.parameter.ip || e.parameter.sessionId || e.parameter.action === 'log')) {
    try {
      const result = saveOrUpdateSession(e.parameter);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        result: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 3. Admin Portal Log Retrieval
  try {
    const sheet = getTargetSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        count: 0,
        data: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    const values = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, HEADERS.length)).getValues();

    const records = values.map(function(row, idx) {
      return {
        id: idx + 1,
        timestamp: row[0] ? (row[0] instanceof Date ? row[0].toISOString() : String(row[0])) : '',
        ip: row[1] || 'Unknown',
        isp: row[2] || 'Unknown',
        latitude: row[3] || '—',
        longitude: row[4] || '—',
        city: row[5] || 'Unknown',
        region: row[6] || 'Unknown',
        country: row[7] || 'Unknown',
        userAgent: row[8] || 'Unknown',
        screenResolution: row[9] || 'Unknown',
        timeSpent: row[10] || '0s',
        pagesVisited: row[11] || 'Home',
        activityLog: row[12] || 'No actions recorded',
        sessionId: row[13] || ''
      };
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      count: records.length,
      data: records.reverse()
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Diagnostic test function
 */
function testSetupDashboard() {
  const res = buildLiveDashboard();
  Logger.log('Dashboard Build Result: ' + JSON.stringify(res));
}
