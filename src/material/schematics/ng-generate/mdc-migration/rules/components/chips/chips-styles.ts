/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class ChipsStylesMigrator extends StyleMigrator {
  component = 'chips';

  deprecatedPrefix = 'mat-chip';

  mixinChanges = [
    {
      old: 'chips-theme',
      new: ['mdc-chips-theme', 'mdc-chips-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-chip-set', new: '.mat-mdc-chip-set'},
    {old: '.mat-chip-grid', new: '.mat-mdc-chip-grid'},
    {old: '.mat-chip', new: '.mat-mdc-chip'},
    {old: '.mat-basic-chip', new: '.mat-mdc-basic-chip'},
    {old: '.mat-standard-chip', new: '.mat-mdc-standard-chip'},
    {old: '.mat-chip-input', new: '.mat-mdc-chip-input'},
  ];
}
