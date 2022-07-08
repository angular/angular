/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {filter, map, startWith, switchMap, take} from 'rxjs/operators';

import {UrlTree} from '../url_tree';

const INITIAL_VALUE = Symbol();
declare type INTERIM_VALUES = typeof INITIAL_VALUE | boolean | UrlTree;

/**
 * Takes an array of observables and returns the result of the first to emit something other than
 * `true`.
 *
 * If all Observables emit `true`, then this operator emits true.
 * Also note that only the first value of each observable is used.
 */
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
                } else {
                  // Result finished and was not true. Return the result.
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
