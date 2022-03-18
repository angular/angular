/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class TooltipStylesMigrator extends StyleMigrator {
  component = 'tooltip';

  deprecatedPrefixes = ['mat-tooltip'];

  mixinChanges = [
    {
      old: 'tooltip-theme',
      new: ['mdc-tooltip-theme', 'mdc-tooltip-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {old: '.mat-tooltip', new: '.mat-mdc-tooltip'},
    {old: '.mat-tooltip-trigger', new: '.mat-mdc-tooltip-trigger'},
    {old: '.mat-tooltip-panel', new: '.mat-mdc-tooltip-panel'},
    {old: '.mat-tooltip-panel-above', new: '.mat-mdc-tooltip-panel-above'},
    {old: '.mat-tooltip-panel-below', new: '.mat-mdc-tooltip-panel-below'},
    {old: '.mat-tooltip-panel-left', new: '.mat-mdc-tooltip-panel-left'},
    {old: '.mat-tooltip-panel-right', new: '.mat-mdc-tooltip-panel-right'},
    {old: '.mat-tooltip-panel-before', new: '.mat-mdc-tooltip-panel-before'},
    {old: '.mat-tooltip-panel-after', new: '.mat-mdc-tooltip-panel-after'},
  ];
}
