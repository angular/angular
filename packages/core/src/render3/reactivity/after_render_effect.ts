/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerPollProducersForChange,
  producerAccessed,
  SIGNAL,
  SIGNAL_NODE,
  type SignalNode,
  type EffectCleanupFn,
  type EffectCleanupRegisterFn,
} from '../../../primitives/signals';

import {type Signal} from '../reactivity/api';

import {TracingService, TracingSnapshot} from '../../application/tracing';
import {
  ChangeDetectionScheduler,
  NotificationSource,
} from '../../change_detection/scheduling/zoneless_scheduling';
import {assertInInjectionContext} from '../../di/contextual';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {AfterRenderPhase, type AfterRenderRef} from '../after_render/api';
import {NOOP_AFTER_RENDER_REF, type AfterRenderOptions} from '../after_render/hooks';
import {
  AFTER_RENDER_PHASES,
  AfterRenderImpl,
  AfterRenderManager,
  AfterRenderSequence,
} from '../after_render/manager';
import {LView} from '../interfaces/view';
import {ViewContext} from '../view_context';
import {assertNotInReactiveContext} from './asserts';
import {emitEffectCreatedEvent, setInjectorProfilerContext} from '../debug/injector_profiler';

const NOT_SET = /* @__PURE__ */ Symbol('NOT_SET');
const EMPTY_CLEANUP_SET = /* @__PURE__ */ new Set<() => void>();

/** Callback type for an `afterRenderEffect` phase effect */
type AfterRenderPhaseEffectHook = (
  // Either a cleanup function or a pipelined value and a cleanup function
  ...args:
    | [onCleanup: EffectCleanupRegisterFn]
    | [previousPhaseValue: unknown, onCleanup: EffectCleanupRegisterFn]
) => unknown;

/**
 * Reactive node in the graph for this `afterRenderEffect` phase effect.
 *
 * This node type extends `SignalNode` because `afterRenderEffect` phases effects produce a value
 * which is consumed as a `Signal` by subsequent phases.
 */
interface AfterRenderPhaseEffectNode extends SignalNode<unknown> {
  /** The phase of the effect implemented by this node */
  phase: AfterRenderPhase;
  /** The sequence of phases to which this node belongs, used for state of the whole sequence */
  sequence: AfterRenderEffectSequence;
  /** The user's callback function */
  userFn: AfterRenderPhaseEffectHook;
  /** Signal function that retrieves the value of this node, used as the value for the next phase */
  signal: Signal<unknown>;
  /** Registered cleanup functions, or `null` if none have ever been registered */
  cleanup: Set<() => void> | null;
  /** Pre-bound helper function passed to the user's callback which writes to `this.cleanup` */
  registerCleanupFn: EffectCleanupRegisterFn;
  /** Entrypoint to running this effect that's given to the `afterRender` machinery */
  phaseFn(previousValue?: unknown): unknown;
}

const AFTER_RENDER_PHASE_EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...SIGNAL_NODE,
  consumerIsAlwaysLive: true,
  consumerAllowSignalWrites: true,
  value: NOT_SET,
  cleanup: null,
  /** Called when the effect becomes dirty */
  consumerMarkedDirty(this: AfterRenderPhaseEffectNode): void {
    if (this.sequence.impl.executing) {
      // If hooks are in the middle of executing, then it matters whether this node has yet been
      // executed within its sequence. If not, then we don't want to notify the scheduler since
      // this node will be reached naturally.
      if (this.sequence.lastPhase === null || this.sequence.lastPhase < this.phase) {
        return;
      }

      // If during the execution of a later phase an earlier phase became dirty, then we should not
      // run any further phases until the earlier one reruns.
      this.sequence.erroredOrDestroyed = true;
    }

    // Either hooks are not running, or we're marking a node dirty that has already run within its
    // sequence.
    this.sequence.scheduler.notify(NotificationSource.RenderHook);
  },
  phaseFn(this: AfterRenderPhaseEffectNode, previousValue?: unknown): unknown {
    this.sequence.lastPhase = this.phase;

    if (!this.dirty) {
      return this.signal;
    }

    this.dirty = false;
    if (this.value !== NOT_SET && !consumerPollProducersForChange(this)) {
      // None of our producers report a change since the last time they were read, so no
      // recomputation of our value is necessary.
      return this.signal;
    }

    // Run any needed cleanup functions.
    try {
      for (const cleanupFn of this.cleanup ?? EMPTY_CLEANUP_SET) {
        cleanupFn();
      }
    } finally {
      // Even if a cleanup function errors, ensure it's cleared.
      this.cleanup?.clear();
    }

    // Prepare to call the user's effect callback. If there was a previous phase, then it gave us
    // its value as a `Signal`, otherwise `previousValue` will be `undefined`.
    const args: unknown[] = [];
    if (previousValue !== undefined) {
      args.push(previousValue);
    }
    args.push(this.registerCleanupFn);

    // Call the user's callback in our reactive context.
    const prevConsumer = consumerBeforeComputation(this);
    let newValue;
    try {
      newValue = this.userFn.apply(null, args as any);
    } finally {
      consumerAfterComputation(this, prevConsumer);
    }

    if (this.value === NOT_SET || !this.equal(this.value, newValue)) {
      this.value = newValue;
      this.version++;
    }

    return this.signal;
  },
}))();

