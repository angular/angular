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
  _menuStack: MenuStack | null;
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
  readonly closed: Observable<MenuStackItem> = this._close;

  /**
   * Observable which emits when the MenuStack is empty after popping off the last element. It
   * emits a FocusNext event which specifies the action the closer has requested the listener
   * perform.
   */
  readonly emptied: Observable<FocusNext> = this._empty;

  /** @param menu the MenuStackItem to put on the stack. */
  push(menu: MenuStackItem) {
    this._elements.push(menu);
  }

  /**
   * Pop items off of the stack up to and including `lastItem` and emit each on the close
   * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
   * @param lastItem the last item to pop off the stack.
   * @param focusNext the event to emit on the `empty` observable if the method call resulted in an
   * empty stack. Does not emit if the stack was initially empty or if `lastItem` was not on the
   * stack.
   */
  close(lastItem: MenuStackItem, focusNext?: FocusNext) {
    if (this._elements.indexOf(lastItem) >= 0) {
      let poppedElement;
      do {
        poppedElement = this._elements.pop();
        this._close.next(poppedElement);
      } while (poppedElement !== lastItem);

      if (this.isEmpty()) {
        this._empty.next(focusNext);
      }
    }
  }

  /**
   * Pop items off of the stack up to but excluding `lastItem` and emit each on the close
   * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
   * @param lastItem the element which should be left on the stack
   * @return whether or not an item was removed from the stack
   */
  closeSubMenuOf(lastItem: MenuStackItem) {
    let removed = false;
    if (this._elements.indexOf(lastItem) >= 0) {
      removed = this.peek() !== lastItem;
      while (this.peek() !== lastItem) {
        this._close.next(this._elements.pop());
      }
    }
    return removed;
  }

  /**
   * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
   * @param focusNext the event to emit on the `empty` observable once the stack is emptied. Does
   * not emit if the stack was initially empty.
   */
  closeAll(focusNext?: FocusNext) {
    if (!this.isEmpty()) {
      while (!this.isEmpty()) {
        const menuStackItem = this._elements.pop();
        if (menuStackItem) {
          this._close.next(menuStackItem);
        }
      }

      this._empty.next(focusNext);
    }
  }

  /** Return true if this stack is empty. */
  isEmpty() {
    return !this._elements.length;
  }

  /** Return the length of the stack. */
  length() {
    return this._elements.length;
  }

  /** Get the top most element on the stack. */
  peek(): MenuStackItem | undefined {
    return this._elements[this._elements.length - 1];
  }
}

/** NoopMenuStack is a placeholder MenuStack used for inline menus. */
export class NoopMenuStack extends MenuStack {
  /** Noop push - does not add elements to the MenuStack. */
  push(_: MenuStackItem) {}
}
