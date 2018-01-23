/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListKeyManager, ListKeyManagerOption} from './list-key-manager';
import {FocusOrigin} from './focus-monitor';

/**
 * This is the interface for focusable items (used by the FocusKeyManager).
 * Each item must know how to focus itself, whether or not it is currently disabled
 * and be able to supply it's label.
 */
export interface FocusableOption extends ListKeyManagerOption {
  /** Focuses the `FocusableOption`. */
  focus(origin?: FocusOrigin): void;
}

export class FocusKeyManager<T> extends ListKeyManager<FocusableOption & T> {
  private _origin: FocusOrigin = 'program';

  /**
   * Sets the focus origin that will be passed in to the items for any subsequent `focus` calls.
   * @param origin Focus origin to be used when focusing items.
   */
  setFocusOrigin(origin: FocusOrigin): this {
    this._origin = origin;
    return this;
  }

  /**
   * This method sets the active item to the item at the specified index.
   * It also adds focuses the newly active item.
   */
  setActiveItem(index: number): void {
    super.setActiveItem(index);

    if (this.activeItem) {
      this.activeItem.focus(this._origin);
    }
  }
}
