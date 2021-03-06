/************************************************
 ************************************************
 ** Script Title: FeedbackTrackGoogleAppScript **
 ** Author: Hope Ogbons                        **
 ** Email: hopeogbons@gmail.com                **
 ** Phone: 08033644880                         **
 ************************************************
 ************************************************/

/**
 * Executes when the spreadsheet is loaded.
 */
function onOpen() {
  var menuEntries = [{ name: 'Generate Now!', functionName: 'generateTracker' }];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu('Feedback Tracker', menuEntries);
}

function onEdit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getActiveSheet();
  var r = s.getActiveRange();
  if (r.getRow() != 1 && r.getColumn() == 4 && feedbackStatuses().indexOf(s.getRange(r.getRow(), 4).getValue()) > -1 && divisions().indexOf(s.getName()) > -1) {
    var status = s.getRange(r.getRow(), 4).getValue();
    var rowRange = s.getRange(r.getRow(), 4);
    var color = feedbackStructure()[status] || '#FFFFFF';

    // Update cell colour
    rowRange.setBackgroundColor(color);

    // Extract vital details
    var incomingTabName = s.getName();
    var incomingApplicant = s.getRange(r.getRow(), 2).getValue();
    var incomingDate = s.getRange(r.getRow(), 6).getValue();
    var incomingStatus = s.getRange(r.getRow(), 4).getValue();

    // Save details to Status Sheet tab
    var objStatusSheet = ss.getSheetByName('Status Sheet');
    var arrStatusData = (objStatusSheet.getLastRow() > 0) ? objStatusSheet.getRange(1, 1, objStatusSheet.getLastRow(), objStatusSheet.getLastColumn()).getValues() : [];

    var hasRecord = false;
    for (var x in arrStatusData) {
      var arrStatus = arrStatusData[x];

      var existingTabName = arrStatus[0];
      var existingApplicant = arrStatus[1];
      var existingDate = arrStatus[2];
      var existingStatus = arrStatus[3];

      if (
        incomingTabName === existingTabName &&
        incomingApplicant === existingApplicant &&
        stringifyDate(incomingDate) === stringifyDate(existingDate)
      ) {
        var hasRecord = true;
        objStatusSheet.getRange(parseInt(x) + 1, 4).setValue(incomingStatus);
      }
    }
    if (!hasRecord) {
      var nextRow = objStatusSheet.getLastRow() + 1;
      objStatusSheet.getRange(nextRow, 1).setValue(incomingTabName);
      objStatusSheet.getRange(nextRow, 2).setValue(incomingApplicant);
      objStatusSheet.getRange(nextRow, 3).setValue(incomingDate);
      objStatusSheet.getRange(nextRow, 4).setValue(incomingStatus);
    }
    SpreadsheetApp.flush();
  }
}

function stringifyDate(date, format) {
  format = format || 'dd-MM-yyyy';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
}

/**
 * Initializes the destination spreadsheet.
 */
function generateTracker() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = activeSpreadsheet.getSheetByName('Master Sheet');
  masterSheet.clear();
  SpreadsheetApp.flush();
  var selectedYear = '2018';
  var masterSheetCellA1 = masterSheet.getRange("A1");
  var masterSheetFormula = 'filter(importRange("' + remoteSpreadsheet().id + '", "' + remoteSpreadsheet().sheetName + '!$A2:$W"),importRange("' + remoteSpreadsheet().id + '", "' + remoteSpreadsheet().sheetName + '!$C$2:$C")>=date(' + selectedYear + ',1,1),importRange("' + remoteSpreadsheet().id + '", "' + remoteSpreadsheet().sheetName + '!$C$2:$C")<=date(' + selectedYear + ',12,31))';
  masterSheetCellA1.setFormula(masterSheetFormula);
  var objSheetContent = getContent(masterSheet);
  divisions().map(function (division) {
    var activeDivision = loadSheet(division);
    var adjustedColumnWidth = adjustColumnWidth(activeDivision);
    var x = 1;
    var y = 1;
    departments(division).map(function (department) {
      if (objSheetContent[department]) {
        Object.keys(objSheetContent[department]).map(function (position) {
          if (objSheetContent[department] && objSheetContent[department][position]) {
            var objSheet = createBody(division, styleHeader(adjustedColumnWidth, createHeader(position), x, y), objSheetContent[department][position], y + 2);
            y = objSheet.bodyCount + y + 2;
          }
        });
      }
      SpreadsheetApp.flush();
    });
  });

  activeSpreadsheet.toast('Successful! Feedback Tracker has been generated. Thank you.');
}

