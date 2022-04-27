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

import {Route} from '../models.js';
import {recognize as recognizeFn} from '../recognize.js';
import {NavigationTransition} from '../router.js';
import {UrlTree} from '../url_tree.js';

export function recognize(
    rootComponentType: Type<any>|null, config: Route[], serializer: (url: UrlTree) => string,
    paramsInheritanceStrategy: 'emptyOnly'|'always',
    relativeLinkResolution: 'legacy'|'corrected'): MonoTypeOperatorFunction<NavigationTransition> {
  return mergeMap(
      t => recognizeFn(
               rootComponentType, config, t.urlAfterRedirects!, serializer(t.urlAfterRedirects!),
               paramsInheritanceStrategy, relativeLinkResolution)
               .pipe(map(targetSnapshot => ({...t, targetSnapshot}))));
}
