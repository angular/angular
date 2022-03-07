/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class TableStylesMigrator extends StyleMigrator {
  component = 'table';

  // There are no other table selectors available aside from the specified
  // changes below
  deprecatedPrefix = null;

  mixinChanges = [
    {
      old: 'table-theme',
      new: ['mdc-table-theme', 'mdc-table-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-table', new: '.mat-mdc-table'},
    {old: '.mat-table-sticky', new: '.mat-mdc-table-sticky'},
    {old: '.mat-header-cell', new: '.mat-mdc-header-cell'},
    {old: '.mat-footer-cell', new: '.mat-mdc-footer-cell'},
    {old: '.mat-cell', new: '.mat-mdc-cell'},
    {old: '.mat-header-row', new: '.mat-mdc-header-row'},
    {old: '.mat-footer-row', new: '.mat-mdc-footer-row'},
    {old: '.mat-row', new: '.mat-mdc-row'},
    {
      old: '.mat-table-sticky-border-elem-left',
      new: '.mat-mdc-table-sticky-border-elem-left',
    },
    {
      old: '.mat-table-sticky-border-elem-right',
      new: '.mat-mdc-table-sticky-border-elem-right',
    },
  ];
}
