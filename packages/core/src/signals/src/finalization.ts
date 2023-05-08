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

export interface FinalizationRegistry<T> {
  register(target: object, heldValue: T, unregisterToken?: object): void;
  unregister(unregisterToken: object): void;
}

export interface FinalizationRegistryCtor {
  new<T>(cleanupCallback: (heldValue: T) => void): FinalizationRegistry<T>;
}

class LeakyFinalizationRegistry<T> implements FinalizationRegistry<T> {
  register(): void {}
  unregister(): void {}
}

// `FinalizationRegistry` is not always defined in every TS environment where Angular is compiled.
// Instead, read it off of the global context if available.
let FinalizationRegistryImpl: FinalizationRegistryCtor|undefined =
    // tslint:disable-next-line: no-toplevel-property-access
    global['FinalizationRegistry'] ?? LeakyFinalizationRegistry;

export interface WeakRef<T extends object> {
  deref(): T|undefined;
}

export function newFinalizationRegistry<T>(cleanupCallback: (heldValue: T) => void):
    FinalizationRegistry<T> {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && FinalizationRegistryImpl === undefined) {
    throw new Error(`Angular requires a browser which supports the 'FinalizationRegistry' API`);
  }
  return new FinalizationRegistryImpl!(cleanupCallback);
}

export function setAlternateWeakRefImpl(impl: unknown) {
  // no-op since the alternate impl is included by default by the framework. Remove once internal
  // migration is complete.
}
