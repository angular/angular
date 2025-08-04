/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EnvironmentInjector,
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import {MonoTypeOperatorFunction, of} from 'rxjs';
import {map, mergeMap, switchMap} from 'rxjs/operators';

import type {Route} from '../models';
import type {NavigationTransition} from '../navigation_transition';
import {recognize as recognizeFn} from '../recognize';
import {recognize as recognizeFnRxjs} from '../recognize_rxjs';
import type {RouterConfigLoader} from '../router_config_loader';
import type {UrlSerializer} from '../url_tree';

const USE_ASYNC_RECOGNIZE = true;

const RECOGNIZE_IMPL = new InjectionToken<typeof recognizeFn | typeof recognizeFnRxjs>(
  'RECOGNIZE_IMPL',
  {
    providedIn: 'root',
    factory: () => {
      if (!USE_ASYNC_RECOGNIZE) {
        return recognizeFnRxjs;
      }
      return recognizeFn;
    },
  },
);

/**
 * Provides a way to use the synchronous version of the recognize function using rxjs.
 */
export function provideSometimesSyncRecognize(): EnvironmentProviders {
  return makeEnvironmentProviders([{provide: RECOGNIZE_IMPL, useValue: recognizeFnRxjs}]);
}

export function recognize(
  injector: EnvironmentInjector,
  configLoader: RouterConfigLoader,
  rootComponentType: Type<any> | null,
  config: Route[],
  serializer: UrlSerializer,
  paramsInheritanceStrategy: 'emptyOnly' | 'always',
  abortSignal: AbortSignal,
): MonoTypeOperatorFunction<NavigationTransition> {
  // TODO(atscott): Simplify once we do not need to support both forms of recognize
  const recognizeImpl = injector.get(RECOGNIZE_IMPL);
  return mergeMap((t) =>
    of(t).pipe(
      switchMap((t) =>
        recognizeImpl(
          injector,
          configLoader,
          rootComponentType,
          config,
          t.extractedUrl,
          serializer,
          paramsInheritanceStrategy,
          abortSignal,
        ),
      ),
      map(({state: targetSnapshot, tree: urlAfterRedirects}) => {
        return {...t, targetSnapshot, urlAfterRedirects};
      }),
    ),
  );
}
