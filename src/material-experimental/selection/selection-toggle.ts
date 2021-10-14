/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {CdkSelectionToggle} from '@angular/cdk-experimental/selection';
import {Directive, Input} from '@angular/core';

/**
 * Makes the element a selection toggle.
 *
 * Must be used within a parent `MatSelection` directive.
 * Must be provided with the value. If `trackBy` is used on `MatSelection`, the index of the value
 * is required. If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the selection state provided by the `MatSelection` directive. If
 * not, use `checked$` to get the checked state of the value, and `toggle()` to change the selection
 * state.
 */
@Directive({
  selector: '[matSelectionToggle]',
  exportAs: 'matSelectionToggle',
  providers: [{provide: CdkSelectionToggle, useExisting: MatSelectionToggle}],
})
// tslint:disable-next-line: coercion-types
export class MatSelectionToggle<T> extends CdkSelectionToggle<T> {
  /** The value that is associated with the toggle */
  @Input('matSelectionToggleValue') override value: T;

  /** The index of the value in the list. Required when used with `trackBy` */
  @Input('matSelectionToggleIndex')
  override get index(): number | undefined {
    return this._index;
  }
  override set index(index: number | undefined) {
    // TODO: when we remove support for ViewEngine, change this setter to an input
    // alias in the decorator metadata.
    this._index = coerceNumberProperty(index);
  }
}
