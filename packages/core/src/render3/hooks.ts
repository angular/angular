/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertNotEqual} from '../util/assert';

import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {FLAGS, HookData, InitPhaseState, LView, LViewFlags, PREORDER_HOOK_FLAGS, PreOrderHookFlags, TView} from './interfaces/view';
import {getCheckNoChangesMode} from './state';



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
 * Executes pre-order check hooks ( OnChanges, DoChanges) given a view where all the init hooks were
 * executed once. This is a light version of executeInitAndCheckPreOrderHooks where we can skip read
 * / write of the init-hooks related flags.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeCheckHooks(lView: LView, hooks: HookData, nodeIndex?: number | null) {
  callHooks(lView, hooks, InitPhaseState.InitPhaseCompleted, nodeIndex);
}

/**
 * Executes post-order init and check hooks (one of AfterContentInit, AfterContentChecked,
 * AfterViewInit, AfterViewChecked) given a view where there are pending init hooks to be executed.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param initPhase A phase for which hooks should be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeInitAndCheckHooks(
    lView: LView, hooks: HookData, initPhase: InitPhaseState, nodeIndex?: number | null) {
  ngDevMode && assertNotEqual(
                   initPhase, InitPhaseState.InitPhaseCompleted,
                   'Init pre-order hooks should not be called more than once');
  if ((lView[FLAGS] & LViewFlags.InitPhaseStateMask) === initPhase) {
    callHooks(lView, hooks, initPhase, nodeIndex);
  }
}

export function incrementInitPhaseFlags(lView: LView, initPhase: InitPhaseState): void {
  ngDevMode &&
      assertNotEqual(
          initPhase, InitPhaseState.InitPhaseCompleted,
          'Init hooks phase should not be incremented after all init hooks have been run.');
  let flags = lView[FLAGS];
  if ((flags & LViewFlags.InitPhaseStateMask) === initPhase) {
    flags &= LViewFlags.IndexWithinInitPhaseReset;
    flags += LViewFlags.InitPhaseStateIncrementer;
    lView[FLAGS] = flags;
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 * @param initPhaseState the current state of the init phase
 * @param currentNodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
function callHooks(
    currentView: LView, arr: HookData, initPhase: InitPhaseState,
    currentNodeIndex: number | null | undefined): void {
  ngDevMode && assertEqual(
                   getCheckNoChangesMode(), false,
                   'Hooks should never be run in the check no changes mode.');
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
