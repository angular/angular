/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {UP_ARROW, DOWN_ARROW, TAB, A, Z} from '@angular/cdk/keycodes';
import {RxChain, debounceTime, filter, map, doOperator} from '@angular/cdk/rxjs';

/**
 * This interface is for items that can be passed to a ListKeyManager.
 */
export interface ListKeyManagerOption {
  disabled?: boolean;
  getLabel?(): string;
}

/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager<T extends ListKeyManagerOption> {
  private _activeItemIndex = -1;
  private _activeItem: T;
  private _wrap = false;
  private _nonNavigationKeyStream = new Subject<number>();
  private _typeaheadSubscription: Subscription;

  // Buffer for the letters that the user has pressed when the typeahead option is turned on.
  private _pressedInputKeys: number[] = [];

  constructor(private _items: QueryList<T>) { }

  /**
   * Turns on wrapping mode, which ensures that the active item will wrap to
   * the other end of list when there are no more items in the given direction.
   */
  withWrap(): this {
    this._wrap = true;
    return this;
  }

  /**
   * Turns on typeahead mode which allows users to set the active item by typing.
   * @param debounceInterval Time to wait after the last keystroke before setting the active item.
   */
  withTypeAhead(debounceInterval = 200): this {
    if (this._items.length && this._items.some(item => typeof item.getLabel !== 'function')) {
      throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
    }

    if (this._typeaheadSubscription) {
      this._typeaheadSubscription.unsubscribe();
    }

    // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
    // and convert those letters back into a string. Afterwards find the first item that starts
    // with that string and select it.
    this._typeaheadSubscription = RxChain.from(this._nonNavigationKeyStream)
      .call(filter, keyCode => keyCode >= A && keyCode <= Z)
      .call(doOperator, keyCode => this._pressedInputKeys.push(keyCode))
      .call(debounceTime, debounceInterval)
      .call(filter, () => this._pressedInputKeys.length > 0)
      .call(map, () => String.fromCharCode(...this._pressedInputKeys))
      .subscribe(inputString => {
        const items = this._items.toArray();

        for (let i = 0; i < items.length; i++) {
          if (items[i].getLabel!().toUpperCase().trim().indexOf(inputString) === 0) {
            this.setActiveItem(i);
            break;
          }
        }

        this._pressedInputKeys = [];
      });

    return this;
  }

  /**
   * Sets the active item to the item at the index specified.
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
      case DOWN_ARROW: this.setNextItemActive(); break;
      case UP_ARROW: this.setPreviousItemActive(); break;

      // Note that we return here, in order to avoid preventing
      // the default action of unsupported keys.
      default: this._nonNavigationKeyStream.next(event.keyCode); return;
    }

    this._pressedInputKeys = [];
    event.preventDefault();
  }

  /** Index of the currently active item. */
  get activeItemIndex(): number | null {
    return this._activeItemIndex;
  }

  /** The active item. */
  get activeItem(): T | null {
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
    this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
  }

  /** Sets the active item to a previous enabled item in the list. */
  setPreviousItemActive(): void {
    this._activeItemIndex < 0 && this._wrap ? this.setLastItemActive()
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
    return filter.call(this._nonNavigationKeyStream, keyCode => keyCode === TAB);
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
