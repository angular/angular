/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class ProgressBarStylesMigrator extends StyleMigrator {
  component = 'progress-bar';

  deprecatedPrefixes = ['mat-progress-bar'];

  mixinChanges = [
    {
      old: 'legacy-progress-bar-theme',
      new: ['progress-bar-theme', 'progress-bar-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-progress-bar', new: '.mat-mdc-progress-bar'}];
}
