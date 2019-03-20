import {assertGreaterThan} from '../../util/assert';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A simple stack implementation
 *
 * This stack will expand to whatever size is required and stay allocated at that size.
 *
 * Unused spaces in the allocated stack will be set to `null` so we don't retain value references we
 * no longer want.
 */
export class Stack<T> {
  private _current: T|null = null;
  private _stack: (T|null)[] = [];
  private _pointer = -1;

  /**
   * Pushes a value onto the top of the stack
   * @param value the value to push onto the top of the stack
   */
  push(value: T): void {
    this._stack[++this._pointer] = value;
    this._current = value;
  }

  /**
   * Pops a value off of the top of the stack and returns it
   */
  pop(): T|null {
    const currentPointer = this._pointer;
    ngDevMode && assertGreaterThan(currentPointer, -1, 'Attempted to pop off of an empty stack');
    if (currentPointer === -1) {
      return null;
    }
    const _stack = this._stack;
    const popped = this._current;
    _stack[currentPointer] = null;
    const newPointer = --this._pointer;
    this._current = newPointer === -1 ? null : _stack[newPointer];
    return popped;
  }

  /**
   * The current top of the stack
   */
  peek(): T|null { return this._current; }
}
