/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Stack} from '@angular/core/src/render3/util/stack';

describe('Stack', () => {
  it('should push and pop values', () => {
    const stack = new Stack<number>();

    expect(stack.peek()).toBe(null);
    expect(getAllocatedStackSize(stack)).toBe(0);

    stack.push(1);
    expect(stack.peek()).toBe(1);
    expect(getAllocatedStackSize(stack)).toBe(1);

    stack.push(2);
    expect(stack.peek()).toBe(2);
    expect(getAllocatedStackSize(stack)).toBe(2);

    stack.push(3);
    expect(stack.peek()).toBe(3);
    expect(getAllocatedStackSize(stack)).toBe(3);

    let popped = stack.pop();
    expect(popped).toBe(3);
    expect(stack.peek()).toBe(2);
    expect(getAllocatedStackSize(stack)).toBe(3);

    popped = stack.pop();
    expect(popped).toBe(2);
    expect(stack.peek()).toBe(1);
    expect(getAllocatedStackSize(stack)).toBe(3);

    popped = stack.pop();
    expect(popped).toBe(1);
    expect(stack.peek()).toBe(null);
    expect(getAllocatedStackSize(stack)).toBe(3);
  });

  it('should handle too much pop', () => {
    const stack = new Stack<number>();

    expect(() => stack.pop()).toThrow();
    expect(() => stack.pop()).toThrow();
    expect(() => stack.pop()).toThrow();

    stack.push(42);
    expect(stack.peek()).toBe(42);
    expect(getAllocatedStackSize(stack)).toBe(1);
  });
});

function getAllocatedStackSize(stack: any): number {
  return stack._stack.length;
}
