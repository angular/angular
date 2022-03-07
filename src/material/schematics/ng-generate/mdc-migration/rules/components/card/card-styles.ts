/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class CardStylesMigrator extends StyleMigrator {
  component = 'card';

  deprecatedPrefix = 'mat-card';

  mixinChanges = [
    {
      old: 'card-theme',
      new: ['mdc-card-theme', 'mdc-card-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-card', new: '.mat-mdc-card'},
    {old: `.mat-card-title`, new: `.mat-mdc-card-title`},
    {old: `.mat-card-title-group`, new: `.mat-mdc-card-title-group`},
    {old: `.mat-card-content`, new: `.mat-mdc-card-content`},
    {old: `.mat-card-subtitle`, new: `.mat-mdc-card-subtitle`},
    {old: `.mat-card-actions`, new: `.mat-mdc-card-actions`},
    {old: `.mat-card-header`, new: `.mat-mdc-card-header`},
    {old: `.mat-card-footer`, new: `.mat-mdc-card-footer`},
    {old: `.mat-card-image`, new: `.mat-mdc-card-image`},
    {old: `.mat-card-avatar`, new: `.mat-mdc-card-avatar`},
    {old: `.mat-card-sm-image`, new: `.mat-mdc-card-sm-image`},
    {old: `.mat-card-md-image`, new: `.mat-mdc-card-md-image`},
    {old: `.mat-card-lg-image`, new: `.mat-mdc-card-lg-image`},
    {old: `.mat-card-xl-image`, new: `.mat-mdc-card-xl-image`},
  ];
}
