/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {filter, map, scan, startWith, switchMap, take} from 'rxjs/operators';

import {isUrlTree, UrlTree} from '../url_tree';

const INITIAL_VALUE = Symbol('INITIAL_VALUE');
declare type INTERIM_VALUES = typeof INITIAL_VALUE | boolean | UrlTree;

export function prioritizedGuardValue():
    OperatorFunction<Observable<boolean|UrlTree>[], boolean|UrlTree> {
  return switchMap(obs => {
    return combineLatest(obs.map(o => o.pipe(take(1), startWith(INITIAL_VALUE as INTERIM_VALUES))))
        .pipe(
            map((results: INTERIM_VALUES[]) => {
              for (const result of results) {
                if (result === true) {
                  // If result is true, check the next one
                  continue;
                } else if (result === INITIAL_VALUE) {
                  // If guard has not finished, we need to stop processing.
                  return INITIAL_VALUE;
                } else if (result === false || result instanceof UrlTree) {
                  // Result finished and was not true. Return the result.
                  // Note that we only allow false/UrlTree. Other values are considered invalid and
                  // ignored.
                  return result;
                }
              }
              // Everything resolved to true. Return true.
              return true;
            }),
            filter((item): item is boolean|UrlTree => item !== INITIAL_VALUE),
            take(1),
        );
  });
}
