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
      old: 'select-theme',
      new: ['mdc-select-theme', 'mdc-select-typography', 'mdc-core-theme', 'mdc-core-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-select', new: '.mat-mdc-select'},
    {old: '.mat-select-panel', new: '.mat-mdc-select-panel'},
    {old: '.mat-option', new: '.mat-mdc-option'},
  ];
}