/**
 * Returns an object of the source spreadsheet.
 */
function localSpreadsheet() {
  return ({
    sheetName: "Master Sheet",
    range: "$A:$W",
    header: 0
  });
}

/**
 * Returns an object of the source spreadsheet.
 */
function remoteSpreadsheet() {
  return ({
    id: "xxxXXXXXXXXxxxXXXxxxXXXXXxxxxxxxxxxxxxxXXXXXXXXXXXX",
    sheetName: "Form Response 4",
    range: "$A:$W",
    header: 1
  });
}

/**
 * Returns an object of the company structure.
 */
function structure() {
  return (
    {
      'Administration': ['Finance', 'Human Resources', 'Grant & Contracts'],
      'GHI': ['IT Engineering & Operations', 'Geographic Information System', 'Product Management', 'Software & Solutions Development'],
      'Program and Impact': ['Monitoring, Evaluation & Research', 'Communications', 'Project Management', 'Laboratory Management', 'Program and Impact', 'eHA Clinic'],
      'Programs Operations': ['Operations', 'Field Operations', 'Operations Admin'],
      'Francophone Countries': ['Chad', 'Niger', 'Cameroon', 'South Sudan']
    }
  )
}

function styleHeader(sheet, header, x, y) {
  var z = y + 1;
  var hexColor = '#0090FC';

  sheet.getRange(y, x, header.length, header[0].length).setValues(header);

  sheet.getRange(["$B$", y].join('')).setBackground(hexColor).setFontColor('#FFFFFF').setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(["$D$", y].join('')).setBackground(hexColor).setFontColor('#FFFFFF').setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(["$F$", y, ":$H$", y].join('')).mergeAcross().setFontColor('#FFFFFF').setBackground(hexColor).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(["$J$", y, ":$L$", y].join('')).mergeAcross().setFontColor('#FFFFFF').setBackground(hexColor).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(["$N$", y, ":$P$", y].join('')).mergeAcross().setFontColor('#FFFFFF').setBackground(hexColor).setFontWeight("bold").setHorizontalAlignment("center");

  sheet.getRange(["$A$", y].join(''));
  sheet.getRange(["$C$", y].join(''));
  sheet.getRange(["$E$", y].join(''));
  sheet.getRange(["$I$", y].join(''));
  sheet.getRange(["$M$", y].join(''));

  sheet.getRange(["$A$", z, ":$P$", z].join('')).setFontWeight("bold").setHorizontalAlignment("center");

  return sheet;
}

function getContent(sheet) {
  // Init.
  var doc = {};
  var sheetContent = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());

  // Dynamic sorting
  sheetContent.map(function (record) {
    Logger.log('\nDepartment: ' + record[5] + '\nPosition: ' + record[4] + '\nInterviewee: ' + record[3] + '\nDate: ' + record[2] + '\nInterviewer: ' + record[22]);
    // Init.
    var department = record && record[5] ? record[5] : '';
    var position = record && record[4] ? record[4].trim() : '';
    var interviewee = record && record[3] ? record[3].trim() : '';
    var date = record && record[2] ? record[2] : '';
    var interviewer = record && record[22] ? record[22].trim() : '';
    var comment1 = record && record[19] ? record[19].trim() : '';
    var comment2 = record && record[21] ? record[21].trim() : '';
    var summary = record && record[20] ? record[20].trim() : '';

    if (doc[department] == undefined) doc[department] = {};
    if (doc[department][position] == undefined) doc[department][position] = [];
    doc[department][position].push([interviewee, date, interviewer, comment1, comment2, summary]);
  })

  // Return
  return doc;
}

