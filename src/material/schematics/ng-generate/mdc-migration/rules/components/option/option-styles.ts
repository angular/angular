/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class OptionStylesMigrator extends StyleMigrator {
  component = 'option';

  deprecatedPrefixes = ['mat-option'];

  mixinChanges = [
    {
      old: 'legacy-option-theme',
      new: ['option-theme'],
    },
    {
      old: 'legacy-option-color',
      new: ['option-color'],
    },
    {
      old: 'legacy-option-typography',
      new: ['option-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {
      old: '.mat-option',
      new: '.mat-mdc-option',
    },
    {
      old: '.mat-option-multiple',
      new: '.mat-mdc-option-multiple',
    },
    {
      old: '.mat-option-pseudo-checkbox',
      new: '.mat-mdc-option-pseudo-checkbox',
    },
    {
      old: '.mat-option-ripple',
      new: '.mat-mdc-option-ripple',
    },
  ];
}
