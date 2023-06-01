/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
import '../../util/ng_dev_mode';

import {global} from '../../util/global';

/**
 * A `WeakRef`-compatible reference that fakes the API with a strong reference
 * internally.
 */
class LeakyRef<T>/* implements WeakRef<T> */ {
  constructor(private readonly ref: T) {}

  deref(): T|undefined {
    return this.ref;
  }
}

// `WeakRef` is not always defined in every TS environment where Angular is compiled. Instead,
// read it off of the global context if available.
// tslint:disable-next-line: no-toplevel-property-access
let WeakRefImpl: WeakRefCtor|undefined = global['WeakRef'] ?? LeakyRef;

export interface WeakRef<T extends object> {
  deref(): T|undefined;
}

export function newWeakRef<T extends object>(value: T): WeakRef<T> {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && WeakRefImpl === undefined) {
    throw new Error(`Angular requires a browser which supports the 'WeakRef' API`);
  }
  return new WeakRefImpl!(value);
}

export interface WeakRefCtor {
  new<T extends object>(value: T): WeakRef<T>;
}

export function setAlternateWeakRefImpl(impl: WeakRefCtor) {
  // no-op since the alternate impl is included by default by the framework. Remove once internal
  // migration is complete.
}
