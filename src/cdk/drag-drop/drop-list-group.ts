/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, OnDestroy} from '@angular/core';

/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
@Directive({
  selector: '[cdkDropListGroup]'
})
export class CdkDropListGroup<T> implements OnDestroy {
  /** Drop lists registered inside the group. */
  readonly _items = new Set<T>();

  ngOnDestroy() {
    this._items.clear();
  }
}
