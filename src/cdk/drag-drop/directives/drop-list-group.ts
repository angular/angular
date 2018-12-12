/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, OnDestroy, Input} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
@Directive({
  selector: '[cdkDropListGroup]',
  exportAs: 'cdkDropListGroup',
})
export class CdkDropListGroup<T> implements OnDestroy {
  /** Drop lists registered inside the group. */
  readonly _items = new Set<T>();

  /** Whether starting a dragging sequence from inside this group is disabled. */
  @Input('cdkDropListGroupDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  ngOnDestroy() {
    this._items.clear();
  }
}
