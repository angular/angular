/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {filter, map, startWith, switchMap, take} from 'rxjs/operators';

import {GuardResult, RedirectCommand} from '../models';
import {isUrlTree, UrlTree} from '../url_tree';

const INITIAL_VALUE = /* @__PURE__ */ Symbol('INITIAL_VALUE');
declare type INTERIM_VALUES = typeof INITIAL_VALUE | GuardResult;

export function prioritizedGuardValue(): OperatorFunction<Observable<GuardResult>[], GuardResult> {
  return switchMap((obs) => {
    return combineLatest(
      obs.map((o) => o.pipe(take(1), startWith(INITIAL_VALUE as INTERIM_VALUES))),
    ).pipe(
      map((results: INTERIM_VALUES[]) => {
        for (const result of results) {
          if (result === true) {
            // If result is true, check the next one
            continue;
          } else if (result === INITIAL_VALUE) {
            // If guard has not finished, we need to stop processing.
            return INITIAL_VALUE;
          } else if (result === false || isRedirect(result)) {
            // Result finished and was not true. Return the result.
            // Note that we only allow false/UrlTree/RedirectCommand. Other values are considered invalid and
            // ignored.
            return result;
          }
        }
        // Everything resolved to true. Return true.
        return true;
      }),
      filter((item): item is GuardResult => item !== INITIAL_VALUE),
      take(1),
    );
  });
}

function isRedirect(val: INTERIM_VALUES): val is UrlTree | RedirectCommand {
  return isUrlTree(val) || val instanceof RedirectCommand;
}
