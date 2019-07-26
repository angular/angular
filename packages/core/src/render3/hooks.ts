/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from '../util/assert';

import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {FLAGS, HookData, InitPhaseState, LView, LViewFlags, PREORDER_HOOK_FLAGS, PreOrderHookFlags, TView} from './interfaces/view';



/**
 * Adds all directive lifecycle hooks from the given `DirectiveDef` to the given `TView`.
 *
 * Must be run *only* on the first template pass.
 *
 * Sets up the pre-order hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * @param directiveIndex The index of the directive in LView
 * @param directiveDef The definition containing the hooks to setup in tView
 * @param tView The current TView
 * @param nodeIndex The index of the node to which the directive is attached
 * @param initialPreOrderHooksLength the number of pre-order hooks already registered before the
 * current process, used to know if the node index has to be added to the array. If it is -1,
 * the node index is never added.
 * @param initialPreOrderCheckHooksLength same as previous for pre-order check hooks
 */
export function registerPreOrderHooks(
    directiveIndex: number, directiveDef: DirectiveDef<any>, tView: TView, nodeIndex: number,
    initialPreOrderHooksLength: number, initialPreOrderCheckHooksLength: number): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');

  const {onChanges, onInit, doCheck} = directiveDef;
  if (initialPreOrderHooksLength >= 0 &&
      (!tView.preOrderHooks || initialPreOrderHooksLength === tView.preOrderHooks.length) &&
      (onChanges || onInit || doCheck)) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(nodeIndex);
  }

  if (initialPreOrderCheckHooksLength >= 0 &&
      (!tView.preOrderCheckHooks ||
       initialPreOrderCheckHooksLength === tView.preOrderCheckHooks.length) &&
      (onChanges || doCheck)) {
    (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(nodeIndex);
  }

  if (onChanges) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, onChanges);
    (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(directiveIndex, onChanges);
  }

  if (onInit) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(-directiveIndex, onInit);
  }

  if (doCheck) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, doCheck);
    (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(directiveIndex, doCheck);
  }
}

/**
 *
 * Loops through the directives on the provided `tNode` and queues hooks to be
 * run that are not initialization hooks.
 *
 * Should be executed during `elementEnd()` and similar to
 * preserve hook execution order. Content, view, and destroy hooks for projected
 * components and directives must be called *before* their hosts.
 *
 * Sets up the content, view, and destroy hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * NOTE: This does not set up `onChanges`, `onInit` or `doCheck`, those are set up
 * separately at `elementStart`.
 *
 * @param tView The current TView
 * @param tNode The TNode whose directives are to be searched for hooks to queue
 */
export function registerPostOrderHooks(tView: TView, tNode: TNode): void {
  if (tView.firstTemplatePass) {
    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
      const directiveDef = tView.data[i] as DirectiveDef<any>;
      if (directiveDef.afterContentInit) {
        (tView.contentHooks || (tView.contentHooks = [])).push(-i, directiveDef.afterContentInit);
      }

      if (directiveDef.afterContentChecked) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, directiveDef.afterContentChecked);
        (tView.contentCheckHooks || (tView.contentCheckHooks = [
         ])).push(i, directiveDef.afterContentChecked);
      }

      if (directiveDef.afterViewInit) {
        (tView.viewHooks || (tView.viewHooks = [])).push(-i, directiveDef.afterViewInit);
      }

      if (directiveDef.afterViewChecked) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, directiveDef.afterViewChecked);
        (tView.viewCheckHooks || (tView.viewCheckHooks = [
         ])).push(i, directiveDef.afterViewChecked);
      }

      if (directiveDef.onDestroy != null) {
        (tView.destroyHooks || (tView.destroyHooks = [])).push(i, directiveDef.onDestroy);
      }
    }
  }
}

/**
 * Executing hooks requires complex logic as we need to deal with 2 constraints.
 *
 * 1. Init hooks (ngOnInit, ngAfterContentInit, ngAfterViewInit) must all be executed once and only
 * once, across many change detection cycles. This must be true even if some hooks throw, or if
 * some recursively trigger a change detection cycle.
 * To solve that, it is required to track the state of the execution of these init hooks.
 * This is done by storing and maintaining flags in the view: the {@link InitPhaseState},
 * and the index within that phase. They can be seen as a cursor in the following structure:
 * [[onInit1, onInit2], [afterContentInit1], [afterViewInit1, afterViewInit2, afterViewInit3]]
 * They are are stored as flags in LView[FLAGS].
 *
 * 2. Pre-order hooks can be executed in batches, because of the select instruction.
 * To be able to pause and resume their execution, we also need some state about the hook's array
 * that is being processed:
 * - the index of the next hook to be executed
 * - the number of init hooks already found in the processed part of the  array
 * They are are stored as flags in LView[PREORDER_HOOK_FLAGS].
 */

