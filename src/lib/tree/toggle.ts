/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTreeNodeToggle} from '@angular/cdk/tree';
import {Directive, Input} from '@angular/core';

/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  },
  providers: [{provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle}]
})
export class MatTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
  @Input('matTreeNodeToggleRecursive') recursive: boolean = false;
}
