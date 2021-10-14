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
    <h3>CDK selection with a list</h3>
    <cdk-selection-list-example></cdk-selection-list-example>

    <h3>CDK selection column and CDK row selection with CDK table</h3>
    <cdk-selection-column-example></cdk-selection-column-example>

    <h3>Mat selection with a list</h3>
    <mat-selection-list-example></mat-selection-list-example>

    <h3>Mat selection column and Mat row selection with Mat table</h3>
    <mat-selection-column-example></mat-selection-column-example>
  `,
})
export class SelectionDemo {}
