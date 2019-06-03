/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertGreaterThan, assertLessThan} from '../../util/assert';
import {executePreOrderHooks} from '../hooks';
import {HEADER_OFFSET, LView, TVIEW} from '../interfaces/view';
import {getCheckNoChangesMode, getLView, setSelectedIndex} from '../state';


/**
 * Selects an element for later binding instructions.
 *
 * Used in conjunction with instructions like {@link property} to act on elements with specified
 * indices, for example those created with {@link element} or {@link elementStart}.
 *
 * ```ts
 * (rf: RenderFlags, ctx: any) => {
 *   if (rf & 1) {
 *     element(0, 'div');
 *   }
 *   if (rf & 2) {
 *     select(0); // Select the <div/> created above.
 *     property('title', 'test');
 *   }
 *  }
 * ```
 * @param index the index of the item to act on with the following instructions
 *
 * @codeGenApi
 */
export function ɵɵselect(index: number): void {
  ngDevMode && assertGreaterThan(index, -1, 'Invalid index');
  ngDevMode &&
      assertLessThan(
          index, getLView().length - HEADER_OFFSET, 'Should be within range for the view data');
  const lView = getLView();
  selectInternal(lView, index);
}


export function selectInternal(lView: LView, index: number) {
  // Flush the initial hooks for elements in the view that have been added up to this point.
  executePreOrderHooks(lView, lView[TVIEW], getCheckNoChangesMode(), index);

  // We must set the selected index *after* running the hooks, because hooks may have side-effects
  // that cause other template functions to run, thus updating the selected index, which is global
  // state. If we run `setSelectedIndex` *before* we run the hooks, in some cases the selected index
  // will be altered by the time we leave the `ɵɵselect` instruction.
  setSelectedIndex(index);
}
