/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';

/**
 * Injection token for a `TracingService`, optionally provided.
 */
export const TracingService = new InjectionToken<TracingService<unknown>>('');

/**
 * Tracing mechanism which can associate causes (snapshots) with runs of subsequent operations.
 *
 * Not defined by Angular directly, but defined in contexts where tracing is desired.
 */
export interface TracingService<TSnapshot> {
  /**
   * Take a snapshot of the current context which will be stored by Angular and used when additional
   * work is performed that was scheduled in this context.
   */
  snapshot(): TSnapshot;

  /**
   * Invoke `fn` within the given tracing snapshot, which may be `undefined`.
   *
   * This _must_ return the result of the function invocation.
   */
  run<T>(fn: () => T, snapshot: TSnapshot | undefined): T;
}
