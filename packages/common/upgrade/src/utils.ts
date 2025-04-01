/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function stripPrefix(val: string, prefix: string): string {
  return val.startsWith(prefix) ? val.substring(prefix.length) : val;
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else {
    try {
      if (a.prototype !== b.prototype || (Array.isArray(a) && Array.isArray(b))) {
        return false;
      }
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
      return false;
    }
  }
}

export function isAnchor(el: (Node & ParentNode) | Element | null): el is HTMLAnchorElement {
  return (<HTMLAnchorElement>el).href !== undefined;
}
