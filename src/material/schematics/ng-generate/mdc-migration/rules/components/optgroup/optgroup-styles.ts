/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class OptgroupStylesMigrator extends StyleMigrator {
  component = 'optgroup';

  deprecatedPrefixes = ['mat-optgroup'];

  mixinChanges = [
    {
      old: 'legacy-optgroup-theme',
      new: ['optgroup-theme'],
    },
    {
      old: 'legacy-optgroup-color',
      new: ['optgroup-color'],
    },
    {
      old: 'legacy-optgroup-typography',
      new: ['optgroup-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {
      old: '.mat-optgroup',
      new: '.mat-mdc-optgroup',
    },
    {
      old: '.mat-optgroup-label',
      new: '.mat-mdc-optgroup-label',
    },
  ];
}