function createHeader(title) {
  var cells = new Array(2);

  for (var r = 0; r < 2; r++) {
    cells[r] = new Array(16);
    for (var c = 0; c < 16; c++) {
      cells[r][c] = '';
    }
  }

  cells[0][1] = 'Profile';
  cells[0][3] = 'Current Update';
  cells[0][5] = 'First Stage Interview';
  cells[0][9] = 'Second Stage Interview';
  cells[0][13] = 'Final Stage Interview';
  cells[1][0] = 'S/N';
  cells[1][1] = title;
  cells[1][5] = 'Date';
  cells[1][6] = 'Interviewer';
  cells[1][7] = 'Comment';
  cells[1][9] = 'Date';
  cells[1][10] = 'Interviewer';
  cells[1][11] = 'Comment';
  cells[1][13] = 'Date';
  cells[1][14] = 'Interviewer';
  cells[1][15] = 'Comment';

  return cells;
}

function createBody(division, sheet, records, y) {
  var n = 1;
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(feedbackStatuses(), true).build();

  records = removeDuplicates(records);
  records.map(function (record) {
    var cells = new Array(1);
    cells[0] = new Array(16);

    var incomingTabName = division;
    var incomingApplicant = record[0];
    var incomingDate = record[1];
    var incomingStatus = '';

    // Save details to Status Sheet tab
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var objStatusSheet = ss.getSheetByName('Status Sheet');
    var arrStatusData = (objStatusSheet.getLastRow() > 0) ? objStatusSheet.getRange(1, 1, objStatusSheet.getLastRow(), objStatusSheet.getLastColumn()).getValues() : [];

    for (var x in arrStatusData) {
      var arrStatus = arrStatusData[x];

      var existingTabName = arrStatus[0];
      var existingApplicant = arrStatus[1];
      var existingDate = arrStatus[2];
      var existingStatus = arrStatus[3];

      if (
        incomingTabName === existingTabName &&
        incomingApplicant === existingApplicant &&
        stringifyDate(incomingDate) === stringifyDate(existingDate)
      ) {
        incomingStatus = existingStatus;
      }
    }

    cells[0][0] = n;
    cells[0][1] = incomingApplicant;
    cells[0][2] = '';
    cells[0][3] = incomingStatus;
    cells[0][4] = '';
    cells[0][5] = incomingDate;
    cells[0][6] = record[2];
    cells[0][7] = record[3];
    cells[0][8] = '';
    cells[0][9] = record[4];
    cells[0][10] = record[5];
    cells[0][11] = record[6];
    cells[0][12] = '';
    cells[0][13] = record[7];
    cells[0][14] = record[8];
    cells[0][15] = record[9];

    sheet.getRange(y, 1, cells.length, cells[0].length).setValues(cells);
    sheet.getRange(["$D$", y].join('')).setBackgroundColor(feedbackStructure()[incomingStatus] || '#FFFFFF').setDataValidation(rule);

    // Style sheet
    sheet = styleBody(sheet, y);
    n++
    y++
  });
  return { sheet: sheet, bodyCount: records.length };
}

function feedbackStructure() {
  return ({
    'Keep Warm': '#F4AF60',
    'Not Fit': '#D24B19',
    'Recommended': '#AFD3FF',
    'Successful': "#98FB98"
  });
}

function feedbackStatuses() {
  return Object.keys(feedbackStructure());
}

