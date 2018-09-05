/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
export const constructorChecks = [
  // https://github.com/angular/material2/pull/9190
  'NativeDateAdapter',

  // https://github.com/angular/material2/pull/10319
  'MatAutocomplete',

  // https://github.com/angular/material2/pull/10344
  'MatTooltip',

  // https://github.com/angular/material2/pull/10389
  'MatIconRegistry',

  // https://github.com/angular/material2/pull/9775
  'MatCalendar',
];
