/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class DialogStylesMigrator extends StyleMigrator {
  component = 'dialog';

  deprecatedPrefixes = ['mat-dialog'];

  mixinChanges = [
    {
      old: 'legacy-dialog-theme',
      new: ['dialog-theme', 'dialog-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-dialog', new: '.mat-mdc-dialog'},
    {old: '.mat-dialog-title', new: '.mat-mdc-dialog-title'},
    {old: '.mat-dialog-container', new: '.mat-mdc-dialog-container'},
    {old: '.mat-dialog-content', new: '.mat-mdc-dialog-content'},
    {old: '.mat-dialog-actions', new: '.mat-mdc-dialog-actions'},
  ];
}
