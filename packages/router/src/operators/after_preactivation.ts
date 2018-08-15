/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {NavigationTransition, RouterHook} from '../router';

export function afterPreactivation(hook: RouterHook):
    MonoTypeOperatorFunction<NavigationTransition> {
  return function(source) {
    return source.pipe(mergeMap(t => hook(t.targetSnapshot !, {
                                       navigationId: t.id,
                                       appliedUrlTree: t.extractedUrl,
                                       rawUrlTree: t.rawUrl,
                                       skipLocationChange: !!t.extras.skipLocationChange,
                                       replaceUrl: !!t.extras.replaceUrl,
                                     }).pipe(map(() => t))));
  };
}
