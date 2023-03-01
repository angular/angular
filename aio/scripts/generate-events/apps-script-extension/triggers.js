/**
 * Hook to handle the event of editing a cell in the spreadsheet and thus potentially modifying the
 * events data.
 *
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 *
 * @param {object} evt - An event object that contains information about the context that caused the
 *     trigger to fire.
 */
function onEdit(evt) {
  // Check whether one of the "Team Allocation" sheets was edited.
  const editedSheetName = evt.range.getSheet().getName();

  if (!TEAM_ALLOCATION_SHEET_NAME_RE.test(editedSheetName)) {
    return;
  }

  // Add the sheet to the list of edited sheets (if not already there).
  const editedSheets = Property.editedSheets.get() || [];

  if (!editedSheets.includes(editedSheetName)) {
    editedSheets.push(editedSheetName);
    editedSheets.sort();
    Property.editedSheets.set(editedSheets);
  }
}
