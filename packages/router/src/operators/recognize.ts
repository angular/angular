/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, Type} from '@angular/core';
import {MonoTypeOperatorFunction} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import type {Route} from '../models';
import type {NavigationTransition} from '../navigation_transition';
import {recognize as recognizeFn} from '../recognize';
import type {RouterConfigLoader} from '../router_config_loader';
import type {UrlSerializer} from '../url_tree';

export function recognize(
  injector: EnvironmentInjector,
  configLoader: RouterConfigLoader,
  rootComponentType: Type<any> | null,
  config: Route[],
  serializer: UrlSerializer,
  paramsInheritanceStrategy: 'emptyOnly' | 'always',
  abortSignal: AbortSignal,
): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(async (t) => {
    const {state: targetSnapshot, tree: urlAfterRedirects} = await recognizeFn(
      injector,
      configLoader,
      rootComponentType,
      config,
      t.extractedUrl,
      serializer,
      paramsInheritanceStrategy,
      abortSignal,
    );
    return {...t, targetSnapshot, urlAfterRedirects};
  });
}
