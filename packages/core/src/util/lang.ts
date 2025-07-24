/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Subscribable} from 'rxjs';

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is a Subscribable
 */
export function isSubscribable<T>(obj: any | Subscribable<T>): obj is Subscribable<T> {
  return !!obj && typeof obj.subscribe === 'function';
}
