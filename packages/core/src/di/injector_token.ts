/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from './injection_token';
import type {Injector} from './injector';
import {InjectorMarkers} from './injector_marker';

/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @publicApi
 */
export const INJECTOR = new InjectionToken<Injector>(
  ngDevMode ? 'INJECTOR' : '',
  // Disable tslint because this is const enum which gets inlined not top level prop access.
  // tslint:disable-next-line: no-toplevel-property-access
  InjectorMarkers.Injector as any, // Special value used by Ivy to identify `Injector`.
);
