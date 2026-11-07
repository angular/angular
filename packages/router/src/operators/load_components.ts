/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {from, MonoTypeOperatorFunction, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import type {NavigationTransition} from '../navigation_transition';
import {RouterConfigLoader} from '../router_config_loader';
import {ActivatedRoute} from '../router_state';
import {TreeNode} from '../utils/tree';

export function loadComponents(
  configLoader: RouterConfigLoader,
): MonoTypeOperatorFunction<NavigationTransition> {
  return switchMap((t) => {
    const loaders = collectComponentLoaders(t.targetRouterState!._root, configLoader);
    return loaders.length === 0 ? of(t) : from(Promise.all(loaders).then(() => t));
  });
}

/**
 * Recursively traverses the router state tree to ensure components are loaded for each route.
 * If a route's component has already been loaded, it is assigned synchronously.
 * Otherwise, if `loadComponent` is present, an asynchronous loader is scheduled and collected.
 */
function collectComponentLoaders(
  node: TreeNode<ActivatedRoute>,
  configLoader: RouterConfigLoader,
): Array<Promise<void>> {
  const loaders: Array<Promise<void>> = [];
  const route = node.value;
  const snapshot = route._futureSnapshot;
  if (snapshot.routeConfig?._loadedComponent) {
    snapshot.component = snapshot.routeConfig._loadedComponent;
    route.component = snapshot.routeConfig._loadedComponent;
  } else if (snapshot.routeConfig?.loadComponent) {
    const injector = snapshot._environmentInjector;
    loaders.push(
      configLoader.loadComponent(injector, snapshot.routeConfig).then((loadedComponent) => {
        snapshot.component = loadedComponent;
        route.component = loadedComponent;
      }),
    );
  }
  for (const child of node.children) {
    loaders.push(...collectComponentLoaders(child, configLoader));
  }
  return loaders;
}
