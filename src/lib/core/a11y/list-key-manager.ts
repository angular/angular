import {QueryList} from '@angular/core';
import {UP_ARROW, DOWN_ARROW, TAB, HOME, END} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

/**
 * This is the interface for focusable items (used by the ListKeyManager).
 * Each item must know how to focus itself and whether or not it is currently disabled.
 */
export interface Focusable {
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
  private _wrap: boolean = false;

  constructor(private _items: QueryList<Focusable>) {}

  /**
   * Turns on focus wrapping mode, which ensures that the focus will wrap to
   * the other end of list when there are no more items in the given direction.
   *
   * @returns The ListKeyManager that the method was called on.
   */
  withFocusWrap(): this {
    this._wrap = true;
    return this;
  }

  /**
   * Sets the focus of the list to the item at the index specified.
   *
   * @param index The index of the item to be focused.
   */
  setFocus(index: number): void {
    this._focusedItemIndex = index;
    this._items.toArray()[index].focus();
  }

  /**
   * Sets the focus depending on the key event passed in.
   * @param event Keyboard event to be used for determining which element to focus.
   */
  onKeydown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case DOWN_ARROW:
        this.focusNextItem();
        break;
      case UP_ARROW:
        this.focusPreviousItem();
        break;
      case HOME:
        this.focusFirstItem();
        break;
      case END:
        this.focusLastItem();
        break;
      case TAB:
        // Note that we shouldn't prevent the default action on tab.
        this._tabOut.next(null);
        return;
      default:
        return;
    }

    event.preventDefault();
  }

  /** Focuses the first enabled item in the list. */
  focusFirstItem(): void {
    this._setFocusByIndex(0, 1);
  }

  /** Focuses the last enabled item in the list. */
  focusLastItem(): void {
    this._setFocusByIndex(this._items.length - 1, -1);
  }

  /** Focuses the next enabled item in the list. */
  focusNextItem(): void {
    this._setFocusByDelta(1);
  }

  /** Focuses a previous enabled item in the list. */
  focusPreviousItem(): void {
    this._setFocusByDelta(-1);
  }

  /** Returns the index of the currently focused item. */
  get focusedItemIndex(): number {
    return this._focusedItemIndex;
  }

  /**
   * Allows setting of the focusedItemIndex without focusing the item.
   * @param index The new focusedItemIndex.
   */
  updateFocusedItemIndex(index: number) {
    this._focusedItemIndex = index;
  }

  /**
   * Observable that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  get tabOut(): Observable<void> {
    return this._tabOut.asObservable();
  }

  /**
   * This method sets focus to the correct item, given a list of items and the delta
   * between the currently focused item and the new item to be focused. It will calculate
   * the proper focus differently depending on whether wrap mode is turned on.
   */
  private _setFocusByDelta(delta: number, items = this._items.toArray()): void {
    this._wrap ? this._setWrapModeFocus(delta, items)
               : this._setDefaultModeFocus(delta, items);
  }

  /**
   * Sets the focus properly given "wrap" mode. In other words, it will continue to move
   * down the list until it finds an item that is not disabled, and it will wrap if it
   * encounters either end of the list.
   */
  private _setWrapModeFocus(delta: number, items: Focusable[]): void {
    // when focus would leave menu, wrap to beginning or end
    this._focusedItemIndex =
      (this._focusedItemIndex + delta + items.length) % items.length;

    // skip all disabled menu items recursively until an active one is reached
    if (items[this._focusedItemIndex].disabled) {
      this._setWrapModeFocus(delta, items);
    } else {
      items[this._focusedItemIndex].focus();
    }
  }

  /**
   * Sets the focus properly given the default mode. In other words, it will
   * continue to move down the list until it finds an item that is not disabled. If
   * it encounters either end of the list, it will stop and not wrap.
   */
  private _setDefaultModeFocus(delta: number, items: Focusable[]): void {
    this._setFocusByIndex(this._focusedItemIndex + delta, delta, items);
  }

  /**
   * Sets the focus to the first enabled item starting at the index specified. If the
   * item is disabled, it will move in the fallbackDelta direction until it either
   * finds an enabled item or encounters the end of the list.
   */
  private _setFocusByIndex(index: number, fallbackDelta: number,
                           items = this._items.toArray()): void {
    if (!items[index]) { return; }
    while (items[index].disabled) {
      index += fallbackDelta;
      if (!items[index]) { return; }
    }

    this.setFocus(index);
  }

}
