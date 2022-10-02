/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class SelectStylesMigrator extends StyleMigrator {
  component = 'select';

  deprecatedPrefixes = ['mat-select', 'mat-option'];

  mixinChanges = [
    {
      old: 'legacy-select-theme',
      new: ['select-theme'],
      checkForDuplicates: true,
    },
    {
      old: 'legacy-select-color',
      new: ['select-color'],
      checkForDuplicates: true,
    },
    {
      old: 'legacy-select-typography',
      new: ['select-typography'],
      checkForDuplicates: true,
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-select', new: '.mat-mdc-select'},
    {old: '.mat-select-panel', new: '.mat-mdc-select-panel'},
    {old: '.mat-option', new: '.mat-mdc-option'},
  ];
}
