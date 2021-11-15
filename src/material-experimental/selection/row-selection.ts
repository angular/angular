/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkRowSelection} from '@angular/cdk-experimental/selection';
import {Input, Directive} from '@angular/core';

/**
 * Applies `mat-selected` class and `aria-selected` to an element.
 *
 * Must be used within a parent `MatSelection` directive.
 * Must be provided with the value. The index is required if `trackBy` is used on the `CdkSelection`
 * directive.
 */
@Directive({
  selector: '[matRowSelection]',
  host: {
    '[class.mat-selected]': '_selection.isSelected(this.value, this.index)',
    '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)',
  },
  providers: [{provide: CdkRowSelection, useExisting: MatRowSelection}],
  inputs: ['index: matRowSelectionIndex'],
})
export class MatRowSelection<T> extends CdkRowSelection<T> {
  /** The value that is associated with the row */
  @Input('matRowSelectionValue') override value: T;
}
