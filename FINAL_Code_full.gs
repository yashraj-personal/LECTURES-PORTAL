/*******************************************************
 * IIT PATNA / LECTURE HUB
 * GOOGLE SHEETS + APPS SCRIPT BACKEND
 *
 * SHEETS CREATED:
 * MODULE 1
 * MODULE 2
 * MODULE 3
 * WORKSHOPS
 * OPTIONAL CLASSES
 * SETTINGS
 * VISITORS
 * WEBSITE LOG
 *******************************************************/


/***********************
 * CONFIGURATION
 ***********************/

// Names of the lecture sheets
const LECTURE_SHEETS = [
  'MODULE 1',
  'MODULE 2',
  'MODULE 3',
  'WORKSHOPS',
  'OPTIONAL CLASSES'
];

// Sheet headers
const LECTURE_HEADERS = [
  'Lecture Name',
  'Instructor Name',
  'Date',
  'Link',
  'Status'
];

// Quiz sheet (dynamic list, same pattern as lecture sheets)
const QUIZ_SHEET_NAME = 'QUIZZES';
const QUIZ_HEADERS = [
  'Quiz Name',
  'Link',
  'Status'
];

const SETTINGS_HEADERS = [
  'Setting',
  'Value'
];

const VISITOR_HEADERS = [
  'Date',
  'Total Visits',
  'Unique Visitors',
  'Successful Logins',
  'Visitor IDs (Internal)'
];

const LOG_HEADERS = [
  'Timestamp',
  'Event',
  'Page',
  'Status',
  'Visitor ID',
  'Details',
  'User Agent'
];


/***********************
 * FIRST-TIME SETUP
 ***********************/

function setupLecturesSystem() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create lecture sheets
  LECTURE_SHEETS.forEach(sheetName => {

    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    setupLectureSheet_(sheet);
  });


  // SETTINGS
  let settingsSheet = ss.getSheetByName('SETTINGS');

  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('SETTINGS');
  }

  setupSettingsSheet_(settingsSheet);


  // VISITORS
  let visitorsSheet = ss.getSheetByName('VISITORS');

  if (!visitorsSheet) {
    visitorsSheet = ss.insertSheet('VISITORS');
  }

  setupVisitorsSheet_(visitorsSheet);


  // WEBSITE LOG
  let logSheet = ss.getSheetByName('WEBSITE LOG');

  if (!logSheet) {
    logSheet = ss.insertSheet('WEBSITE LOG');
  }

  setupLogSheet_(logSheet);


  // QUIZZES
  let quizSheet = ss.getSheetByName(QUIZ_SHEET_NAME);

  if (!quizSheet) {
    quizSheet = ss.insertSheet(QUIZ_SHEET_NAME);
  }

  setupQuizSheet_(quizSheet);


  // Freeze first row
  ss.getSheets().forEach(sheet => {
    if (sheet.getLastColumn() > 0) {
      sheet.setFrozenRows(1);
    }
  });


  return {
    success: true,
    message: 'LECTURES system setup completed successfully.'
  };
}


/***********************
 * LECTURE SHEET SETUP
 ***********************/

function setupLectureSheet_(sheet) {

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LECTURE_HEADERS.length)
      .setValues([LECTURE_HEADERS]);
  } else {

    const existing = sheet
      .getRange(1, 1, 1, LECTURE_HEADERS.length)
      .getValues()[0];

    const empty = existing.every(value => value === '');

    if (empty) {
      sheet.getRange(1, 1, 1, LECTURE_HEADERS.length)
        .setValues([LECTURE_HEADERS]);
    }
  }

  formatHeader_(sheet, 5);

  sheet.setColumnWidth(1, 420);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 420);
  sheet.setColumnWidth(5, 130);

  // Optional dropdown for Status
  const maxRows = Math.max(sheet.getMaxRows(), 1000);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['LIVE', 'UPCOMING', 'NEW', 'ARCHIVED'],
      true
    )
    .setAllowInvalid(true)
    .build();

  sheet
    .getRange(2, 5, maxRows - 1, 1)
    .setDataValidation(statusRule);

}


/***********************
 * SETTINGS SHEET SETUP
 ***********************/

