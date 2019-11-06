/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  template: `
    <h3>CDK popover-edit with cdk-table</h3>
    <cdk-popover-edit-cdk-table-example></cdk-popover-edit-cdk-table-example>
    <h3>CDK popover-edit with cdk-table flex</h3>
    <cdk-popover-edit-cdk-table-flex-example></cdk-popover-edit-cdk-table-flex-example>
    <h3>CDK popover-edit with vanilla table</h3>
    <cdk-popover-edit-cell-span-vanilla-table-example>
    </cdk-popover-edit-cell-span-vanilla-table-example>
    <h3>CDK popover-edit with vanilla table and tab out</h3>
    <cdk-popover-edit-tab-out-vanilla-table-example>
    </cdk-popover-edit-tab-out-vanilla-table-example>
    <h3>CDK popover-edit with vanilla table</h3>
    <cdk-popover-edit-vanilla-table-example></cdk-popover-edit-vanilla-table-example>
    <h3>Material popover-edit with mat-table and cell span</h3>
    <popover-edit-cell-span-mat-table-example></popover-edit-cell-span-mat-table-example>
    <h3>Material popover-edit with mat-table</h3>
    <popover-edit-mat-table-example></popover-edit-mat-table-example>
    <h3>Material popover-edit with mat-table flex</h3>
    <popover-edit-mat-table-flex-example></popover-edit-mat-table-flex-example>
    <h3>Material popover-edit with mat</h3>
    <popover-edit-tab-out-mat-table-example></popover-edit-tab-out-mat-table-example>
  `,
})
export class PopoverEditDemo {}
