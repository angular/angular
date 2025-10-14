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
} from '../../../primitives/signals';
import {TracingService} from '../../application/tracing';
import {ChangeDetectionScheduler} from '../../change_detection/scheduling/zoneless_scheduling';
import {assertInInjectionContext} from '../../di/contextual';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {NOOP_AFTER_RENDER_REF} from '../after_render/hooks';
import {
  AFTER_RENDER_PHASES,
  AfterRenderImpl,
  AfterRenderManager,
  AfterRenderSequence,
} from '../after_render/manager';
import {ViewContext} from '../view_context';
import {assertNotInReactiveContext} from './asserts';
import {emitEffectCreatedEvent, setInjectorProfilerContext} from '../debug/injector_profiler';
const NOT_SET = /* @__PURE__ */ Symbol('NOT_SET');
const EMPTY_CLEANUP_SET = /* @__PURE__ */ new Set();
const AFTER_RENDER_PHASE_EFFECT_NODE = /* @__PURE__ */ (() => ({
  ...SIGNAL_NODE,
  consumerIsAlwaysLive: true,
  consumerAllowSignalWrites: true,
  value: NOT_SET,
  cleanup: null,
  /** Called when the effect becomes dirty */
  consumerMarkedDirty() {
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
    this.sequence.scheduler.notify(7 /* NotificationSource.RenderHook */);
  },
  phaseFn(previousValue) {
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
    const args = [];
    if (previousValue !== undefined) {
      args.push(previousValue);
    }
    args.push(this.registerCleanupFn);
    // Call the user's callback in our reactive context.
    const prevConsumer = consumerBeforeComputation(this);
    let newValue;
    try {
      newValue = this.userFn.apply(null, args);
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
  scheduler;
  /**
   * While this sequence is executing, this tracks the last phase which was called by the
   * `afterRender` machinery.
   *
   * When a phase effect is marked dirty, this is used to determine whether it's already run or not.
   */
  lastPhase = null;
  /**
   * The reactive nodes for each phase, if a phase effect is defined for that phase.
   *
   * These are initialized to `undefined` but set in the constructor.
   */
  nodes = [undefined, undefined, undefined, undefined];
  constructor(impl, effectHooks, view, scheduler, injector, snapshot = null) {
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
    this.scheduler = scheduler;
    // Setup a reactive node for each phase.
    for (const phase of AFTER_RENDER_PHASES) {
      const effectHook = effectHooks[phase];
      if (effectHook === undefined) {
        continue;
      }
      const node = Object.create(AFTER_RENDER_PHASE_EFFECT_NODE);
      node.sequence = this;
      node.phase = phase;
      node.userFn = effectHook;
      node.dirty = true;
      node.signal = () => {
        producerAccessed(node);
        return node.value;
      };
      node.signal[SIGNAL] = node;
      node.registerCleanupFn = (fn) => (node.cleanup ??= new Set()).add(fn);
      this.nodes[phase] = node;
      // Install the upstream hook which runs the `phaseFn` for this phase.
      this.hooks[phase] = (value) => node.phaseFn(value);
      if (ngDevMode) {
        setupDebugInfo(node, injector);
      }
    }
  }
  afterRun() {
    super.afterRun();
    // We're done running this sequence, so reset `lastPhase`.
    this.lastPhase = null;
  }
  destroy() {
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
 * @publicApi
 */
export function afterRenderEffect(callbackOrSpec, options) {
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
    spec = {mixedReadWrite: callbackOrSpec};
  }
  const viewContext = injector.get(ViewContext, null, {optional: true});
  const sequence = new AfterRenderEffectSequence(
    manager.impl,
    [spec.earlyRead, spec.write, spec.mixedReadWrite, spec.read],
    viewContext?.view,
    scheduler,
    injector,
    tracing?.snapshot(null),
  );
  manager.impl.register(sequence);
  return sequence;
}
function setupDebugInfo(node, injector) {
  node.debugName = `afterRenderEffect - ${phaseDebugName(node.phase)} phase`;
  const prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
  try {
    emitEffectCreatedEvent({[SIGNAL]: node, destroy() {}});
  } finally {
    setInjectorProfilerContext(prevInjectorProfilerContext);
  }
}
function phaseDebugName(phase) {
  switch (phase) {
    case 0 /* AfterRenderPhase.EarlyRead */:
      return 'EarlyRead';
    case 1 /* AfterRenderPhase.Write */:
      return 'Write';
    case 2 /* AfterRenderPhase.MixedReadWrite */:
      return 'MixedReadWrite';
    case 3 /* AfterRenderPhase.Read */:
      return 'Read';
  }
}
//# sourceMappingURL=after_render_effect.js.map
