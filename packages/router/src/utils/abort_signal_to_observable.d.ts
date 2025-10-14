/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
/**
 * Converts an AbortSignal to an Observable<void>.
 * Emits and completes when the signal is aborted.
 * If the signal is already aborted, it emits and completes immediately.
 */
export declare function abortSignalToObservable(signal: AbortSignal): Observable<void>;
export declare function takeUntilAbort<T>(signal: AbortSignal): import("rxjs").MonoTypeOperatorFunction<T>;
