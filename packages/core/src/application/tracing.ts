/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';

/** Actions that are supported by the tracing framework. */
export enum TracingAction {
  CHANGE_DETECTION,
  AFTER_NEXT_RENDER,
}

/** A single tracing snapshot. */
export interface TracingSnapshot {
  run<T>(action: TracingAction, fn: () => T): T;

  /** Disposes of the tracing snapshot. Must be run exactly once per TracingSnapshot. */
  dispose(): void;
}

/**
 * Injection token for a `TracingService`, optionally provided.
 */
export const TracingService = new InjectionToken<TracingService<TracingSnapshot>>(
  ngDevMode ? 'TracingService' : '',
);

/**
 * Tracing mechanism which can associate causes (snapshots) with runs of
 * subsequent operations.
 *
 * Not defined by Angular directly, but defined in contexts where tracing is
 * desired.
 */
export interface TracingService<T extends TracingSnapshot> {
  /**
   * Take a snapshot of the current context which will be stored by Angular and
   * used when additional work is performed that was scheduled in this context.
   *
   * @param linkedSnapshot Optional snapshot to use link to the current context.
   * The caller is no longer responsible for calling dispose on the linkedSnapshot.
   *
   * @return The tracing snapshot. The caller is responsible for diposing of the
   * snapshot.
   */
  snapshot(linkedSnapshot: T | null): T;

  /**
   * Wrap an event listener bound by the framework for tracing.
   * @param element Element on which the event is bound.
   * @param eventName Name of the event.
   * @param handler Event handler.
   * @return A new event handler to be bound instead of the original one.
   */
  wrapEventListener?<T extends Function>(element: HTMLElement, eventName: string, handler: T): T;
}
