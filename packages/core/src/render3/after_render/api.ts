/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The phase to run an `afterRender` or `afterNextRender` callback in.
 *
 * Callbacks in the same phase run in the order they are registered. Phases run in the
 * following order after each render:
 *
 *   1. `AfterRenderPhase.EarlyRead`
 *   2. `AfterRenderPhase.Write`
 *   3. `AfterRenderPhase.MixedReadWrite`
 *   4. `AfterRenderPhase.Read`
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 */
export const enum AfterRenderPhase {
  /**
   * Use `AfterRenderPhase.EarlyRead` for callbacks that only need to **read** from the
   * DOM before a subsequent `AfterRenderPhase.Write` callback, for example to perform
   * custom layout that the browser doesn't natively support. Prefer the
   * `AfterRenderPhase.Read` phase if reading can wait until after the write phase.
   * **Never** write to the DOM in this phase.
   *
   * <div class="docs-alert docs-alert-important">
   *
   * Using this value can degrade performance.
   * Instead, prefer using built-in browser functionality when possible.
   *
   * </div>
   */
  EarlyRead,

  /**
   * Use `AfterRenderPhase.Write` for callbacks that only **write** to the DOM. **Never**
   * read from the DOM in this phase.
   */
  Write,

  /**
   * Use `AfterRenderPhase.MixedReadWrite` for callbacks that read from or write to the
   * DOM, that haven't been refactored to use a different phase. **Never** use this phase if
   * it is possible to divide the work among the other phases instead.
   *
   * <div class="docs-alert docs-alert-critical">
   *
   * Using this value can **significantly** degrade performance.
   * Instead, prefer dividing work into the appropriate phase callbacks.
   *
   * </div>
   */
  MixedReadWrite,

  /**
   * Use `AfterRenderPhase.Read` for callbacks that only **read** from the DOM. **Never**
   * write to the DOM in this phase.
   */
  Read,
}

/**
 * A callback that runs after render.
 *
 * @publicApi
 */
export interface AfterRenderRef {
  /**
   * Shut down the callback, preventing it from being called again.
   */
  destroy(): void;
}
