/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs';

/**
 * Tracks which nodes of a tree are expanded.
 *
 * The directive forest is rendered as a flat list inside a virtual scroll viewport rather than
 * with a CDK tree, so it only needs this expansion state, which used to be provided by the
 * deprecated `FlatTreeControl`.
 */
export class ExpansionModel<T> {
  private readonly _expanded = new SelectionModel<T>(true);

  /** Emits whenever nodes are expanded or collapsed. */
  readonly changed: Observable<SelectionChange<T>> = this._expanded.changed;

  expand(node: T): void {
    this._expanded.select(node);
  }

  collapse(node: T): void {
    this._expanded.deselect(node);
  }

  toggle(node: T): void {
    this._expanded.toggle(node);
  }

  isExpanded(node: T): boolean {
    return this._expanded.isSelected(node);
  }
}
