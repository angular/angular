
import {QueryList} from '@angular/core';
import {ListKeyManager, CanDisable} from './list-key-manager';

/**
 * This is the interface for focusable items (used by the FocusKeyManager).
 * Each item must know how to focus itself and whether or not it is currently disabled.
 */
export interface Focusable extends CanDisable {
  focus(): void;
}


export class FocusKeyManager extends ListKeyManager<Focusable> {

  constructor(items: QueryList<Focusable>) {
    super(items);
  }

  /**
   * This method sets the active item to the item at the specified index.
   * It also adds focuses the newly active item.
   */
  setActiveItem(index: number): void {
    super.setActiveItem(index);

    if (this.activeItem) {
      this.activeItem.focus();
    }
  }

}
