/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class ListStylesMigrator extends StyleMigrator {
  component = 'list';

  deprecatedPrefixes = ['mat-list'];

  mixinChanges = [
    {
      old: 'legacy-list-theme',
      new: ['list-theme'],
    },
    {
      old: 'legacy-list-color',
      new: ['list-color'],
    },
    {
      old: 'legacy-list-typography',
      new: ['list-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: `.mat-list-base`, new: `.mat-mdc-list-base`},
    {old: `.mat-list`, new: `.mat-mdc-list`},
    {old: `.mat-list-avatar`, new: `.mat-mdc-list-item-avatar`},
    {old: `.mat-list-icon`, new: `.mat-mdc-list-item-icon`},
    {old: `.mat-subheader`, new: `.mat-mdc-subheader`},
    {old: `.mat-list-item`, new: `.mat-mdc-list-item`},
  ];
}
