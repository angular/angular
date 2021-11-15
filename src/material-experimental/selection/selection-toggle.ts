/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
  inputs: ['index: matSelectionToggleIndex'],
  providers: [{provide: CdkSelectionToggle, useExisting: MatSelectionToggle}],
})
export class MatSelectionToggle<T> extends CdkSelectionToggle<T> {
  /** The value that is associated with the toggle */
  @Input('matSelectionToggleValue') override value: T;
}
