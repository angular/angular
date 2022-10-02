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
      old: 'legacy-checkbox-theme',
      new: ['checkbox-theme'],
    },
    {
      old: 'legacy-checkbox-color',
      new: ['checkbox-color'],
    },
    {
      old: 'legacy-checkbox-typography',
      new: ['checkbox-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-checkbox', new: '.mat-mdc-checkbox'}];
}
