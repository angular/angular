/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

/**
 * A FocusTrap managed by FocusTrapManager.
 * Implemented by ConfigurableFocusTrap to avoid circular dependency.
 */
export interface ManagedFocusTrap {
  _enable(): void;
  _disable(): void;
  focusInitialElementWhenReady(): Promise<boolean>;
}

/** Injectable that ensures only the most recently enabled FocusTrap is active. */
@Injectable({providedIn: 'root'})
export class FocusTrapManager {
  // A stack of the FocusTraps on the page. Only the FocusTrap at the
  // top of the stack is active.
  private _focusTrapStack: ManagedFocusTrap[] = [];

  /**
   * Disables the FocusTrap at the top of the stack, and then pushes
   * the new FocusTrap onto the stack.
   */
  register(focusTrap: ManagedFocusTrap): void {
    // Dedupe focusTraps that register multiple times.
    this._focusTrapStack = this._focusTrapStack.filter(ft => ft !== focusTrap);

    let stack = this._focusTrapStack;

    if (stack.length) {
      stack[stack.length - 1]._disable();
    }

    stack.push(focusTrap);
    focusTrap._enable();
  }

  /**
   * Removes the FocusTrap from the stack, and activates the
   * FocusTrap that is the new top of the stack.
   */
  deregister(focusTrap: ManagedFocusTrap): void {
    focusTrap._disable();

    const stack = this._focusTrapStack;

    const i = stack.indexOf(focusTrap);
    if (i !== -1) {
      stack.splice(i, 1);
      if (stack.length) {
        stack[stack.length - 1]._enable();
      }
    }
  }
}