function setupSettingsSheet_(sheet) {

  if (sheet.getLastRow() === 0) {

    sheet.getRange(1, 1, 1, 2)
      .setValues([SETTINGS_HEADERS]);

    const defaultSettings = [
      ['SITE_NAME', 'IIT Patna Lecture Hub'],
      ['SITE_TAGLINE', 'All your lectures. One beautiful place.'],
      ['SITE_PASSWORD', 'NOTES'],
      ['ADMIN_PASSWORD', 'CHANGE_ADMIN_PASSWORD'],
      ['MEGA_NOTES_LINK', 'PASTE_MEGA_LINK_HERE'],
      ['MEGA_DECRYPTION_KEY', 'PASTE_MEGA_PASSWORD_HERE'],
      ['CONTACT_NAME', ''],
      ['CONTACT_EMAIL', ''],
      ['CONTACT_PHONE', ''],
      ['CONTACT_TELEGRAM', ''],
      ['UPI_PAYMENT_LINK', ''],
      ['ANNOUNCEMENT', 'Welcome to the Lecture Hub'],
      ['WEBSITE_VERSION', '1.0.0'],
      ['MAINTENANCE_MODE', 'FALSE']
    ];

    sheet
      .getRange(2, 1, defaultSettings.length, 2)
      .setValues(defaultSettings);
  }

  formatHeader_(sheet, 2);

  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 500);
}


/***********************
 * VISITOR SHEET SETUP
 ***********************/

function setupVisitorsSheet_(sheet) {

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, VISITOR_HEADERS.length)
      .setValues([VISITOR_HEADERS]);
  }

  formatHeader_(sheet, VISITOR_HEADERS.length);

  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 170);
  sheet.setColumnWidth(5, 400);

  // Hide the internal visitor IDs column
  sheet.hideColumns(5);
}


/***********************
 * LOG SHEET SETUP
 ***********************/

function setupLogSheet_(sheet) {

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, LOG_HEADERS.length)
      .setValues([LOG_HEADERS]);
  }

  formatHeader_(sheet, LOG_HEADERS.length);

  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 400);
  sheet.setColumnWidth(7, 250);
}


/***********************
 * QUIZ SHEET SETUP
 ***********************/

function setupQuizSheet_(sheet) {

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, QUIZ_HEADERS.length)
      .setValues([QUIZ_HEADERS]);
  }

  formatHeader_(sheet, QUIZ_HEADERS.length);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 420);
  sheet.setColumnWidth(3, 130);

  const maxRows = Math.max(sheet.getMaxRows(), 1000);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['LIVE', 'ARCHIVED'],
      true
    )
    .setAllowInvalid(true)
    .build();

  sheet
    .getRange(2, 3, maxRows - 1, 1)
    .setDataValidation(statusRule);
}


/***********************
 * HEADER FORMAT
 ***********************/

function formatHeader_(sheet, columns) {

  const range = sheet.getRange(1, 1, 1, columns);

  range
    .setFontWeight('bold')
    .setBackground('#111827')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  sheet.setFrozenRows(1);
}


/***********************
 * WEB APP ENTRY POINT
 ***********************/

function doGet(e) {

  try {

    const params = e && e.parameter
      ? e.parameter
      : {};

    const action = params.action || '';

    switch (action) {

      case 'lectures':
        return json_(getLectures_(params.module));

      case 'allLectures':
        return json_(getAllLectures_());

      case 'quizzes':
        return json_(getQuizzes_());

      case 'settings':
        return json_(getSettings_());

      case 'stats':
        return json_(getStats_());

      case 'logs':
        return json_(getLogs_(params.limit));

      case 'health':
        return json_({
          success: true,
          status: 'ONLINE',
          timestamp: new Date().toISOString()
        });

      default:
        return json_({
          success: false,
          error: 'Unknown action'
        });
    }

  } catch (error) {

    console.error(error);

    return json_({
      success: false,
      error: error.message
    });
  }
}


/***********************
 * POST API
 ***********************/

function doPost(e) {

  try {

    const body = JSON.parse(
      e.postData.contents || '{}'
    );

    const action = body.action || '';

    switch (action) {

      case 'login':
        return json_(authenticateSitePassword_(body.password));

      case 'adminLogin':
        return json_(authenticateAdminPassword_(body.password));

      case 'log':
        return json_(
          logWebsiteEvent_(
            body.event,
            body.page,
            body.status,
            body.visitorId,
            body.details,
            body.userAgent
          )
        );

      case 'visit':
        return json_(
          registerVisit_(
            body.visitorId,
            body.userAgent
          )
        );

      case 'updateSettings':
        return json_({
          success: false,
          error: 'EDIT IN GOOGLE SHEETS'
        });

      default:
        return json_({
          success: false,
          error: 'Unknown POST action'
        });
    }

  } catch (error) {

    console.error(error);

    return json_({
      success: false,
      error: error.message
    });
  }
}


/***********************
 * SITE PASSWORD
 ***********************/

