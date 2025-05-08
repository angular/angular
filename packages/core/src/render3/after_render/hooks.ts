/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TracingService} from '../../application/tracing';
import {assertInInjectionContext} from '../../di';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {performanceMarkFeature} from '../../util/performance';
import {assertNotInReactiveContext} from '../reactivity/asserts';
import {ViewContext} from '../view_context';
import {AfterRenderRef} from './api';
import {
  AfterRenderHooks,
  AfterRenderImpl,
  AfterRenderManager,
  AfterRenderSequence,
} from './manager';

/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
export type ɵFirstAvailable<T extends unknown[]> = T extends [infer H, ...infer R]
  ? [H] extends [never]
    ? ɵFirstAvailable<R>
    : [H]
  : [];

/**
 * Options passed to `afterEveryRender` and `afterNextRender`.
 *
 * @publicApi 20.0
 */
export interface AfterRenderOptions {
  /**
   * The `Injector` to use during creation.
   *
   * If this is not provided, the current injection context will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * Whether the hook should require manual cleanup.
   *
   * If this is `false` (the default) the hook will automatically register itself to be cleaned up
   * with the current `DestroyRef`.
   */
  manualCleanup?: boolean;
}

/**
 * Register callbacks to be invoked each time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *after each render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterEveryRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   @ViewChild('content') contentRef: ElementRef;
 *
 *   constructor() {
 *     afterEveryRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterEveryRender<E = never, W = never, M = never>(
  spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
  },
  options?: AfterRenderOptions,
): AfterRenderRef;

/**
 * Register a callback to be invoked each time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - once per render
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterEveryRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   @ViewChild('content') contentRef: ElementRef;
 *
 *   constructor() {
 *     afterEveryRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export function afterEveryRender(
  callback: VoidFunction,
  options?: AfterRenderOptions,
): AfterRenderRef;

export function afterEveryRender(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  ngDevMode &&
    assertNotInReactiveContext(
      afterEveryRender,
      'Call `afterEveryRender` outside of a reactive context. For example, schedule the render ' +
        'callback inside the component constructor`.',
    );

  !options?.injector && assertInInjectionContext(afterEveryRender);
  const injector = options?.injector ?? inject(Injector);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterRender');

  return afterEveryRenderImpl(callbackOrSpec, injector, options, /* once */ false);
}

/**
 * Register callbacks to be invoked the next time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *once, after the next render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterNextRender` to read or write the DOM once,
 * for example to initialize a non-Angular library.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-chart-cmp',
 *   template: `<div #chart>{{ ... }}</div>`,
 * })
 * export class MyChartCmp {
 *   @ViewChild('chart') chartRef: ElementRef;
 *   chart: MyChart|null;
 *
 *   constructor() {
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef.nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @developerPreview
 */
export function afterNextRender<E = never, W = never, M = never>(
  spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
  },
  options?: AfterRenderOptions,
): AfterRenderRef;

/**
 * Register a callback to be invoked the next time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterNextRender` to read or write the DOM once,
 * for example to initialize a non-Angular library.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-chart-cmp',
 *   template: `<div #chart>{{ ... }}</div>`,
 * })
 * export class MyChartCmp {
 *   @ViewChild('chart') chartRef: ElementRef;
 *   chart: MyChart|null;
 *
 *   constructor() {
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef.nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @publicApi 20.0
 */
export function afterNextRender(
  callback: VoidFunction,
  options?: AfterRenderOptions,
): AfterRenderRef;

export function afterNextRender(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  !options?.injector && assertInInjectionContext(afterNextRender);
  const injector = options?.injector ?? inject(Injector);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterNextRender');

  return afterEveryRenderImpl(callbackOrSpec, injector, options, /* once */ true);
}

function getHooks(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
): AfterRenderHooks {
  if (callbackOrSpec instanceof Function) {
    return [undefined, undefined, /* MixedReadWrite */ callbackOrSpec, undefined];
  } else {
    return [
      callbackOrSpec.earlyRead,
      callbackOrSpec.write,
      callbackOrSpec.mixedReadWrite,
      callbackOrSpec.read,
    ];
  }
}

/**
 * Shared implementation for `afterEveryRender` and `afterNextRender`.
 */
function afterEveryRenderImpl(
  callbackOrSpec:
    | VoidFunction
    | {
        earlyRead?: () => unknown;
        write?: (r?: unknown) => unknown;
        mixedReadWrite?: (r?: unknown) => unknown;
        read?: (r?: unknown) => void;
      },
  injector: Injector,
  options: AfterRenderOptions | undefined,
  once: boolean,
): AfterRenderRef {
  const manager = injector.get(AfterRenderManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterEveryRender` and `afterNextRender` aren't used.
  manager.impl ??= injector.get(AfterRenderImpl);

  const tracing = injector.get(TracingService, null, {optional: true});

  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  const viewContext = injector.get(ViewContext, null, {optional: true});
  const sequence = new AfterRenderSequence(
    manager.impl,
    getHooks(callbackOrSpec),
    viewContext?.view,
    once,
    destroyRef,
    tracing?.snapshot(null),
  );
  manager.impl.register(sequence);
  return sequence;
}

/** `AfterRenderRef` that does nothing. */
export const NOOP_AFTER_RENDER_REF: AfterRenderRef = {
  destroy() {},
};
