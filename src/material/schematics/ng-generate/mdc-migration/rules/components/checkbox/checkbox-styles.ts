/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class CheckboxStylesMigrator extends StyleMigrator {
  component = 'checkbox';

  deprecatedPrefixes = ['mat-checkbox'];

  mixinChanges = [
    {
      old: 'checkbox-theme',
      new: ['mdc-checkbox-theme', 'mdc-checkbox-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-checkbox', new: '.mat-mdc-checkbox'}];
}