function authenticateSitePassword_(password) {

  const settings = getSettingsMap_();

  const correctPassword =
    String(settings.SITE_PASSWORD || '');

  const suppliedPassword =
    String(password || '');

  const success =
    suppliedPassword === correctPassword;

  return {
    success: success
  };
}


/***********************
 * ADMIN PASSWORD
 ***********************/

function authenticateAdminPassword_(password) {

  const settings = getSettingsMap_();

  const correctPassword =
    String(settings.ADMIN_PASSWORD || '');

  const suppliedPassword =
    String(password || '');

  const success =
    suppliedPassword === correctPassword;

  return {
    success: success
  };
}


/***********************
 * GET LECTURES
 ***********************/

function getLectures_(moduleName) {

  if (!LECTURE_SHEETS.includes(moduleName)) {

    return {
      success: false,
      error: 'Invalid module'
    };
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(moduleName);

  if (!sheet) {

    return {
      success: false,
      error: 'Module sheet not found'
    };
  }

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {

    return {
      success: true,
      module: moduleName,
      lectures: []
    };
  }

  // getDisplayValues() intentionally converts dates to strings.
  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        5
      )
      .getDisplayValues();

  // The Link column needs special handling: if a cell was created with
  // "Insert > Link" or a =HYPERLINK() formula, getDisplayValues() only
  // returns the friendly label shown in the cell (e.g. "Watch Here"),
  // never the actual URL underneath. That mismatch is why lecture
  // cards render fine (name/instructor come through) but the link
  // never opens anything real. extractLinkColumn_ resolves the true
  // URL first, and only falls back to the plain display text.
  const links =
    extractLinkColumn_(sheet, 2, lastRow - 1, 4);

  const lectures = values
    .map((row, index) => ({
      lectureName: row[0],
      instructor: row[1],
      date: row[2],
      link: links[index] || '',
      status: row[4] || 'LIVE'
    }))
    .filter(row => row.lectureName && row.lectureName.trim() !== '')
    .map((row, index) => ({
      id: `${moduleName}-${index + 1}`,
      module: moduleName,
      ...row
    }));

  return {
    success: true,
    module: moduleName,
    lectures: lectures
  };
}


/***********************
 * LINK COLUMN EXTRACTION
 *
 * Resolves the real URL behind a cell, in order of priority:
 *   1. A rich-text hyperlink applied via "Insert > Link"
 *      (the cell can show any label, e.g. "Watch Here").
 *   2. A =HYPERLINK("url","label") formula.
 *   3. Plain text typed directly into the cell (a bare URL).
 * This is what makes "ACCESS LECTURE" actually navigate,
 * instead of silently doing nothing when a sheet cell uses a
 * friendly label instead of a raw pasted URL.
 ***********************/

function extractLinkColumn_(sheet, startRow, numRows, colIndex) {

  if (numRows <= 0) {
    return [];
  }

  const range =
    sheet.getRange(startRow, colIndex, numRows, 1);

  const richTextValues =
    range.getRichTextValues();

  const formulas =
    range.getFormulas();

  const displayValues =
    range.getDisplayValues();

  const links = [];

  for (let i = 0; i < numRows; i++) {

    let url = '';

    // 1) Rich-text hyperlink on the whole cell.
    const rich = richTextValues[i][0];

    if (rich && rich.getLinkUrl()) {
      url = rich.getLinkUrl();
    }

    // 1b) Rich-text hyperlink on part of the cell (partial-run links).
    if (!url && rich && typeof rich.getRuns === 'function') {

      const runs = rich.getRuns();

      for (let r = 0; r < runs.length; r++) {

        const runUrl = runs[r].getLinkUrl();

        if (runUrl) {
          url = runUrl;
          break;
        }
      }
    }

    // 2) =HYPERLINK("url", "label") formula.
    if (!url) {

      const formula = formulas[i][0];

      if (formula && /^=\s*HYPERLINK\(/i.test(formula)) {

        const match =
          formula.match(/HYPERLINK\(\s*"([^"]+)"/i);

        if (match) {
          url = match[1];
        }
      }
    }

    // 3) Fallback: whatever text is shown in the cell.
    if (!url) {
      url = String(displayValues[i][0] || '').trim();
    }

    links.push(url);
  }

  return links;
}


/***********************
 * GET QUIZZES
 ***********************/

function getQuizzes_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(QUIZ_SHEET_NAME);

  if (!sheet) {

    return {
      success: true,
      quizzes: []
    };
  }

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {

    return {
      success: true,
      quizzes: []
    };
  }

  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        QUIZ_HEADERS.length
      )
      .getDisplayValues();

  const quizzes = values
    .filter(row => row[0] && row[0].trim() !== '')
    .map(row => {

      return {
        name: row[0],
        link: row[1],
        status: row[2] || 'LIVE'
      };

    });

  return {
    success: true,
    quizzes: quizzes
  };
}


