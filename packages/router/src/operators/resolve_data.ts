/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction, Observable} from 'rxjs';

import {NavigationTransition} from '../router';
import {asyncTap} from './async_tap';

export function resolveData(paramsInheritanceStrategy: 'emptyOnly' | 'always'):
    MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {
    return source.pipe(asyncTap(t => {
      if (!t.preActivation) {
        throw new Error('PreActivation required to resolve data');
      }
      return t.preActivation.resolveData(paramsInheritanceStrategy);
    }));
  };
}
