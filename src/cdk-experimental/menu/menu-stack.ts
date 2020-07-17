/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject, Observable} from 'rxjs';

/** Events to emit as specified by the caller once the MenuStack is empty. */
export const enum FocusNext {
  nextItem,
  previousItem,
  currentItem,
}

/**
 * Interface for the elements tracked in the MenuStack.
 */
export interface MenuStackItem {
  /** A reference to the previous Menus MenuStack instance. */
  _menuStack: MenuStack;
}

/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
export class MenuStack {
  /** All MenuStackItems tracked by this MenuStack. */
  private readonly _elements: MenuStackItem[] = [];

  /** Emits the element which was popped off of the stack when requested by a closer. */
  private readonly _close: Subject<MenuStackItem> = new Subject();

  /** Emits once the MenuStack has become empty after popping off elements. */
  private readonly _empty: Subject<FocusNext> = new Subject();

  /** Observable which emits the MenuStackItem which has been requested to close. */
  readonly close: Observable<MenuStackItem> = this._close;

  /**
   * Observable which emits when the MenuStack is empty after popping off the last element. It
   * emits a FocusNext event which specifies the action the closer has requested the listener
   * perform.
   */
  readonly empty: Observable<FocusNext> = this._empty;

  /** @param menu the MenuStackItem to put on the stack. */
  push(menu: MenuStackItem) {
    this._elements.push(menu);
  }

  /**
   *  Pop off the top most MenuStackItem and emit it on the close observable.
   *  @param focusNext the event to emit on the `empty` observable if the method call resulted in an
   *  empty stack. Does not emit if the stack was initially empty.
   */
  closeLatest(focusNext?: FocusNext) {
    const menuStackItem = this._elements.pop();
    if (menuStackItem) {
      this._close.next(menuStackItem);
      if (this._elements.length === 0) {
        this._empty.next(focusNext);
      }
    }
  }

  /**
   * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
   * @param focusNext the event to emit on the `empty` observable once the stack is emptied. Does
   * not emit if the stack was initially empty.
   */
  closeAll(focusNext?: FocusNext) {
    if (this._elements.length) {
      while (this._elements.length) {
        const menuStackItem = this._elements.pop();
        if (menuStackItem) {
          this._close.next(menuStackItem);
        }
      }

      this._empty.next(focusNext);
    }
  }
}
