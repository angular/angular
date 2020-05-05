/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as yargs from 'yargs';
import {discoverNewConflictsForPr} from './discover-new-conflicts';

/** A Date object 30 days ago. */
const THIRTY_DAYS_AGO = (() => {
  const date = new Date();
  // Set the hours, minutes and seconds to 0 to only consider date.
  date.setHours(0, 0, 0, 0);
  // Set the date to 30 days in the past.
  date.setDate(date.getDate() - 30);
  return date;
})();

/** Build the parser for the pr commands. */
export function buildPrParser(localYargs: yargs.Argv) {
  return localYargs.help().strict().demandCommand().command(
      'discover-new-conflicts <pr>',
      'Check if a pending PR causes new conflicts for other pending PRs',
      args => {
        return args.option('date', {
          description: 'Only consider PRs updated since provided date',
          defaultDescription: '30 days ago',
          coerce: Date.parse,
          default: THIRTY_DAYS_AGO,
        });
      },
      ({pr, date}) => {
        // If a provided date is not able to be parsed, yargs provides it as NaN.
        if (isNaN(date)) {
          console.error('Unable to parse the value provided via --date flag');
          process.exit(1);
        }
        discoverNewConflictsForPr(pr, date);
      });
}

if (require.main === module) {
  buildPrParser(yargs).parse();
}
