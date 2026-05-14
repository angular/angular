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
 * Context passed to a `DeferBlockRetryHandler` for each load attempt of a
 * `@defer` block dependency.
 *
 * @developerPreview 22.0
 */
export interface DeferBlockRetryContext<T = unknown> {
  /**
   * Zero-based attempt counter. `0` is the initial attempt; subsequent
   * values correspond to retries triggered by `@error (retry N)`.
   */
  readonly attempt: number;

  /**
   * Re-issues the chunk download with a cache-busting query parameter
   * appended to the URL, returning a Promise of the same shape as `load()`.
   *
   * Use this from custom handlers to add features like backoff, jitter, or
   * logging on top of Angular's built-in cache-busting.
   *
   * ```ts
   * const backoff: DeferBlockRetryHandler = async (load, ctx) => {
   *   if (ctx.attempt === 0) {
   *     return load();
   *   }
   *   await new Promise((r) => setTimeout(r, 2 ** ctx.attempt * 100));
   *   return ctx.retry();
   * };
   * ```
   */
  retry(): Promise<T>;
}

/**
 * A function that customizes how a `@defer` block dependency is (re)loaded
 * when `@error (retry N)` recovers from a failed dynamic `import()`.
 *
 * The handler is invoked for every attempt, both the initial load and any
 * subsequent retries, receiving the compiler-generated thunk (`() =>
 * import('./chunk').then(m => m.Cmp)`) and a {@link DeferBlockRetryContext}
 * describing the current attempt. Use it to layer behavior like exponential
 * backoff, telemetry, or CDN failover on top of Angular's built-in
 * cache-busting.
 *
 * @developerPreview 22.0
 */
export type DeferBlockRetryHandler = <T>(
  load: () => Promise<T>,
  context: DeferBlockRetryContext<T>,
) => Promise<T>;

const DEFER_IMPORT_URL_PATTERN = /import\(\s*["']([^"']+)["']\s*\)/;
// Captures the symbol name from the compiler-emitted `.then(m => m.<symbol>)`
// mapping. Default imports also surface here as the literal `default`, so a
// separate default-export pattern isn't needed.
const DEFER_EXPORT_NAME_PATTERN = /\.then\(\s*\(?\s*[\w$]+\s*\)?\s*=>\s*[\w$]+\.([\w$]+)\s*\)/;

const defaultDeferBlockRetryHandler: DeferBlockRetryHandler = <T>(
  load: () => Promise<T>,
  ctx: DeferBlockRetryContext<T>,
): Promise<T> => (ctx.attempt === 0 ? load() : ctx.retry());

/**
 * Cache-busting reload used by `DeferBlockRetryContext.retry()`.
 *
 * Extracts the chunk URL from the thunk source via
 * `Function.prototype.toString`, appends `?ngRetry=N`, and re-issues the
 * dynamic import, sidestepping the browser's permanent cache of failed
 * `import()` results. Falls back to plain re-invocation when the source
 * can't be parsed.
 */
export function reloadDeferDependencyWithCacheBust<T>(
  load: () => Promise<T>,
  attempt: number,
): Promise<T> {
  let source: string;
  try {
    source = load.toString();
  } catch {
    return load();
  }
  const match = DEFER_IMPORT_URL_PATTERN.exec(source);
  if (!match) {
    return load();
  }
  const retryUrl = appendRetryQueryParam(match[1], attempt);

  // Retry the failed deferred import using a runtime URL.
  //
  // Vite/esbuild only analyze dynamic imports with static targets, so using a
  // variable keeps this retry import from being bundled back into the original
  // chunk request.
  //
  // `@vite-ignore` must stay as its own exact comment so Vite suppresses the
  // "dynamic import cannot be analyzed" warning.
  return import(/* @vite-ignore */ retryUrl).then((mod) => {
    // Preserve the original thunk behavior: `.then(m => m.<symbol>)`.
    const exportMatch = DEFER_EXPORT_NAME_PATTERN.exec(source);
    return exportMatch ? mod[exportMatch[1]] : mod;
  });
}

/**
 * Appends a cache-busting query parameter to a URL-like string. Tolerant of
 * relative paths, existing query strings, and fragments.
 */
function appendRetryQueryParam(url: string, attempt: number): string {
  return `${url}?ngRetry=${attempt}`;
}

/**
 * Apps customize the handler via {@link provideDeferBlockRetryHandler}
 * @internal
 */
export const DEFER_BLOCK_RETRY_HANDLER = new InjectionToken<DeferBlockRetryHandler>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'DEFER_BLOCK_RETRY_HANDLER' : '',
  {
    factory: () => defaultDeferBlockRetryHandler,
  },
);

/**
 * Configures Angular to use the given function as the retry handler for every
 * `@defer` block dependency.
 *
 * Use this to add behavior like telemetry, exponential backoff, CDN failover,
 * or integrity checks on top of the built-in cache-busting that powers
 * `@error (retry N)`. The handler is invoked for every load attempt, both the
 * initial load and any retries, and replaces Angular's default behavior.
 *
 * ```ts
 * import {provideDeferBlockRetryHandler} from '@angular/core';
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideDeferBlockRetryHandler(async (load, ctx) => {
 *       if (ctx.attempt === 0) return load();
 *       await new Promise((r) => setTimeout(r, 2 ** ctx.attempt * 100));
 *       return ctx.retry();
 *     }),
 *   ],
 * });
 * ```
 *
 * @developerPreview 22.0
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