/***********************
 * GET ALL LECTURES
 ***********************/

function getAllLectures_() {

  const result = {};

  LECTURE_SHEETS.forEach(moduleName => {

    const data = getLectures_(moduleName);

    result[moduleName] =
      data.lectures || [];

  });

  return {
    success: true,
    modules: result
  };
}


/***********************
 * SETTINGS
 ***********************/

function getSettingsMap_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('SETTINGS');

  if (!sheet) {
    return {};
  }

  const lastRow =
    sheet.getLastRow();

  if (lastRow < 2) {
    return {};
  }

  const values =
    sheet
      .getRange(2, 1, lastRow - 1, 2)
      .getDisplayValues();

  const settings = {};

  values.forEach(row => {

    const key =
      String(row[0] || '').trim();

    const value =
      String(row[1] || '');

    if (key) {
      settings[key] = value;
    }
  });

  return settings;
}


function getSettings_() {

  const settings =
    getSettingsMap_();

  // Never expose passwords through the public static-site API.
  delete settings.SITE_PASSWORD;
  delete settings.ADMIN_PASSWORD;

  return {
    success: true,
    settings: settings
  };
}


/***********************
 * UPDATE SETTINGS
 ***********************/

function updateSettings_(updates) {

  if (!updates || typeof updates !== 'object') {

    return {
      success: false,
      error: 'No settings supplied'
    };
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('SETTINGS');

  if (!sheet) {

    return {
      success: false,
      error: 'SETTINGS sheet not found'
    };
  }

  const lastRow =
    Math.max(sheet.getLastRow(), 1);

  const rows =
    sheet
      .getRange(1, 1, lastRow, 2)
      .getValues();

  const rowMap = {};

  for (let i = 1; i < rows.length; i++) {

    const key =
      String(rows[i][0] || '').trim();

    if (key) {
      rowMap[key] = i + 1;
    }
  }

  Object.keys(updates).forEach(key => {

    const value =
      String(updates[key] ?? '');

    if (rowMap[key]) {

      sheet
        .getRange(rowMap[key], 2)
        .setValue(value);

    } else {

      sheet.appendRow([
        key,
        value
      ]);
    }

  });

  return {
    success: true,
    message: 'Settings updated'
  };
}


/***********************
 * WEBSITE LOG
 ***********************/

function logWebsiteEvent_(
  event,
  page,
  status,
  visitorId,
  details,
  userAgent
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('WEBSITE LOG');

  if (!sheet) {

    return {
      success: false,
      error: 'WEBSITE LOG sheet not found'
    };
  }

  sheet.appendRow([
    new Date(),
    event || '',
    page || '',
    status || '',
    visitorId || '',
    details || '',
    userAgent || ''
  ]);

  return {
    success: true
  };
}


/***********************
 * VISITOR COUNTER
 ***********************/

function registerVisit_(
  visitorId,
  userAgent
) {

  const lock =
    LockService.getScriptLock();

  lock.waitLock(10000);

  try {

    const ss =
      SpreadsheetApp.getActiveSpreadsheet();

    const sheet =
      ss.getSheetByName('VISITORS');

    if (!sheet) {

      return {
        success: false,
        error: 'VISITORS sheet not found'
      };
    }

    const today =
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );

    const lastRow =
      sheet.getLastRow();

    let rowNumber = -1;

    if (lastRow >= 2) {

      const dates =
        sheet
          .getRange(2, 1, lastRow - 1, 1)
          .getDisplayValues();

      for (let i = 0; i < dates.length; i++) {

        if (dates[i][0] === today) {

          rowNumber = i + 2;
          break;
        }
      }
    }

    let currentTotal = 0;
    let uniqueIds = [];
    let successfulLogins = 0;

    if (rowNumber === -1) {

      rowNumber =
        sheet.getLastRow() + 1;

    } else {

      const current =
        sheet
          .getRange(
            rowNumber,
            2,
            1,
            4
          )
          .getValues()[0];

      currentTotal =
        Number(current[0] || 0);

      const uniqueCell =
        sheet
          .getRange(rowNumber, 5)
          .getValue();

      if (uniqueCell) {

        try {

          uniqueIds =
            JSON.parse(uniqueCell);

        } catch (error) {

          uniqueIds = [];
        }
      }

      successfulLogins =
        Number(current[2] || 0);
    }


    currentTotal++;


    if (
      visitorId &&
      !uniqueIds.includes(visitorId)
    ) {
      uniqueIds.push(visitorId);
    }


    // Determine successful logins for today
    const logSheet =
      ss.getSheetByName('WEBSITE LOG');

    if (logSheet &&
        logSheet.getLastRow() >= 2) {

      const logs =
        logSheet
          .getRange(
            2,
            1,
            logSheet.getLastRow() - 1,
            LOG_HEADERS.length
          )
          .getValues();

      successfulLogins =
        logs.filter(row => {

          const timestamp =
            row[0];

          if (!(timestamp instanceof Date)) {
            return false;
          }

          const date =
            Utilities.formatDate(
              timestamp,
              Session.getScriptTimeZone(),
              'yyyy-MM-dd'
            );

          return (
            date === today &&
            row[1] === 'LOGIN_SUCCESS'
          );

        }).length;
    }


    sheet
      .getRange(
        rowNumber,
        1,
        1,
        5
      )
      .setValues([[
        today,
        currentTotal,
        uniqueIds.length,
        successfulLogins,
        JSON.stringify(uniqueIds)
      ]]);


    // Log the visit as well
    logWebsiteEvent_(
      'VISIT',
      '/',
      'SUCCESS',
      visitorId,
      'Visitor counter incremented',
      userAgent
    );


    return {
      success: true,
      date: today,
      totalVisits: currentTotal,
      uniqueVisitors: uniqueIds.length
    };

  } finally {

    lock.releaseLock();

  }
}


