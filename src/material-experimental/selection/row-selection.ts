/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
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
})
// tslint:disable-next-line: coercion-types
export class MatRowSelection<T> extends CdkRowSelection<T> {
  /** The value that is associated with the row */
  @Input('matRowSelectionValue') override value: T;

  /** The index of the value in the list. Required when used with `trackBy` */
  @Input('matRowSelectionIndex')
  override get index(): number | undefined {
    return this._index;
  }
  override set index(index: number | undefined) {
    // TODO: when we remove support for ViewEngine, change this setter to an input
    // alias in the decorator metadata.
    this._index = coerceNumberProperty(index);
  }
}
