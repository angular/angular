/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction, ObservableInput, from} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

/**
 * Perform a side effect through a switchMap for every emission on the source Observable,
 * but return an Observable that is identical to the source. It's essentially the same as
 * the `tap` operator, but if the side effectful `next` function returns an ObservableInput,
 * it will wait before continuing with the original value.
 */
export function switchTap<T>(next: (x: T) => void|ObservableInput<any>):
    MonoTypeOperatorFunction<T> {
  return function(source) {
    return source.pipe(switchMap(v => {
      const nextResult = next(v);
      if (nextResult) {
        return from(nextResult).pipe(map(() => v));
      }
      return from([v]);
    }));
  };
}
