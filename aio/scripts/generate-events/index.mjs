// Imports
import {writeFileSync} from 'node:fs';
import {get} from 'node:https';
import {dirname, resolve as resolvePath} from 'node:path';
import {argv} from 'node:process';
import {fileURLToPath} from 'node:url';


// Constants
const __dirname = dirname(fileURLToPath(import.meta.url));
// README: Keep in sync with `./apps-script-project/constants.js`.
const DB_BASE_URL = 'https://angular-io.firebaseio.com';
const EVENTS_FILE_PATH = resolvePath(__dirname, '../../content/marketing/events.json');

// Run
_main(argv.slice(2)).catch(err => {
  console.error(err);
  process.exit(1);
});

// Helpers
async function _main(args) {
  console.log(`\nGenerating events list from '${DB_BASE_URL}'.`);

  // Read arguments.
  const ignoreInvalidDates = args.includes('--ignore-invalid-dates');

  // Fetch events.
  const data = await fetchData(`${DB_BASE_URL}/events.json`);
  let events = [].concat(...Object.values(data ?? {}));

  // Validate event dates.
  const eventsWithInvalidDates = events.filter(eventHasInvalidDate);

  if (eventsWithInvalidDates.length > 0) {
    console.warn(
        `The following ${eventsWithInvalidDates.length} event(s) have invalid dates:` +
        eventsWithInvalidDates.map(evt => `\n  - ${JSON.stringify(evt)}`).join(''));

    if (ignoreInvalidDates) {
      console.warn('Events with invalid dates will be ignored.');

      const ignoredEvents = new Set(eventsWithInvalidDates);
      events = events.filter(evt => !ignoredEvents.has(evt));
    } else {
      console.error('Failed to generate events list.');
      process.exit(1);
    }
  }

  // Write events to file.
  writeFileSync(EVENTS_FILE_PATH, JSON.stringify(events, null, 2));

  console.log(`Successfully generated events list in '${EVENTS_FILE_PATH}'.\n`);
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    get(url, response => {
      let responseText = '';

      response
          .on('data', d => responseText += d)
          .on('end', () => resolve(JSON.parse(responseText)))
          .on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
}

function eventHasInvalidDate(event) {
  return !event.date || !event.date.start || isInvalidDate(event.date.start);
}

function isInRange(num, min, max) {
  return (min <= num) && (num <= max);
}

function isInvalidDate(date) {
  return !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !isInRange(Number(date.slice(0, 4)), 2000, 2100) ||
      !isInRange(Number(date.slice(5, 7)), 1, 12) ||
      !isInRange(Number(date.slice(8, 10)), 1, 31);
}
