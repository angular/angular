/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class AstPath<T> {
  constructor(private path: T[]) {}

  get empty(): boolean { return !this.path || !this.path.length; }
  get head(): T|undefined { return this.path[0]; }
  get tail(): T|undefined { return this.path[this.path.length - 1]; }

  parentOf(node: T): T|undefined { return this.path[this.path.indexOf(node) - 1]; }
  childOf(node: T): T|undefined { return this.path[this.path.indexOf(node) + 1]; }

  first<N extends T>(ctor: {new (...args: any[]): N}): N|undefined {
    for (let i = this.path.length - 1; i >= 0; i--) {
      let item = this.path[i];
      if (item instanceof ctor) return <N>item;
    }
  }

  push(node: T) { this.path.push(node); }

  pop(): T { return this.path.pop(); }
}
