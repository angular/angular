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
import {recognize as recognizeFnRxjs} from '../recognize_rxjs';
import type {RouterConfigLoader} from '../router_config_loader';
import type {UrlSerializer} from '../url_tree';

const USE_ASYNC_RECOGNIZE = true;

export function recognize(
  injector: EnvironmentInjector,
  configLoader: RouterConfigLoader,
  rootComponentType: Type<any> | null,
  config: Route[],
  serializer: UrlSerializer,
  paramsInheritanceStrategy: 'emptyOnly' | 'always',
  abortSignal: AbortSignal,
): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap((t) => {
    if (USE_ASYNC_RECOGNIZE) {
      return recognizeFn(
        injector,
        configLoader,
        rootComponentType,
        config,
        t.extractedUrl,
        serializer,
        paramsInheritanceStrategy,
        abortSignal,
      ).then(({state: targetSnapshot, tree: urlAfterRedirects}) => {
        return {...t, targetSnapshot, urlAfterRedirects};
      });
    } else {
      return recognizeFnRxjs(
        injector,
        configLoader,
        rootComponentType,
        config,
        t.extractedUrl,
        serializer,
        paramsInheritanceStrategy,
      ).pipe(
        map(({state: targetSnapshot, tree: urlAfterRedirects}) => {
          return {...t, targetSnapshot, urlAfterRedirects};
        }),
      );
    }
  });
}
