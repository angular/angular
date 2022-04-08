/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, Optional, SkipSelf} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, startWith} from 'rxjs/operators';

/** The relative item in the inline menu to focus after closing all popup menus. */
export const enum FocusNext {
  nextItem,
  previousItem,
  currentItem,
}

/** A single item (menu) in the menu stack. */
export interface MenuStackItem {
  /** A reference to the menu stack this menu stack item belongs to. */
  menuStack?: MenuStack;
}

/** Injection token used for an implementation of MenuStack. */
export const MENU_STACK = new InjectionToken<MenuStack>('cdk-menu-stack');

/** Provider that provides the parent menu stack, or a new menu stack if there is no parent one. */
export const PARENT_OR_NEW_MENU_STACK_PROVIDER = {
  provide: MENU_STACK,
  deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
  useFactory: (parentMenuStack?: MenuStack) => parentMenuStack || new MenuStack(),
};

/** Provider that provides the parent menu stack, or a new inline menu stack if there is no parent one. */
export const PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER = (
  orientation: 'vertical' | 'horizontal',
) => ({
  provide: MENU_STACK,
  deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
  useFactory: (parentMenuStack?: MenuStack) => parentMenuStack || MenuStack.inline(orientation),
});

/** Options that can be provided to the close or closeAll methods. */
export interface CloseOptions {
  /** The element to focus next if the close operation causes the menu stack to become empty. */
  focusNextOnEmpty?: FocusNext;
  /** Whether to focus the parent trigger after closing the menu. */
  focusParentTrigger?: boolean;
}

/** Event dispatched when a menu is closed. */
export interface MenuStackCloseEvent {
  /** The menu being closed. */
  item: MenuStackItem;
  /** Whether to focus the parent trigger after closing the menu. */
  focusParentTrigger?: boolean;
}

/** The next available menu stack ID. */
let nextId = 0;

/**
 * MenuStack allows subscribers to listen for close events (when a MenuStackItem is popped off
 * of the stack) in order to perform closing actions. Upon the MenuStack being empty it emits
 * from the `empty` observable specifying the next focus action which the listener should perform
 * as requested by the closer.
 */
@Injectable()
export class MenuStack {
  /** The ID of this menu stack. */
  readonly id = `${nextId++}`;

  /** All MenuStackItems tracked by this MenuStack. */
  private readonly _elements: MenuStackItem[] = [];

  /** Emits the element which was popped off of the stack when requested by a closer. */
  private readonly _close = new Subject<MenuStackCloseEvent>();

  /** Emits once the MenuStack has become empty after popping off elements. */
  private readonly _empty = new Subject<FocusNext | undefined>();

  /** Emits whether any menu in the menu stack has focus. */
  private readonly _hasFocus = new Subject<boolean>();

  /** Observable which emits the MenuStackItem which has been requested to close. */
  readonly closed: Observable<MenuStackCloseEvent> = this._close;

  /** Observable which emits whether any menu in the menu stack has focus. */
  readonly hasFocus: Observable<boolean> = this._hasFocus.pipe(
    startWith(false),
    debounceTime(0),
    distinctUntilChanged(),
  );

  /**
   * Observable which emits when the MenuStack is empty after popping off the last element. It
   * emits a FocusNext event which specifies the action the closer has requested the listener
   * perform.
   */
  readonly emptied: Observable<FocusNext | undefined> = this._empty;

  /**
   * Whether the inline menu associated with this menu stack is vertical or horizontal.
   * `null` indicates there is no inline menu associated with this menu stack.
   */
  private _inlineMenuOrientation: 'vertical' | 'horizontal' | null = null;

  /** Creates a menu stack that originates from an inline menu. */
  static inline(orientation: 'vertical' | 'horizontal') {
    const stack = new MenuStack();
    stack._inlineMenuOrientation = orientation;
    return stack;
  }

  /**
   * Adds an item to the menu stack.
   * @param menu the MenuStackItem to put on the stack.
   */
  push(menu: MenuStackItem) {
    this._elements.push(menu);
  }

  /**
   * Pop items off of the stack up to and including `lastItem` and emit each on the close
   * observable. If the stack is empty or `lastItem` is not on the stack it does nothing.
   * @param lastItem the last item to pop off the stack.
   * @param options Options that configure behavior on close.
   */
  close(lastItem: MenuStackItem, options?: CloseOptions) {
    const {focusNextOnEmpty, focusParentTrigger} = {...options};
    if (this._elements.indexOf(lastItem) >= 0) {
      let poppedElement;
      do {
        poppedElement = this._elements.pop()!;
        this._close.next({item: poppedElement, focusParentTrigger});
      } while (poppedElement !== lastItem);

      if (this.isEmpty()) {
        this._empty.next(focusNextOnEmpty);
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
        this._close.next({item: this._elements.pop()!});
      }
    }
    return removed;
  }

  /**
   * Pop off all MenuStackItems and emit each one on the `close` observable one by one.
   * @param options Options that configure behavior on close.
   */
  closeAll(options?: CloseOptions) {
    const {focusNextOnEmpty, focusParentTrigger} = {...options};
    if (!this.isEmpty()) {
      while (!this.isEmpty()) {
        const menuStackItem = this._elements.pop();
        if (menuStackItem) {
          this._close.next({item: menuStackItem, focusParentTrigger});
        }
      }
      this._empty.next(focusNextOnEmpty);
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

  /** Whether the menu stack is associated with an inline menu. */
  hasInlineMenu() {
    return this._inlineMenuOrientation != null;
  }

  /** The orientation of the associated inline menu. */
  inlineMenuOrientation() {
    return this._inlineMenuOrientation;
  }

  /** Sets whether the menu stack contains the focused element. */
  setHasFocus(hasFocus: boolean) {
    this._hasFocus.next(hasFocus);
  }
}
