/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class SnackBarMigrator extends StyleMigrator {
  component = 'snack-bar';

  // There are no other selectors with the 'mat-snack-bar' prefix available
  // aside from the specified changes below
  deprecatedPrefixes = [];

  mixinChanges = [
    {
      old: 'legacy-snack-bar-theme',
      new: ['snack-bar-theme', 'button-theme'],
      checkForDuplicates: true,
    },
    {
      old: 'legacy-snack-bar-color',
      new: ['snack-bar-color', 'button-color'],
      checkForDuplicates: true,
    },
    {
      old: 'legacy-snack-bar-typography',
      new: ['snack-bar-typography', 'button-typography'],
      checkForDuplicates: true,
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-snack-bar-container', new: '.mat-mdc-snack-bar-container'},
    {old: '.mat-snack-bar-handset', new: '.mat-mdc-snack-bar-handset'},
    {old: '.mat-simple-snackbar', new: '.mat-mdc-simple-snack-bar'},
  ];
}
