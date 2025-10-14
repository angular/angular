/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
function makeKeyValuePair(key, value) {
  return {key: key, value: value};
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 * Passing `null` as the compareFn will use natural ordering of the input.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
let KeyValuePipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'keyvalue',
      pure: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var KeyValuePipe = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      KeyValuePipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    differs;
    constructor(differs) {
      this.differs = differs;
    }
    differ;
    keyValues = [];
    compareFn = defaultComparator;
    transform(input, compareFn = defaultComparator) {
      if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
        return null;
      }
      // make a differ for whatever type we've been passed in
      this.differ ??= this.differs.find(input).create();
      const differChanges = this.differ.diff(input);
      const compareFnChanged = compareFn !== this.compareFn;
      if (differChanges) {
        this.keyValues = [];
        differChanges.forEachItem((r) => {
          this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
        });
      }
      if (differChanges || compareFnChanged) {
        if (compareFn) {
          this.keyValues.sort(compareFn);
        }
        this.compareFn = compareFn;
      }
      return this.keyValues;
    }
  };
  return (KeyValuePipe = _classThis);
})();
export {KeyValuePipe};
export function defaultComparator(keyValueA, keyValueB) {
  const a = keyValueA.key;
  const b = keyValueB.key;
  // If both keys are the same, return 0 (no sorting needed).
  if (a === b) return 0;
  // If one of the keys is `null` or `undefined`, place it at the end of the sort.
  if (a == null) return 1; // `a` comes after `b`.
  if (b == null) return -1; // `b` comes after `a`.
  // If both keys are strings, compare them lexicographically.
  if (typeof a == 'string' && typeof b == 'string') {
    return a < b ? -1 : 1;
  }
  // If both keys are numbers, sort them numerically.
  if (typeof a == 'number' && typeof b == 'number') {
    return a - b;
  }
  // If both keys are booleans, sort `false` before `true`.
  if (typeof a == 'boolean' && typeof b == 'boolean') {
    return a < b ? -1 : 1;
  }
  // Fallback case: if keys are of different types, compare their string representations.
  const aString = String(a);
  const bString = String(b);
  // Compare the string representations lexicographically.
  return aString == bString ? 0 : aString < bString ? -1 : 1;
}
//# sourceMappingURL=keyvalue_pipe.js.map
