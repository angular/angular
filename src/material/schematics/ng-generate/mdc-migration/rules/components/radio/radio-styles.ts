/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class RadioStylesMigrator extends StyleMigrator {
  component = 'radio';

  deprecatedPrefixes = ['mat-radio'];

  mixinChanges = [
    {
      old: 'legacy-radio-theme',
      new: ['radio-theme'],
    },
    {
      old: 'legacy-radio-color',
      new: ['radio-color'],
    },
    {
      old: 'legacy-radio-typography',
      new: ['radio-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-radio-group', new: '.mat-mdc-radio-group'},
    {old: '.mat-radio-button', new: '.mat-mdc-radio-button'},
  ];
}
