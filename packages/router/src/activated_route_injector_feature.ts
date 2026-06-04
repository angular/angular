/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import {OperatorFunction} from 'rxjs';
import type {NavigationTransition} from './navigation_transition';

export interface ActivatedRouteInjectorFeature {
  operator(): OperatorFunction<NavigationTransition, NavigationTransition>;
}

export const ACTIVATED_ROUTE_INJECTOR_FEATURE = new InjectionToken<ActivatedRouteInjectorFeature>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'ActivatedRoute injector feature' : '',
);
