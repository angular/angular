/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Directive, Input} from '@angular/core';

import {CdkSelection} from './selection';

/**
 * Applies `cdk-selected` class and `aria-selected` to an element.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. The index is required if `trackBy` is used on the `CdkSelection`
 * directive.
 */
@Directive({
  selector: '[cdkRowSelection]',
  host: {
    '[class.cdk-selected]': '_selection.isSelected(this.value, this.index)',
    '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)',
  },
})
export class CdkRowSelection<T> {
  @Input('cdkRowSelectionValue') value: T;

  @Input('cdkRowSelectionIndex')
  get index(): number | undefined {
    return this._index;
  }
  set index(index: NumberInput) {
    this._index = coerceNumberProperty(index);
  }
  protected _index?: number;

  constructor(readonly _selection: CdkSelection<T>) {}
}
