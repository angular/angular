/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentRef, EffectRef, InjectionToken, Injector} from '@angular/core';
import {OperatorFunction} from 'rxjs';
import type {NavigationTransition} from './navigation_transition';

import type {ActivatedRoute} from './router_state';

export interface RouterResourcesFeatureImplementation {
  setupAndRunResources(
    abortSignal: AbortSignal,
  ): OperatorFunction<NavigationTransition, NavigationTransition>;
  createResourceOutletBindingEffects?: (
    componentRef: ComponentRef<unknown>,
    route: ActivatedRoute,
    injector: Injector,
  ) => {createdEffects: EffectRef[]; handledKeys: string[]};
}

export const ROUTER_RESOURCES_FEATURE = new InjectionToken<RouterResourcesFeatureImplementation>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Router Resources Feature' : '',
);