/**
 * Executes necessary hooks at the start of executing a template.
 *
 * Executes hooks that are to be run during the initialization of a directive such
 * as `onChanges`, `onInit`, and `doCheck`.
 *
 * @param lView The current view
 * @param tView Static data for the view containing the hooks to be executed
 * @param checkNoChangesMode Whether or not we're in checkNoChanges mode.
 * @param @param currentNodeIndex 2 cases depending the the value:
 * - undefined: execute hooks only from the saved index until the end of the array (pre-order case,
 * when flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executePreOrderHooks(
    currentView: LView, tView: TView, checkNoChangesMode: boolean,
    currentNodeIndex: number | undefined): void {
  if (!checkNoChangesMode) {
    executeHooks(
        currentView, tView.preOrderHooks, tView.preOrderCheckHooks, checkNoChangesMode,
        InitPhaseState.OnInitHooksToBeRun,
        currentNodeIndex !== undefined ? currentNodeIndex : null);
  }
}

/**
 * Executes hooks against the given `LView` based off of whether or not
 * This is the first pass.
 *
 * @param currentView The view instance data to run the hooks against
 * @param firstPassHooks An array of hooks to run if we're in the first view pass
 * @param checkHooks An Array of hooks to run if we're not in the first view pass.
 * @param checkNoChangesMode Whether or not we're in no changes mode.
 * @param initPhaseState the current state of the init phase
 * @param currentNodeIndex 3 cases depending the the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeHooks(
    currentView: LView, firstPassHooks: HookData | null, checkHooks: HookData | null,
    checkNoChangesMode: boolean, initPhaseState: InitPhaseState,
    currentNodeIndex: number | null | undefined): void {
  if (checkNoChangesMode) return;

  if (checkHooks !== null || firstPassHooks !== null) {
    const hooksToCall = (currentView[FLAGS] & LViewFlags.InitPhaseStateMask) === initPhaseState ?
        firstPassHooks :
        checkHooks;
    if (hooksToCall !== null) {
      callHooks(currentView, hooksToCall, initPhaseState, currentNodeIndex);
    }
  }

  // The init phase state must be always checked here as it may have been recursively updated
  let flags = currentView[FLAGS];
  if (currentNodeIndex == null && (flags & LViewFlags.InitPhaseStateMask) === initPhaseState &&
      initPhaseState !== InitPhaseState.InitPhaseCompleted) {
    flags &= LViewFlags.IndexWithinInitPhaseReset;
    flags += LViewFlags.InitPhaseStateIncrementer;
    currentView[FLAGS] = flags;
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 * @param initPhaseState the current state of the init phase
 * @param currentNodeIndex 3 cases depending the the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
function callHooks(
    currentView: LView, arr: HookData, initPhase: InitPhaseState,
    currentNodeIndex: number | null | undefined): void {
  const startIndex = currentNodeIndex !== undefined ?
      (currentView[PREORDER_HOOK_FLAGS] & PreOrderHookFlags.IndexOfTheNextPreOrderHookMaskMask) :
      0;
  const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
  let lastNodeIndexFound = 0;
  for (let i = startIndex; i < arr.length; i++) {
    const hook = arr[i + 1] as() => void;
    if (typeof hook === 'number') {
      lastNodeIndexFound = arr[i] as number;
      if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
        break;
      }
    } else {
      const isInitHook = arr[i] < 0;
      if (isInitHook)
        currentView[PREORDER_HOOK_FLAGS] += PreOrderHookFlags.NumberOfInitHooksCalledIncrementer;
      if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
        callHook(currentView, initPhase, arr, i);
        currentView[PREORDER_HOOK_FLAGS] =
            (currentView[PREORDER_HOOK_FLAGS] & PreOrderHookFlags.NumberOfInitHooksCalledMask) + i +
            2;
      }
      i++;
    }
  }
}

/**
 * Execute one hook against the current `LView`.
 *
 * @param currentView The current view
 * @param initPhaseState the current state of the init phase
 * @param arr The array in which the hooks are found
 * @param i The current index within the hook data array
 */
function callHook(currentView: LView, initPhase: InitPhaseState, arr: HookData, i: number) {
  const isInitHook = arr[i] < 0;
  const hook = arr[i + 1] as() => void;
  const directiveIndex = isInitHook ? -arr[i] : arr[i] as number;
  const directive = currentView[directiveIndex];
  if (isInitHook) {
    const indexWithintInitPhase = currentView[FLAGS] >> LViewFlags.IndexWithinInitPhaseShift;
    // The init phase state must be always checked here as it may have been recursively
    // updated
    if (indexWithintInitPhase <
            (currentView[PREORDER_HOOK_FLAGS] >> PreOrderHookFlags.NumberOfInitHooksCalledShift) &&
        (currentView[FLAGS] & LViewFlags.InitPhaseStateMask) === initPhase) {
      currentView[FLAGS] += LViewFlags.IndexWithinInitPhaseIncrementer;
      hook.call(directive);
    }
  } else {
    hook.call(directive);
  }
}
