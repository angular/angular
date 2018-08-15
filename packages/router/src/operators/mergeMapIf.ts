/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EMPTY, MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import {mergeMap} from 'rxjs/operators';

export function mergeMapIf<T>(
    predicate: (value: T) => boolean, tap: (value: T) => any): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    return source.pipe(mergeMap(s => {
      if (predicate(s)) {
        tap(s);
        return EMPTY;
      }
      return of (s);
    }));
  };
}
