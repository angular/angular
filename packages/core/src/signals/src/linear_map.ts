/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class LinearMap<K, V> extends Array<K|V|null> {
  private emptyIndex: number|null = null;

  get(key: K): V|undefined {
    for (let i = 0, len = this.length; i < len; i += 2) {
      const k = this[i];
      if (k === null) {
        if (this.emptyIndex === null || this.emptyIndex > i) {
          this.emptyIndex = i;
        }
      } else if (k === key) {
        return this[i + 1] as V;
      }
    }
  }

  set(key: K, value: V): void {
    if (this.emptyIndex !== null) {
      this[this.emptyIndex] = key;
      this[this.emptyIndex + 1] = value;
      this.emptyIndex = null;
      return
    }
    for (let i = 0, len = this.length; i < len; i += 2) {
      if (this[i] === null) {
        this[i] = key;
        this[i + 1] = value;
        return;
      }
    }
    this.push(key, value);
  }

  delete(key: K): void {
    for (let i = 0, len = this.length; i < len; i += 2) {
      if (this[i] === key) {
        this[i] = this[i + 1] = null;
        if (this.emptyIndex === null || this.emptyIndex > i) {
          this.emptyIndex = i;
        }
        break;
      }
    }
  }

  deleteIndex(i: number): void {
    this[i] = this[i + 1] = null;
  }
}
