/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

export function throwIf<T>(
    predicate: (value: T) => boolean,
    errorFactory: (() => any) = defaultErrorFactory): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    return source.pipe(tap(s => {
      if (predicate(s)) {
        throw errorFactory();
      }
    }));
  };
}

function defaultErrorFactory() {
  return new Error();
}