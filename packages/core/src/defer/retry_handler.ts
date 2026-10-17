/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di';
import type {EnvironmentProviders} from '../di/interface/provider';
import {makeEnvironmentProviders} from '../di/provider_collection';

/**
 * Context passed to a `DeferBlockRetryHandler` before each retry round of an
 * `@defer` block.
 *
 * @developerPreview 22.2
 */
export interface DeferBlockRetryContext {
  /**
   * One-based retry number. `1` is the first retry after the initial load
   * fails.
   */
  readonly attempt: number;

  /** Number of retries configured by `@error (retry N)`. */
  readonly maxRetryCount: number;

  /** Loading error from the previous round. */
  readonly error: unknown;

  /**
   * Starts the next loading round. It can be called immediately or later, for
   * example after a timer or connectivity event.
   *
   * Only the first call has an effect. Once loading starts, a later handler
   * rejection cannot cancel the round.
   */
  retry(): void;
}

/**
 * Runs before each retry round of an `@defer` block.
 *
 * The handler controls when the next round starts by calling `context.retry()`.
 * Angular still owns dependency loading and retries only dependencies that have
 * not succeeded.
 *
 * Throwing or returning a rejected promise before calling `retry()` stops the
 * sequence. The block reports the previous loading error, not the handler error.
 * Returning without calling `retry()` leaves the block loading.
 *
 * The handler runs in the defer block's injection context, so it can call
 * `inject()` synchronously. It runs only in the browser.
 *
 * @developerPreview 22.2
 */
export type DeferBlockRetryHandler = (context: DeferBlockRetryContext) => void | Promise<void>;

/**
 * Token configured by {@link provideDeferBlockRetryHandler}.
 *
 * @internal
 */
export const DEFER_BLOCK_RETRY_HANDLER = new InjectionToken<DeferBlockRetryHandler>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'DEFER_BLOCK_RETRY_HANDLER' : '',
);

/**
 * Configures the handler used by retry-enabled `@defer` blocks.
 *
 * Use a handler to add behavior such as telemetry or exponential backoff. The
 * handler runs before each retry and starts the round by calling `ctx.retry()`.
 *
 * ```ts
 * import {provideDeferBlockRetryHandler} from '@angular/core';
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideDeferBlockRetryHandler((ctx) => {
 *       reportRetry(ctx.attempt, ctx.error);
 *       setTimeout(() => ctx.retry(), 2 ** ctx.attempt * 100);
 *     }),
 *   ],
 * });
 * ```
 *
 * @developerPreview 22.2
 *
 * @see [Customizing retry behavior](guide/templates/defer#customizing-retry-behavior)
 */
export function provideDeferBlockRetryHandler(
  handler: DeferBlockRetryHandler,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: DEFER_BLOCK_RETRY_HANDLER,
      useValue: handler,
    },
  ]);
}
