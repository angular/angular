/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class ProgressSpinnerStylesMigrator extends StyleMigrator {
  component = 'progress-spinner';

  // There are no other progress spinner selectors available aside from the
  // specified changes below
  deprecatedPrefixes = [];

  mixinChanges = [
    {
      old: 'legacy-progress-spinner-theme',
      new: ['progress-spinner-theme', 'progress-spinner-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-progress-spinner', new: '.mat-mdc-progress-spinner'},
    {old: '.mat-spinner', new: '.mat-mdc-progress-spinner'},
  ];
}
