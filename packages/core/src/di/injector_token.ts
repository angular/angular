/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from './injection_token';
import {Injector} from './injector';
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
    'INJECTOR',
    // Dissable tslint because this is const enum which gets inlined not top level prop access.
    // tslint:disable-next-line: no-toplevel-property-access
    InjectorMarkers.Injector as any,  // Special value used by Ivy to identify `Injector`.
);
