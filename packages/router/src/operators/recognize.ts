/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {MonoTypeOperatorFunction} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {Route} from '../config';
import {recognize as recognizeFn} from '../recognize';
import {NavigationTransition} from '../router';
import {UrlTree} from '../url_tree';

export function recognize(
    rootComponentType: Type<any>|null, config: Route[], serializer: (url: UrlTree) => string,
    paramsInheritanceStrategy: 'emptyOnly'|'always',
    relativeLinkResolution: 'legacy'|'corrected'): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(
      t => recognizeFn(
               rootComponentType, config, t.urlAfterRedirects, serializer(t.urlAfterRedirects),
               paramsInheritanceStrategy, relativeLinkResolution)
               .pipe(map(targetSnapshot => ({...t, targetSnapshot}))));
}
