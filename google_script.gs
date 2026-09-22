const SPREADSHEET_ID = '1UadaKFmXe8kQsQpwI46idakPhKzI2oiexcwvALitcoM';

// Extended Columns including ISP, Latitude & Longitude
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

function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();
  
  let sheet = null;
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === 0) {
      sheet = sheets[i];
      break;
    }
  }
  
  if (!sheet) {
    sheet = sheets[0];
  }

  // If sheet is empty or headers need upgrading
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

function findRowBySessionId(sheet, sessionId) {
  if (!sessionId) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  const sessionCol = HEADERS.indexOf('Session ID') + 1; // Column 14
  const searchDepth = Math.min(lastRow - 1, 150);
  const startRow = lastRow - searchDepth + 1;
  const sessionColumnVals = sheet.getRange(startRow, sessionCol, searchDepth, 1).getValues();

  for (let i = sessionColumnVals.length - 1; i >= 0; i--) {
    if (String(sessionColumnVals[i][0]).trim() === String(sessionId).trim()) {
      return startRow + i;
    }
  }
  return -1;
}

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

  // UPDATE EXISTING SESSION (Duration & Navigation Trail)
  if (targetRow > 1) {
    const timeSpentCol = HEADERS.indexOf('Time Spent') + 1; // Column 11
    sheet.getRange(targetRow, timeSpentCol, 1, 3).setValues([[
      timeSpent,
      pagesVisited,
      activityLog
    ]]);
    return { action: 'updated', row: targetRow, sessionId: sessionId };
  }

  // INSERT NEW VISITOR ROW
  const timestamp = data.timestamp || new Date().toISOString();
  const ipAddress = data.ip || data.ipAddress || data.query || 'Unknown';
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

function doGet(e) {
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
