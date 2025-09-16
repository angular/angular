/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TracingSnapshot} from '../../application/tracing';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {type DestroyRef} from '../../linker/destroy_ref';
import {AFTER_RENDER_SEQUENCES_TO_ADD, LView} from '../interfaces/view';
import {AfterRenderPhase, AfterRenderRef} from './api';
import type {AfterRenderImpl} from './after_render_impl';

export class AfterRenderManager {
  impl: AfterRenderImpl | null = null;

  execute(): void {
    this.impl?.execute();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: AfterRenderManager,
    providedIn: 'root',
    factory: () => new AfterRenderManager(),
  });
}

export const AFTER_RENDER_PHASES: AfterRenderPhase[] = /* @__PURE__ **/ (() =>
  [
    AfterRenderPhase.EarlyRead,
    AfterRenderPhase.Write,
    AfterRenderPhase.MixedReadWrite,
    AfterRenderPhase.Read,
  ] as const)();

export type AfterRenderHook = (value?: unknown) => unknown;
export type AfterRenderHooks = [
  /*      EarlyRead */ AfterRenderHook | undefined,
  /*          Write */ AfterRenderHook | undefined,
  /* MixedReadWrite */ AfterRenderHook | undefined,
  /*           Read */ AfterRenderHook | undefined,
];

export class AfterRenderSequence implements AfterRenderRef {
  /**
   * Whether this sequence errored or was destroyed during this execution, and hooks should no
   * longer run for it.
   */
  erroredOrDestroyed: boolean = false;

  /**
   * The value returned by the last hook execution (if any), ready to be pipelined into the next
   * one.
   */
  pipelinedValue: unknown = undefined;

  private unregisterOnDestroy: (() => void) | undefined;

  constructor(
    readonly impl: AfterRenderImpl,
    readonly hooks: AfterRenderHooks,
    readonly view: LView | undefined,
    public once: boolean,
    destroyRef: DestroyRef | null,
    public snapshot: TracingSnapshot | null = null,
  ) {
    this.unregisterOnDestroy = destroyRef?.onDestroy(() => this.destroy());
  }

  afterRun(): void {
    this.erroredOrDestroyed = false;
    this.pipelinedValue = undefined;

    // Clear the tracing snapshot after the initial run. This snapshot only
    // associates the initial run of the hook with the context that created it.
    // Follow-up runs are independent of that initial context and have different
    // triggers.
    this.snapshot?.dispose();
    this.snapshot = null;
  }

  destroy(): void {
    this.impl.unregister(this);
    this.unregisterOnDestroy?.();
    const scheduled = this.view?.[AFTER_RENDER_SEQUENCES_TO_ADD];
    if (scheduled) {
      this.view[AFTER_RENDER_SEQUENCES_TO_ADD] = scheduled.filter((s) => s !== this);
    }
  }
}
