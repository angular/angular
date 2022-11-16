/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Type} from '@angular/core';
import {MonoTypeOperatorFunction} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {Route} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {recognize as recognizeFn} from '../recognize';
import {UrlSerializer} from '../url_tree';

export function recognize(
    injector: EnvironmentInjector, rootComponentType: Type<any>|null, config: Route[],
    serializer: UrlSerializer, paramsInheritanceStrategy: 'emptyOnly'|'always'):
    MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(
      t => recognizeFn(
               injector, rootComponentType, config, t.urlAfterRedirects!,
               serializer.serialize(t.urlAfterRedirects!), serializer, paramsInheritanceStrategy)
               .pipe(map(targetSnapshot => ({...t, targetSnapshot}))));
}
