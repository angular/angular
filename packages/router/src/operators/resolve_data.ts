/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction, Observable, OperatorFunction, from, of } from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {NavigationTransition} from '../router';

export function resolveData(paramsInheritanceStrategy: 'emptyOnly' | 'always'):
    MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {
    return source.pipe(mergeMap(t => {
      if (!t.preActivation) {
        throw 'Initialized PreActivation required to check guards';
      }
      return t.preActivation.resolveData(paramsInheritanceStrategy).pipe(map(_ => t));
    }));
  };
}