/**
 * An `AfterRenderSequence` that manages an `afterRenderEffect`'s phase effects.
 */
export class AfterRenderEffectSequence extends AfterRenderSequence {
  /**
   * While this sequence is executing, this tracks the last phase which was called by the
   * `afterRender` machinery.
   *
   * When a phase effect is marked dirty, this is used to determine whether it's already run or not.
   */
  lastPhase: AfterRenderPhase | null = null;

  /**
   * The reactive nodes for each phase, if a phase effect is defined for that phase.
   *
   * These are initialized to `undefined` but set in the constructor.
   */
  private readonly nodes: [
    AfterRenderPhaseEffectNode | undefined,
    AfterRenderPhaseEffectNode | undefined,
    AfterRenderPhaseEffectNode | undefined,
    AfterRenderPhaseEffectNode | undefined,
  ] = [undefined, undefined, undefined, undefined];

  constructor(
    impl: AfterRenderImpl,
    effectHooks: Array<AfterRenderPhaseEffectHook | undefined>,
    view: LView | undefined,
    readonly scheduler: ChangeDetectionScheduler,
    injector: Injector,
    snapshot: TracingSnapshot | null = null,
  ) {
    // Note that we also initialize the underlying `AfterRenderSequence` hooks to `undefined` and
    // populate them as we create reactive nodes below.
    super(
      impl,
      [undefined, undefined, undefined, undefined],
      view,
      false,
      injector.get(DestroyRef),
      snapshot,
    );

    // Setup a reactive node for each phase.
    for (const phase of AFTER_RENDER_PHASES) {
      const effectHook = effectHooks[phase];
      if (effectHook === undefined) {
        continue;
      }

      const node = Object.create(AFTER_RENDER_PHASE_EFFECT_NODE) as AfterRenderPhaseEffectNode;
      node.sequence = this;
      node.phase = phase;
      node.userFn = effectHook;
      node.dirty = true;
      node.signal = (() => {
        producerAccessed(node);
        return node.value;
      }) as Signal<unknown>;
      node.signal[SIGNAL] = node;
      node.registerCleanupFn = (fn: EffectCleanupFn) =>
        (node.cleanup ??= new Set<() => void>()).add(fn);

      this.nodes[phase] = node;

      // Install the upstream hook which runs the `phaseFn` for this phase.
      this.hooks[phase] = (value) => node.phaseFn(value);

      if (ngDevMode) {
        setupDebugInfo(node, injector);
      }
    }
  }

  override afterRun(): void {
    super.afterRun();
    // We're done running this sequence, so reset `lastPhase`.
    this.lastPhase = null;
  }

  override destroy(): void {
    super.destroy();

    // Run the cleanup functions for each node.
    for (const node of this.nodes) {
      if (node) {
        try {
          for (const fn of node.cleanup ?? EMPTY_CLEANUP_SET) {
            fn();
          }
        } finally {
          consumerDestroy(node);
        }
      }
    }
  }
}