/***********************
 * STATISTICS
 ***********************/

function getStats_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const logSheet =
    ss.getSheetByName('WEBSITE LOG');

  const visitorSheet =
    ss.getSheetByName('VISITORS');

  let logs = [];

  if (
    logSheet &&
    logSheet.getLastRow() >= 2
  ) {

    logs =
      logSheet
        .getRange(
          2,
          1,
          logSheet.getLastRow() - 1,
          LOG_HEADERS.length
        )
        .getValues();
  }


  const today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );


  let todayVisits = 0;
  let totalVisits = 0;
  let totalSuccessfulLogins = 0;

  let eventCounts = {};
  let pageCounts = {};


  logs.forEach(row => {

    const timestamp = row[0];
    const event = row[1];
    const page = row[2];

    if (!(timestamp instanceof Date)) {
      return;
    }

    const date =
      Utilities.formatDate(
        timestamp,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );

    if (event === 'VISIT') {

      totalVisits++;

      if (date === today) {
        todayVisits++;
      }
    }


    if (event === 'LOGIN_SUCCESS') {
      totalSuccessfulLogins++;
    }


    if (event) {
      eventCounts[event] =
        (eventCounts[event] || 0) + 1;
    }


    if (page) {
      pageCounts[page] =
        (pageCounts[page] || 0) + 1;
    }

  });


  // Calculate today's unique visitor count
  let todayUniqueVisitors = 0;

  if (
    visitorSheet &&
    visitorSheet.getLastRow() >= 2
  ) {

    const rows =
      visitorSheet
        .getRange(
          2,
          1,
          visitorSheet.getLastRow() - 1,
          5
        )
        .getValues();

    const todayRow =
      rows.find(row => row[0] === today);

    if (todayRow) {
      todayUniqueVisitors =
        Number(todayRow[2] || 0);
    }
  }


  return {
    success: true,

    totalVisits: totalVisits,

    todayVisits: todayVisits,

    todayUniqueVisitors:
      todayUniqueVisitors,

    totalSuccessfulLogins:
      totalSuccessfulLogins,

    eventCounts: eventCounts,

    pageCounts: pageCounts
  };
}


/***********************
 * GET LOGS
 ***********************/

function getLogs_(limit) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('WEBSITE LOG');

  if (!sheet || sheet.getLastRow() < 2) {

    return {
      success: true,
      logs: []
    };
  }


  let max =
    Number(limit || 50);

  max =
    Math.min(
      Math.max(max, 1),
      500
    );


  const lastRow =
    sheet.getLastRow();

  const startRow =
    Math.max(
      2,
      lastRow - max + 1
    );

  const count =
    lastRow - startRow + 1;


  const values =
    sheet
      .getRange(
        startRow,
        1,
        count,
        LOG_HEADERS.length
      )
      .getDisplayValues();


  const logs =
    values.reverse().map(row => {

      return {

        timestamp: row[0],
        event: row[1],
        page: row[2],
        status: row[3],
        visitorId: row[4],
        details: row[5],
        userAgent: row[6]

      };

    });


  return {
    success: true,
    logs: logs
  };
}


/***********************
 * JSON RESPONSE
 ***********************/

function json_(data) {

  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
