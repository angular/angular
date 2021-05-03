/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {filter, map, scan, startWith, switchMap, take} from 'rxjs/operators';

import {UrlTree} from '../url_tree';
import {isUrlTree} from '../utils/type_guards';

const INITIAL_VALUE = Symbol('INITIAL_VALUE');
declare type INTERIM_VALUES = typeof INITIAL_VALUE | boolean | UrlTree;

export function prioritizedGuardValue():
    OperatorFunction<Observable<boolean|UrlTree>[], boolean|UrlTree> {
  return switchMap(obs => {
    return combineLatest(obs.map(o => o.pipe(take(1), startWith(INITIAL_VALUE as INTERIM_VALUES))))
               .pipe(
                   scan(
                       (acc: INTERIM_VALUES, list: INTERIM_VALUES[]) => {
                         let isPending = false;
                         return list.reduce((innerAcc, val, i: number) => {
                           if (innerAcc !== INITIAL_VALUE) return innerAcc;

                           // Toggle pending flag if any values haven't been set yet
                           if (val === INITIAL_VALUE) isPending = true;

                           // Any other return values are only valid if we haven't yet hit a pending
                           // call. This guarantees that in the case of a guard at the bottom of the
                           // tree that returns a redirect, we will wait for the higher priority
                           // guard at the top to finish before performing the redirect.
                           if (!isPending) {
                             // Early return when we hit a `false` value as that should always
                             // cancel navigation
                             if (val === false) return val;

                             if (i === list.length - 1 || isUrlTree(val)) {
                               return val;
                             }
                           }

                           return innerAcc;
                         }, acc);
                       },
                       INITIAL_VALUE),
                   filter(item => item !== INITIAL_VALUE),
                   map(item => isUrlTree(item) ? item : item === true),  //
                   take(1)) as Observable<boolean|UrlTree>;
  });
}
