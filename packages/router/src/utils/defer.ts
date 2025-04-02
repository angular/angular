/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';

// `defer` from RxJS pulls in `from()` internally.
export const defer = <T>(observableFactory: () => Observable<T>) =>
  new Observable<T>((subscriber) => observableFactory().subscribe(subscriber));
