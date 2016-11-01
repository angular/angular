import {QueryList} from '@angular/core';
import {UP_ARROW, DOWN_ARROW, TAB} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

/**
 * This is the interface for focusable items (used by the ListKeyManager).
 * Each item must know how to focus itself and whether or not it is currently disabled.
 */
export interface MdFocusable {
  focus(): void;
  disabled?: boolean;
}

/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of focusable items, it will focus the correct item when arrow events occur.
 */
export class ListKeyManager {
  private _focusedItemIndex: number;
  private _tabOut: Subject<any> = new Subject();

  constructor(private _items: QueryList<MdFocusable>) {}

  /**
   * Observable that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  get tabOut(): Observable<void> {
    return this._tabOut.asObservable();
  }

  get focusedItemIndex(): number {
    return this._focusedItemIndex;
  }

  set focusedItemIndex(value: number) {
    this._focusedItemIndex = value;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.keyCode === DOWN_ARROW) {
      this._focusNextItem();
    } else if (event.keyCode === UP_ARROW) {
      this._focusPreviousItem();
    } else if (event.keyCode === TAB) {
      this._tabOut.next(null);
    }
  }

  private _focusNextItem(): void {
    const items = this._items.toArray();
    this._updateFocusedItemIndex(1, items);
    items[this._focusedItemIndex].focus();
  }

  private _focusPreviousItem(): void {
    const items = this._items.toArray();
    this._updateFocusedItemIndex(-1, items);
    items[this._focusedItemIndex].focus();
  }

  /**
   * This method sets focus to the correct item, given a list of items and the delta
   * between the currently focused item and the new item to be focused. It will
   * continue to move down the list until it finds an item that is not disabled, and it will wrap
   * if it encounters either end of the list.
   *
   * @param delta the desired change in focus index
   */
  private _updateFocusedItemIndex(delta: number, items: MdFocusable[]) {
    // when focus would leave menu, wrap to beginning or end
    this._focusedItemIndex =
      (this._focusedItemIndex + delta + items.length) % items.length;

    // skip all disabled menu items recursively until an active one
    // is reached or the menu closes for overreaching bounds
    while (items[this._focusedItemIndex].disabled) {
      this._updateFocusedItemIndex(delta, items);
    }
  }

}
