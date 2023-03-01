/**
 * The base URL for the database.
 *
 * Used to persist data from the spreadsheet.
 */
// README: Keep in sync with `../index.mjs`.
const DB_BASE_URL = 'https://angular-io.firebaseio.com';

/**
 * The regex to match the name of sheets that contain team allocation data, which needs to be stored
 * in Firebase.
 *
 * All "Team Allocation" sheets must have names that match this pattern in order for them to be
 * taken into account.
 */
const TEAM_ALLOCATION_SHEET_NAME_RE = /^(\d\d\d\d) team allocation$/i;
