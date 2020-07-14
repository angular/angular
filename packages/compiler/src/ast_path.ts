/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A path is an ordered set of elements. Typically a path is to  a
 * particular offset in a source file. The head of the list is the top
 * most node. The tail is the node that contains the offset directly.
 *
 * For example, the expression `a + b + c` might have an ast that looks
 * like:
 *     +
 *    / \
 *   a   +
 *      / \
 *     b   c
 *
 * The path to the node at offset 9 would be `['+' at 1-10, '+' at 7-10,
 * 'c' at 9-10]` and the path the node at offset 1 would be
 * `['+' at 1-10, 'a' at 1-2]`.
 */
export class AstPath<T> {
  constructor(private path: T[], public position: number = -1) {}

  get empty(): boolean {
    return !this.path || !this.path.length;
  }
  get head(): T|undefined {
    return this.path[0];
  }
  get tail(): T|undefined {
    return this.path[this.path.length - 1];
  }

  parentOf(node: T|undefined): T|undefined {
    return node && this.path[this.path.indexOf(node) - 1];
  }
  childOf(node: T): T|undefined {
    return this.path[this.path.indexOf(node) + 1];
  }

  first<N extends T>(ctor: {new(...args: any[]): N}): N|undefined {
    for (let i = this.path.length - 1; i >= 0; i--) {
      let item = this.path[i];
      if (item instanceof ctor) return <N>item;
    }
  }

  push(node: T) {
    this.path.push(node);
  }

  pop(): T {
    return this.path.pop()!;
  }
}
