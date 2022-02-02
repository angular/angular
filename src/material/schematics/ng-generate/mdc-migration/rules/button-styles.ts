/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from './style-migrator';

export class ButtonStylesMigrator extends StyleMigrator {
  component = 'button';

  mixinChanges = [
    {
      old: 'button-theme',
      new: [
        'mdc-button-theme',
        'mdc-button-typography',
        'mdc-fab-theme',
        'mdc-fab-typography',
        'mdc-icon-theme',
        'mdc-icon-typography',
      ],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-button-base', new: '.mat-mdc-button-base'},
    {old: '.mat-button', new: '.mat-mdc-button'},
    {old: '.mat-raised-button', new: '.mat-mdc-raised-button'},
    {old: '.mat-icon-button', new: '.mat-mdc-icon-button'},
    {old: '.mat-fab', new: '.mat-mdc-fab'},
    {old: '.mat-mini-fab', new: '.mat-mdc-mini-fab'},
    {old: '.mat-stroked-button', new: '.mat-mdc-outlined-button'},
    {old: '.mat-flat-button', new: '.mat-mdc-flat-button'},
  ];
}
