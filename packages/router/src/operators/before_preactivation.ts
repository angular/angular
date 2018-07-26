/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {RouterHook} from '../router';
import {RouterStateSnapshot} from '../router_state';
import {UrlTree} from '../url_tree';

export function beforePreactivation(
    hook: RouterHook, navigationId: number, appliedUrlTree: UrlTree, rawUrlTree: UrlTree,
    skipLocationChange: boolean, replaceUrl: boolean):
    MonoTypeOperatorFunction<{appliedUrl: UrlTree, snapshot: RouterStateSnapshot}> {
  return function(source) {
    return source.pipe(mergeMap(
        p => hook(
                 p.snapshot,
                 {
                     navigationId, appliedUrlTree, rawUrlTree, skipLocationChange, replaceUrl,
                 })
                 .pipe(map(() => p))));
  };
}
