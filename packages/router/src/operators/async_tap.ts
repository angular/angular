/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction, ObservableInput, from} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

export function asyncTap<T>(next: (x: T) => void|ObservableInput<any>):
    MonoTypeOperatorFunction<T> {
  return function(source) {
    return source.pipe(mergeMap(v => {
      const nextResult = next(v);
      if (nextResult) {
        return from(nextResult).pipe(map(() => v));
      }
      return from([v]);
    }));
  };
}