/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
export type ɵFirstAvailableSignal<T extends unknown[]> = T extends [infer H, ...infer R]
  ? [H] extends [never]
    ? ɵFirstAvailableSignal<R>
    : [Signal<H>]
  : [];

/**
 * Register an effect that, when triggered, is invoked when the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the effect instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that callback-based `afterRenderEffect`s will run
 * - in the order it they are registered
 * - only when dirty
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
 * @param callback An effect callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @publicApi
 */
export function afterRenderEffect(
  callback: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: AfterRenderOptions,
): AfterRenderRef;
/**
 * Register effects that, when triggered, are invoked when the application finishes rendering,
 * during the specified phases. The available phases are:
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
 * - Effects run in the following phase order, only when dirty through signal dependencies:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - `afterRenderEffect`s in the same phase run in the order they are registered.
 * - `afterRenderEffect`s run on browser platforms only, they will not run on the server.
 * - `afterRenderEffect`s will run at least once.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a `Signal`. This can be used to coordinate work across multiple phases.
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
 * @param spec The effect functions to register
 * @param options Options to control the behavior of the effects
 *
 * @usageNotes
 *
 * Use `afterRenderEffect` to create effects that will read or write from the DOM and thus should
 * run after rendering.
 *
 * @publicApi
 */
export function afterRenderEffect<E = never, W = never, M = never>(
  spec: {
    earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailableSignal<[E]>, EffectCleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailableSignal<[W, E]>, EffectCleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailableSignal<[M, W, E]>, EffectCleanupRegisterFn]) => void;
  },
  options?: AfterRenderOptions,
): AfterRenderRef;

/**
 * @publicApi
 */
export function afterRenderEffect<E = never, W = never, M = never>(
  callbackOrSpec:
    | ((onCleanup: EffectCleanupRegisterFn) => void)
    | {
        earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
        write?: (...args: [...ɵFirstAvailableSignal<[E]>, EffectCleanupRegisterFn]) => W;
        mixedReadWrite?: (
          ...args: [...ɵFirstAvailableSignal<[W, E]>, EffectCleanupRegisterFn]
        ) => M;
        read?: (...args: [...ɵFirstAvailableSignal<[M, W, E]>, EffectCleanupRegisterFn]) => void;
      },
  options?: AfterRenderOptions,
): AfterRenderRef {
  ngDevMode &&
    assertNotInReactiveContext(
      afterRenderEffect,
      'Call `afterRenderEffect` outside of a reactive context. For example, create the render ' +
        'effect inside the component constructor`.',
    );

  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterRenderEffect);
  }

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return NOOP_AFTER_RENDER_REF;
  }

  const injector = options?.injector ?? inject(Injector);
  const scheduler = injector.get(ChangeDetectionScheduler);
  const manager = injector.get(AfterRenderManager);
  const tracing = injector.get(TracingService, null, {optional: true});
  manager.impl ??= injector.get(AfterRenderImpl);

  let spec = callbackOrSpec;
  if (typeof spec === 'function') {
    spec = {mixedReadWrite: callbackOrSpec as any};
  }

  const viewContext = injector.get(ViewContext, null, {optional: true});

  const sequence = new AfterRenderEffectSequence(
    manager.impl,
    [spec.earlyRead, spec.write, spec.mixedReadWrite, spec.read] as AfterRenderPhaseEffectHook[],
    viewContext?.view,
    scheduler,
    injector,
    tracing?.snapshot(null),
  );
  manager.impl.register(sequence);
  return sequence;
}

function setupDebugInfo(node: AfterRenderPhaseEffectNode, injector: Injector): void {
  node.debugName = `afterRenderEffect - ${phaseDebugName(node.phase)} phase`;
  const prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
  try {
    emitEffectCreatedEvent({[SIGNAL]: node, destroy() {}} as any);
  } finally {
    setInjectorProfilerContext(prevInjectorProfilerContext);
  }
}

function phaseDebugName(phase: AfterRenderPhase): string {
  switch (phase) {
    case AfterRenderPhase.EarlyRead:
      return 'EarlyRead';
    case AfterRenderPhase.Write:
      return 'Write';
    case AfterRenderPhase.MixedReadWrite:
      return 'MixedReadWrite';
    case AfterRenderPhase.Read:
      return 'Read';
  }
}
