/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv} from 'yargs';

import {error} from '../../utils/console';

import {discoverNewConflictsForPr} from './index';

/** Builds the discover-new-conflicts pull request command. */
export function buildDiscoverNewConflictsCommand(yargs: Argv) {
  return yargs.option('date', {
    description: 'Only consider PRs updated since provided date',
    defaultDescription: '30 days ago',
    coerce: Date.parse,
    default: getThirtyDaysAgoDate,
  });
}

/** Handles the discover-new-conflicts pull request command. */
export async function handleDiscoverNewConflictsCommand({prNumber, date}: Arguments) {
  // If a provided date is not able to be parsed, yargs provides it as NaN.
  if (isNaN(date)) {
    error('Unable to parse the value provided via --date flag');
    process.exit(1);
  }
  await discoverNewConflictsForPr(prNumber, date);
}

/** Gets a date object 30 days ago from today. */
function getThirtyDaysAgoDate(): Date {
  const date = new Date();
  // Set the hours, minutes and seconds to 0 to only consider date.
  date.setHours(0, 0, 0, 0);
  // Set the date to 30 days in the past.
  date.setDate(date.getDate() - 30);
  return date;
}
