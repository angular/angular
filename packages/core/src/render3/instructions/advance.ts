/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertGreaterThan} from '../../util/assert';
import {executeCheckHooks, executeInitAndCheckHooks} from '../hooks';
import {FLAGS, HEADER_OFFSET, InitPhaseState, LView, LViewFlags, TVIEW} from '../interfaces/view';
import {ActiveElementFlags, executeElementExitFn, getCheckNoChangesMode, getLView, getSelectedIndex, hasActiveElementFlag, setSelectedIndex} from '../state';



/**
 * Advances to an element for later binding instructions.
 *
 * Used in conjunction with instructions like {@link property} to act on elements with specified
 * indices, for example those created with {@link element} or {@link elementStart}.
 *
 * ```ts
 * (rf: RenderFlags, ctx: any) => {
  *   if (rf & 1) {
  *     text(0, 'Hello');
  *     text(1, 'Goodbye')
  *     element(2, 'div');
  *   }
  *   if (rf & 2) {
  *     advance(2); // Advance twice to the <div>.
  *     property('title', 'test');
  *   }
  *  }
  * ```
  * @param delta Number of elements to advance forwards by.
  *
  * @codeGenApi
  */
export function ɵɵadvance(delta: number): void {
  ngDevMode && assertGreaterThan(delta, 0, 'Can only advance forward');
  selectIndexInternal(getLView(), getSelectedIndex() + delta, getCheckNoChangesMode());
}

/**
 * Selects an element for later binding instructions.
 * @deprecated No longer being generated, but still used in unit tests.
 * @codeGenApi
 */
export function ɵɵselect(index: number): void {
  selectIndexInternal(getLView(), index, getCheckNoChangesMode());
}

export function selectIndexInternal(lView: LView, index: number, checkNoChangesMode: boolean) {
  ngDevMode && assertGreaterThan(index, -1, 'Invalid index');
  ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);

  if (hasActiveElementFlag(ActiveElementFlags.RunExitFn)) {
    executeElementExitFn();
  }

  // Flush the initial hooks for elements in the view that have been added up to this point.
  // PERF WARNING: do NOT extract this to a separate function without running benchmarks
  if (!checkNoChangesMode) {
    const hooksInitPhaseCompleted =
        (lView[FLAGS] & LViewFlags.InitPhaseStateMask) === InitPhaseState.InitPhaseCompleted;
    if (hooksInitPhaseCompleted) {
      const preOrderCheckHooks = lView[TVIEW].preOrderCheckHooks;
      if (preOrderCheckHooks !== null) {
        executeCheckHooks(lView, preOrderCheckHooks, index);
      }
    } else {
      const preOrderHooks = lView[TVIEW].preOrderHooks;
      if (preOrderHooks !== null) {
        executeInitAndCheckHooks(lView, preOrderHooks, InitPhaseState.OnInitHooksToBeRun, index);
      }
    }
  }

  // We must set the selected index *after* running the hooks, because hooks may have side-effects
  // that cause other template functions to run, thus updating the selected index, which is global
  // state. If we run `setSelectedIndex` *before* we run the hooks, in some cases the selected index
  // will be altered by the time we leave the `ɵɵadvance` instruction.
  setSelectedIndex(index);
}
