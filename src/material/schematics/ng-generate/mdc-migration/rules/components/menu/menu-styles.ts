/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class MenuStylesMigrator extends StyleMigrator {
  component = 'menu';

  deprecatedPrefixes = ['mat-menu'];

  mixinChanges = [
    {
      old: 'legacy-menu-theme',
      new: ['menu-theme', 'menu-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-menu-item', new: '.mat-mdc-menu-item'},
    {old: '.mat-menu-trigger', new: '.mat-mdc-menu-trigger'},
    {old: '.mat-menu-panel', new: '.mat-mdc-menu-panel'},
    {old: '.mat-menu-content', new: '.mat-mdc-menu-content'},
    {
      old: '.mat-menu-item-submenu-trigger',
      new: '.mat-mdc-menu-item-submenu-trigger',
    },
  ];
}
