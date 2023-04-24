/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class TestIterable {
  list: number[];
  constructor() {
    this.list = [];
  }

  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
}
