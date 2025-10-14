/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Subscribable } from 'rxjs';
/**
 * Determine if the argument is shaped like a Promise
 */
export declare function isPromise<T = any>(obj: any): obj is Promise<T>;
/**
 * Determine if the argument is a Subscribable
 */
export declare function isSubscribable<T>(obj: any | Subscribable<T>): obj is Subscribable<T>;
