/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class TabsStylesMigrator extends StyleMigrator {
  component = 'tabs';

  deprecatedPrefixes = ['mat-tabs', 'mat-tab'];

  mixinChanges = [
    {
      old: 'legacy-tabs-theme',
      new: ['tabs-theme', 'tabs-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-tab', new: '.mat-mdc-tab'},
    {old: '.mat-tab-body', new: '.mat-mdc-tab-body'},
    {old: '.mat-tab-group', new: '.mat-mdc-tab-group'},
    {old: '.mat-tab-header', new: '.mat-mdc-tab-header'},
    {old: '.mat-tab-nav-bar', new: '.mat-mdc-tab-nav-bar'},
    {old: '.mat-tab-link', new: '.mat-mdc-tab-link'},
  ];
}
