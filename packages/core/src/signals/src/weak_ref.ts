/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from '../../util/global';

// `WeakRef` is not always defined in every TS environment where Angular is compiled. Instead,
// read it off of the global context if available.
// tslint:disable-next-line: no-toplevel-property-access
let WeakRefImpl: WeakRefCtor|undefined = global['WeakRef'];

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

/**
 * Use an alternate implementation of `WeakRef` if a platform implementation isn't available.
 */
export function setAlternateWeakRefImpl(impl: WeakRefCtor) {
  if (!WeakRefImpl) {
    WeakRefImpl = impl;
  }
}
