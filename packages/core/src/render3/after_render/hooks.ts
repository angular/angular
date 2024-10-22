/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertInInjectionContext} from '../../di';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {performanceMarkFeature} from '../../util/performance';
import {assertNotInReactiveContext} from '../reactivity/asserts';
import {isPlatformBrowser} from '../util/misc_utils';
import {AfterRenderPhase, AfterRenderRef} from './api';
import {
  type CleanupRegisterFn,
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
 * Options passed to `afterRender` and `afterNextRender`.
 *
 * @developerPreview
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

  /**
   * The phase the callback should be invoked in.
   *
   * <div class="alert is-critical">
   *
   * Defaults to `AfterRenderPhase.MixedReadWrite`. You should choose a more specific
   * phase instead. See `AfterRenderPhase` for more information.
   *
   * </div>
   *
   * @deprecated Specify the phase for your callback to run in by passing a spec-object as the first
   *   parameter to `afterRender` or `afterNextRender` instead of a function.
   */
  phase?: AfterRenderPhase;
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
 * <div class="alert is-critical">
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
 * <div class="alert is-important">
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
 * Use `afterRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   @ViewChild('content') contentRef: ElementRef;
 *
 *   constructor() {
 *     afterRender({
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
export function afterRender<E = never, W = never, M = never>(
  spec: {
    earlyRead?: (onCleanup: CleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailable<[E]>, CleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailable<[W, E]>, CleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailable<[M, W, E]>, CleanupRegisterFn]) => void;
  },
  options?: Omit<AfterRenderOptions, 'phase'>,
): AfterRenderRef;

/**
 * Register a callback to be invoked each time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="alert is-critical">
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
 * <div class="alert is-important">
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
 * Use `afterRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   @ViewChild('content') contentRef: ElementRef;
 *
 *   constructor() {
 *     afterRender({
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
export function afterRender(
  callback: (onCleanup: CleanupRegisterFn) => void,
  options?: AfterRenderOptions,
): AfterRenderRef;

export function afterRender(
  callbackOrSpec:
    | ((onCleanup: CleanupRegisterFn) => void)
    | {
        earlyRead?: (onCleanup: CleanupRegisterFn) => unknown;
        write?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        mixedReadWrite?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        read?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  ngDevMode &&
    assertNotInReactiveContext(
      afterRender,
      'Call `afterRender` outside of a reactive context. For example, schedule the render ' +
        'callback inside the component constructor`.',
    );

  !options?.injector && assertInInjectionContext(afterRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterRender');

  return afterRenderImpl(callbackOrSpec, injector, options, /* once */ false);
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
 * <div class="alert is-critical">
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
 * <div class="alert is-important">
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
 * ```ts
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
    earlyRead?: (onCleanup: CleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailable<[E]>, CleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailable<[W, E]>, CleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailable<[M, W, E]>, CleanupRegisterFn]) => void;
  },
  options?: Omit<AfterRenderOptions, 'phase'>,
): AfterRenderRef;

/**
 * Register a callback to be invoked the next time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="alert is-critical">
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
 * <div class="alert is-important">
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
 * ```ts
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
export function afterNextRender(
  callback: (onCleanup: CleanupRegisterFn) => void,
  options?: AfterRenderOptions,
): AfterRenderRef;

export function afterNextRender(
  callbackOrSpec:
    | ((onCleanup: CleanupRegisterFn) => void)
    | {
        earlyRead?: (onCleanup: CleanupRegisterFn) => unknown;
        write?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        mixedReadWrite?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        read?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  !options?.injector && assertInInjectionContext(afterNextRender);
  const injector = options?.injector ?? inject(Injector);

  if (!isPlatformBrowser(injector)) {
    return NOOP_AFTER_RENDER_REF;
  }

  performanceMarkFeature('NgAfterNextRender');

  return afterRenderImpl(callbackOrSpec, injector, options, /* once */ true);
}

type AfterRenderPhaseHook = (
  ...args:
    | [onCleanup: CleanupRegisterFn]
    | [previousPhaseValue: unknown, onCleanup: CleanupRegisterFn]
) => unknown;

type AfterRenderPhaseHooks = [
  /*      EarlyRead */ AfterRenderPhaseHook | undefined,
  /*          Write */ AfterRenderPhaseHook | undefined,
  /* MixedReadWrite */ AfterRenderPhaseHook | undefined,
  /*           Read */ AfterRenderPhaseHook | undefined,
];

class AfterNextRenderSequence extends AfterRenderSequence {
  constructor(
    impl: AfterRenderImpl,
    hooks: AfterRenderPhaseHooks,
    once: boolean,
    destroyRef: DestroyRef | null,
  ) {
    // Note that we also initialize the underlying `AfterRenderSequence` hooks to `undefined` and
    // populate them as we create reactive nodes below.
    super(impl, [undefined, undefined, undefined, undefined], once, destroyRef);

    for (const phase of AfterRenderImpl.PHASES) {
      const hook = hooks[phase];
      if (hook === undefined) {
        continue;
      }
      this.hooks[phase] = (value) => {
        this.runCleanup(phase);
        const args: unknown[] = [];
        if (value !== undefined) {
          args.push(value);
        }
        args.push(this.getRegisterCleanupFn(phase));
        hook.apply(null, args as any);
      };
    }
  }
}

/**
 * Shared implementation for `afterRender` and `afterNextRender`.
 */
function afterRenderImpl(
  callbackOrSpec:
    | ((onCleanup: CleanupRegisterFn) => void)
    | {
        earlyRead?: (onCleanup: CleanupRegisterFn) => unknown;
        write?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        mixedReadWrite?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => unknown;
        read?: (r: unknown | undefined, onCleanup: CleanupRegisterFn) => void;
      },
  injector: Injector,
  options: AfterRenderOptions | undefined,
  once: boolean,
): AfterRenderRef {
  const manager = injector.get(AfterRenderManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterRender` and `afterNextRender` aren't used.
  manager.impl ??= injector.get(AfterRenderImpl);

  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;

  let spec = callbackOrSpec;
  if (typeof spec === 'function') {
    spec = {mixedReadWrite: callbackOrSpec as any};
  }

  const hooks = [
    spec.earlyRead,
    spec.write,
    spec.mixedReadWrite,
    spec.read,
  ] as AfterRenderPhaseHooks;
  const sequence = new AfterNextRenderSequence(manager.impl, hooks, once, destroyRef);
  manager.impl.register(sequence);
  return sequence;
}

/** `AfterRenderRef` that does nothing. */
export const NOOP_AFTER_RENDER_REF: AfterRenderRef = {
  destroy() {},
};
