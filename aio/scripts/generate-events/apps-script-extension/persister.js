/**
 * Helper function to be invoked by a manually set-up, time-based trigger in order to update the
 * data on Firebase.
 */
function updateEventsOnFirebase() {
  const persister = new Persister();
  persister.updateDb();
}

/**
 * Helper class to encapsulate logic about persisting events changes in the spreadsheet to the
 * database (currently Firebase Realtime Database).
 */
class Persister {
  /**
   * Update the database with the latest data from edited sheets.
   *
   * If no sheets have been edited, this is a no-op.
   */
  updateDb() {
    this._log('Updating database...');

    // Get the data for each edited sheet.
    const data = this._getDataForEditedSheets();

    // If no sheets have been edited, there is nothing to do.
    if (data.length === 0) {
      this._log('No sheets edited. Exiting...');
      return;
    }

    // Update the database.
    const partialEvents = data.reduce((acc, dataForSheet) => {
      acc[dataForSheet.year] = dataForSheet.events;
      return acc;
    }, {});

    const res = UrlFetchApp.fetch(`${DB_BASE_URL}/events.json?print=silent`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ScriptApp.getOAuthToken()}`,
        'Content-type': 'application/json',
      },
      payload: JSON.stringify(partialEvents),
    });

    this._log(`Database updated: ${res.getResponseCode()} - ${res.getContentText()}`);
  }

  _getDataForEditedSheets() {
    // Get edited sheets that need processing.
    const editedSheets = Property.editedSheets.get() || [];
    this._log(`Edited sheets (${editedSheets.length}): ${editedSheets.join(', ') || '-'}`);

    // Delete the corresponding property, indicating that no processing is pending.
    Property.editedSheets.delete();

    // Get the events data for edited sheets.
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return editedSheets.map(name => this._getDataForSheet(ss.getSheetByName(name)));
  }

  _getDataForSheet(sheet) {
    const year = TEAM_ALLOCATION_SHEET_NAME_RE.exec(sheet.getName())[1];

    // Get event dates per cell index.
    // Dates display value is expected to be in the format `M/D`. For example: `5/15`
    const startDatesRange = sheet.getRange('1:1');
    const startDates = startDatesRange.
      getDisplayValues()[0].
      map((x, i) => ({
        index: i,
        value: x,
      })).
      filter(x => x.value !== '').
      map(x => ({
        index: x.index,
        date: `${year}-${x.value.split('/').map(p => p.padStart(2, '0')).join('-')}`,
      }));

    // Get other event info (name, url) per cell index and merge with dates.
    const namesRange = sheet.getRange('2:2');
    const events = namesRange.
      getRichTextValues()[0].
      map((x, i) => ({
        index: i,
        value: {
          text: x.getText(),
          url: x.getLinkUrl() || undefined,
        },
      })).
      filter(x => !/^(?:total)?$/i.test(x.value.text)).
      map(x => ({
        name: x.value.text,
        linkUrl: x.value.url,
        date: {
          start: (startDates.find(y => y.index === x.index) || {}).date,
        },
      }));

    return {year, events};
  }

  _log(msg) {
    Logger.log(`[Persister] ${msg}`);
  }
}