function removeDuplicates(records) {
  var newSheet = [];
  var oldSheet = records;

  for (x in oldSheet) {
    var duplicate = false;

    for (y in newSheet) {

      if (oldSheet[x][0] == newSheet[y][0]) {
        duplicate = true;

        var incomingDate = (oldSheet[x][1]) ? Utilities.formatDate(oldSheet[x][1], "GMT+1", "dd/MM/yyyy") : '';
        var stageOneDate = (newSheet[y][1]) ? Utilities.formatDate(newSheet[y][1], "GMT+1", "dd/MM/yyyy") : '';
        var stageTwoDate = (newSheet[y][4]) ? Utilities.formatDate(newSheet[y][4], "GMT+1", "dd/MM/yyyy") : '';
        var stageThreeDate = (newSheet[y][7]) ? Utilities.formatDate(newSheet[y][7], "GMT+1", "dd/MM/yyyy") : '';

        // Append to Stage 1
        if (incomingDate == stageOneDate) {
          newSheet[y][2] = [newSheet[y][2], oldSheet[x][2]].join(' / ');
          newSheet[y][3] = [newSheet[y][3], formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2])].join('\n\n');
        }
        // Append to Stage 2
        else if (incomingDate == stageTwoDate) {
          newSheet[y][5] = [newSheet[y][5], oldSheet[x][2]].join(' / ');
          newSheet[y][6] = [newSheet[y][6], formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2])].join('\n\n');
        }
        // Append to Stage 3
        else if (incomingDate == stageThreeDate) {
          newSheet[y][8] = [newSheet[y][8], oldSheet[x][2]].join(' / ');
          newSheet[y][9] = [newSheet[y][9], formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2])].join('\n\n');
        }
        // Fresh entry to Stage 2
        else {
          if (newSheet[y][4] == '') {
            newSheet[y][4] = oldSheet[x][1];
            newSheet[y][5] = oldSheet[x][2];
            newSheet[y][6] = formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2]);
          }
          else if (newSheet[y][7] == '') {
            newSheet[y][7] = oldSheet[x][1];
            newSheet[y][8] = oldSheet[x][2];
            newSheet[y][9] = formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2]);
          }
          else {
            // There is no Stage 4. If you want to add it, make the staging template dynamic
          }
        }

      }

    }

    if (!duplicate) {
      newSheet.push([oldSheet[x][0], oldSheet[x][1], oldSheet[x][2], formatComment(oldSheet[x][5], oldSheet[x][3], oldSheet[x][4], oldSheet[x][2]), '', '', '', '', '', '']);
    }

  }

  function formatComment(summary, comment1, comment2, author) {
    return [[summary, ': ', comment1].join(''), comment2, ['- ', author].join('')].join('\n');
  }

  return newSheet;
}

function styleBody(sheet, y) {
  sheet.getRange(["$H$1:$H$", y].join('')).setWrap(true);
  sheet.getRange(["$L$1:$H$", y].join('')).setWrap(true);
  sheet.getRange(["$P$1:$H$", y].join('')).setWrap(true);

  return sheet;
}

function adjustColumnWidth(sheet) {
  // Vertical Separator
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(3, 30);
  sheet.setColumnWidth(5, 30);
  sheet.setColumnWidth(9, 30);
  sheet.setColumnWidth(13, 30);

  // Profile Column
  sheet.setColumnWidth(2, 310);

  // Current Update
  sheet.setColumnWidth(4, 110);

  // First Stage
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 250);
  sheet.setColumnWidth(8, 560);

  // Second Stage
  sheet.setColumnWidth(10, 110);
  sheet.setColumnWidth(11, 250);
  sheet.setColumnWidth(12, 560);

  // Final Stage
  sheet.setColumnWidth(14, 110);
  sheet.setColumnWidth(15, 250);
  sheet.setColumnWidth(16, 560);

  return sheet
}

/**
 * Returns an array of the groups within a company.
 */
function divisions() {
  return Object.keys(structure());
}

/**
 * Returns an array of the departments within a company.
 */
function departments(division) {
  return structure()[division];
}

/**
 * Returns an array of the positions within a company.
 */
function positions(division, department) {
  return structure()[division][department];
}

/**
 * Returns a query string.
 */
function sqlQuery(select, where, orderBy) {
  var query = '';
  query += (select) ? 'SELECT ' + select : '';
  query += (where) ? ' WHERE ' + where : '';
  query += (orderBy) ? ' ORDER BY ' + orderBy : '';
  return query;
}

function importLocalQuery() {
  return ['{', "query(", localSpreadsheet().sheetName, "!", localSpreadsheet().range, ",\"", sqlQuery('Col2, Col3, Col4, Col5, Col6, Col20, Col21, Col22, Col23', '', ''), "\",", localSpreadsheet().header, ")", '}'].join('');
}

function importRemoteQuery() {
  return ['{', "query(importRange(\"", remoteSpreadsheet().id, "\", \"", remoteSpreadsheet().sheetName, "!", remoteSpreadsheet().range, "\"), \"", sqlQuery('Col2, Col3, Col4, Col5, Col6, Col20, Col21, Col22, Col23', '', ''), "\",", remoteSpreadsheet().header, ")", '}'].join('');
}

function loadSheet(name) {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSpreadsheet.getSheetByName(name);
  if (sheet == null) {
    var sheet = activeSpreadsheet.insertSheet();
    sheet.setName(name);
  }
  sheet.clear();
  SpreadsheetApp.flush();
  return sheet;
}