/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An interface that describes the date pipe configuration, which can be provided using the
 * `DATE_PIPE_DEFAULT_OPTIONS` token.
 *
 * @see `DATE_PIPE_DEFAULT_OPTIONS`
 *
 * @publicApi
 */
export interface DatePipeConfig {
  dateFormat: string;
  timezone: string;
}

/**
 * The default date format of Angular date pipe, which corresponds to the following format:
 * `'MMM d,y'` (e.g. `Jun 15, 2015`)
 */
export const DEFAULT_DATE_FORMAT = 'mediumDate';
