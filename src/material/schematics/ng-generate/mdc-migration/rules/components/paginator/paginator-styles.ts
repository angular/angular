/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class PaginatorStylesMigrator extends StyleMigrator {
  component = 'paginator';

  deprecatedPrefixes = ['mat-paginator'];

  mixinChanges = [
    {
      old: 'legacy-paginator-theme',
      new: ['paginator-theme', 'paginator-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-paginator', new: '.mat-mdc-paginator'},
    {old: '.mat-paginator-outer-container', new: '.mat-mdc-paginator-outer-container'},
    {old: '.mat-paginator-container', new: '.mat-mdc-paginator-container'},
    {old: '.mat-paginator-page-size', new: '.mat-mdc-paginator-page-size'},
    {old: '.mat-paginator-page-size-label', new: '.mat-mdc-paginator-page-size-label'},
    {old: '.mat-paginator-page-size-value', new: '.mat-mdc-paginator-page-size-value'},
    {old: '.mat-paginator-range-actions', new: '.mat-mdc-paginator-range-actions'},
    {old: '.mat-paginator-range-label', new: '.mat-mdc-paginator-range-label'},
    {old: '.mat-paginator-navigation-first', new: '.mat-mdc-paginator-navigation-first'},
    {old: '.mat-paginator-navigation-previous', new: '.mat-mdc-paginator-navigation-previous'},
    {old: '.mat-paginator-navigation-next', new: '.mat-mdc-paginator-navigation-next'},
    {old: '.mat-paginator-navigation-last', new: '.mat-mdc-paginator-navigation-last'},
    {old: '.mat-paginator-icon', new: '.mat-mdc-paginator-icon'},
  ];
}
