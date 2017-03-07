import {QueryList} from '@angular/core';
import {UP_ARROW, DOWN_ARROW, TAB, HOME, END} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

/**
 * This interface is for items that can be disabled. The type passed into
 * ListKeyManager must extend this interface.
 */
export interface CanDisable {
  disabled?: boolean;
}

/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager<T extends CanDisable> {
  private _activeItemIndex: number = null;
  private _activeItem: T;
  private _tabOut: Subject<any> = new Subject();
  private _wrap: boolean = false;

  constructor(private _items: QueryList<T>) {
  }

  /**
   * Turns on wrapping mode, which ensures that the active item will wrap to
   * the other end of list when there are no more items in the given direction.
   *
   * @returns The ListKeyManager that the method was called on.
   */
  withWrap(): this {
    this._wrap = true;
    return this;
  }

  /**
   * Sets the active item to the item at the index specified.
   *
   * @param index The index of the item to be set as active.
   */
  setActiveItem(index: number): void {
    this._activeItemIndex = index;
    this._activeItem = this._items.toArray()[index];
  }

  /**
   * Sets the active item depending on the key event passed in.
   * @param event Keyboard event to be used for determining which element should be active.
   */
  onKeydown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case DOWN_ARROW:
        this.setNextItemActive();
        break;
      case UP_ARROW:
        this.setPreviousItemActive();
        break;
      case HOME:
        this.setFirstItemActive();
        break;
      case END:
        this.setLastItemActive();
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

  /** Returns the index of the currently active item. */
  get activeItemIndex(): number {
    return this._activeItemIndex;
  }

  /** Returns the currently active item. */
  get activeItem(): T {
    return this._activeItem;
  }

  /** Sets the active item to the first enabled item in the list. */
  setFirstItemActive(): void {
    this._setActiveItemByIndex(0, 1);
  }

  /** Sets the active item to the last enabled item in the list. */
  setLastItemActive(): void {
    this._setActiveItemByIndex(this._items.length - 1, -1);
  }

  /** Sets the active item to the next enabled item in the list. */
  setNextItemActive(): void {
    this._activeItemIndex === null ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
  }

  /** Sets the active item to a previous enabled item in the list. */
  setPreviousItemActive(): void {
    this._activeItemIndex === null && this._wrap ? this.setLastItemActive()
                                                 : this._setActiveItemByDelta(-1);
  }

  /**
   * Allows setting of the activeItemIndex without any other effects.
   * @param index The new activeItemIndex.
   */
  updateActiveItemIndex(index: number) {
    this._activeItemIndex = index;
  }

  /**
   * Observable that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  get tabOut(): Observable<void> {
    return this._tabOut.asObservable();
  }

  /**
   * This method sets the active item, given a list of items and the delta between the
   * currently active item and the new active item. It will calculate differently
   * depending on whether wrap mode is turned on.
   */
  private _setActiveItemByDelta(delta: number, items = this._items.toArray()): void {
    this._wrap ? this._setActiveInWrapMode(delta, items)
               : this._setActiveInDefaultMode(delta, items);
  }

  /**
   * Sets the active item properly given "wrap" mode. In other words, it will continue to move
   * down the list until it finds an item that is not disabled, and it will wrap if it
   * encounters either end of the list.
   */
  private _setActiveInWrapMode(delta: number, items: T[]): void {
    // when active item would leave menu, wrap to beginning or end
    this._activeItemIndex =
      (this._activeItemIndex + delta + items.length) % items.length;

    // skip all disabled menu items recursively until an enabled one is reached
    if (items[this._activeItemIndex].disabled) {
      this._setActiveInWrapMode(delta, items);
    } else {
      this.setActiveItem(this._activeItemIndex);
    }
  }

  /**
   * Sets the active item properly given the default mode. In other words, it will
   * continue to move down the list until it finds an item that is not disabled. If
   * it encounters either end of the list, it will stop and not wrap.
   */
  private _setActiveInDefaultMode(delta: number, items: T[]): void {
    this._setActiveItemByIndex(this._activeItemIndex + delta, delta, items);
  }

  /**
   * Sets the active item to the first enabled item starting at the index specified. If the
   * item is disabled, it will move in the fallbackDelta direction until it either
   * finds an enabled item or encounters the end of the list.
   */
  private _setActiveItemByIndex(index: number, fallbackDelta: number,
                                  items = this._items.toArray()): void {
    if (!items[index]) { return; }
    while (items[index].disabled) {
      index += fallbackDelta;
      if (!items[index]) { return; }
    }
    this.setActiveItem(index);
  }

}

