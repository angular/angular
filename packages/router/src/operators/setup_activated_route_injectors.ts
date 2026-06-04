/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OperatorFunction} from 'rxjs';
import {ActivatedRoute, ActivatedRouteSnapshot} from '../router_state';
import {TreeNode} from '../utils/tree';
import {NavigationTransition} from '../navigation_transition';
import {createEnvironmentInjector} from '@angular/core';
import {tap} from 'rxjs/operators';

export function setupActivatedRouteInjectors(): OperatorFunction<
  NavigationTransition,
  NavigationTransition
> {
  return tap(({newlyCreatedRoutes, targetRouterState}) => {
    if (!newlyCreatedRoutes || !targetRouterState) {
      return;
    }

    // Obviously the easier way would be to just iterate newlyCreatedRoutes
    // and create injectors for them. However, the feature will eventually
    // want to do things for routes that are being reused.
    const traverse = (stateNode: TreeNode<ActivatedRoute>) => {
      const route = stateNode.value;
      if (route) {
        processRoute(route, newlyCreatedRoutes);
      }

      for (const childState of stateNode.children) {
        traverse(childState);
      }
    };

    traverse(targetRouterState._root);
  });
}

function processRoute(route: ActivatedRoute, newlyCreatedRoutes: Set<ActivatedRoute>) {
  // Only create injectors for routes with the feature enabled
  const useActivatedRouteInjector = (route?.routeConfig as any)?.ɵUseActivatedRouteInjector;
  if (!useActivatedRouteInjector) {
    return;
  }

  if (newlyCreatedRoutes.has(route)) {
    setupNewActivatedRouteInjector(route._futureSnapshot, route);
  } else {
    // TODO: Do something with injectors that already exist
  }
}

function setupNewActivatedRouteInjector(snapshot: ActivatedRouteSnapshot, route: ActivatedRoute) {
  if (ngDevMode && !!route._localInjector) {
    throw new Error(
      'invalid state: _localInjector should not exist on newly created ActivatedRoute yet',
    );
  }
  route._localInjector = createEnvironmentInjector([], snapshot._environmentInjector);
}
