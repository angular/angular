/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global as _global} from './global';

// When Symbol.iterator doesn't exist, retrieves the key used in es6-shim
declare const Symbol: any;
let _symbolIterator: any = null;
export function getSymbolIterator(): string|symbol {
  if (!_symbolIterator) {
    const Symbol = _global['Symbol'];
    if (Symbol && Symbol.iterator) {
      _symbolIterator = Symbol.iterator;
    } else {
      // es6-shim specific logic
      const keys = Object.getOwnPropertyNames(Map.prototype);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (key !== 'entries' && key !== 'size' &&
            (Map as any).prototype[key] === Map.prototype['entries']) {
          _symbolIterator = key;
        }
      }
    }
  }
  return _symbolIterator;
}
