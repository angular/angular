/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Import zero symbols from zone.js. This causes the zone ambient type to be
// added to the type-checker, without emitting any runtime module load statement
import {} from 'zone.js';

// TODO(jteplitz602): Load WorkerGlobalScope from lib.webworker.d.ts file #3492
declare var WorkerGlobalScope: any /** TODO #9100 */;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
declare var global: any /** TODO #9100 */;
const __window = typeof window !== 'undefined' && window;
const __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
const __global = typeof global !== 'undefined' && global;
const _global: {[name: string]: any} = __window || __global || __self;

/**
 * Attention: Always use `declare const ...` when reading globals,
 * so that tsickle produces externs for closure.
 *
 * Only use this export for setting globals,
 * but still add a `declare const ...` so that tsickle
 * keeps producing the right externs, even if
 * that variable is not used.
 *
 * Pattern for reading optional values:
 * ```
 * declare var xzy: string;
 * if (typeof xzy !== 'undefined') { ... }
 * ```
 *
 * Pattern for creating globals lazily
 * ```
 * // still needed for closure, even if not read!
 * declar var xzy: string;
 *
 * if (typeof xzy === 'undefined') {
 *   globalForWrite.xzy = 'test';
 * }
 * console.log(xzy); // don't use globalForWrite.xzy for reading!
 * ```
 */
export {_global as globalForWrite};

declare const Symbol: any;
// When Symbol.iterator doesn't exist, retrieves the key used in es6-shim
let _symbolIterator: any = null;
export function getSymbolIterator(): string|symbol {
  if (!_symbolIterator) {
    if (typeof Symbol !== 'undefined' && Symbol.iterator) {
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

export function scheduleMicroTask(fn: Function) {
  Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}

// JS has NaN !== NaN
export function looseIdentical(a: any, b: any): boolean {
  return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token instanceof Array) {
    return '[' + token.map(stringify).join(', ') + ']';
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();

  if (res == null) {
    return '' + res;
  }

  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
