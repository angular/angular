/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import {assertLessThan} from '../util/assert';

import {InjectionToken} from './injection_token';
import type {Injector} from './injector';
import {InjectorMarkers} from './injector_marker';

function createTokenWithInjectionMarker<T>(
  desc: string,
  marker: number,
  options?: {
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
    factory: () => T;
  },
): InjectionToken<T> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertLessThan(marker, 0, 'Only negative numbers are supported here');
  }
  const token = new InjectionToken<T>(desc, options);
  (token as any).__NG_ELEMENT_ID__ = marker;
  return token;
}

/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @publicApi
 */
export const INJECTOR = createTokenWithInjectionMarker<Injector>(
  ngDevMode ? 'INJECTOR' : '',
  // Disable tslint because this is const enum which gets inlined not top level prop access.
  // tslint:disable-next-line: no-toplevel-property-access
  InjectorMarkers.Injector, // Special value used by Ivy to identify `Injector`.
);
