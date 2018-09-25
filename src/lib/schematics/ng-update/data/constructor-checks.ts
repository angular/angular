/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstructorChecksUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
export const constructorChecks: VersionChanges<ConstructorChecksUpgradeData> = {
  [TargetVersion.V7]: [
    {
      pr: 'https://github.com/angular/material2/pull/11706',
      changes: ['MatDrawerContent'],
    },
    {
      pr: 'https://github.com/angular/material2/pull/11706',
      changes: ['MatSidenavContent']
    }
  ],

  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/material2/pull/9190',
      changes: ['NativeDateAdapter'],
    },
    {
      pr: 'https://github.com/angular/material2/pull/10319',
      changes: ['MatAutocomplete'],
    },
    {
      pr: 'https://github.com/angular/material2/pull/10344',
      changes: ['MatTooltip'],
    },
    {
      pr: 'https://github.com/angular/material2/pull/10389',
      changes: ['MatIconRegistry'],
    },
    {
      pr: 'https://github.com/angular/material2/pull/9775',
      changes: ['MatCalendar'],
    },
  ]
};
