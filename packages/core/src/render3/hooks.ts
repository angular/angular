/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../primitives/signals';

import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
} from '../interface/lifecycle_hooks';
import {assertDefined, assertEqual, assertNotEqual} from '../util/assert';

import {assertFirstCreatePass} from './assert';
import {NgOnChangesFeatureImpl} from './features/ng_onchanges_feature';
import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {
  FLAGS,
  HookData,
  InitPhaseState,
  LView,
  LViewFlags,
  PREORDER_HOOK_FLAGS,
  PreOrderHookFlags,
  TView,
} from './interfaces/view';
import {profiler} from './profiler';
import {ProfilerEvent} from './profiler_types';
import {isInCheckNoChangesMode} from './state';

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
 */
export function registerPreOrderHooks(
  directiveIndex: number,
  directiveDef: DirectiveDef<any>,
  tView: TView,
): void {
  ngDevMode && assertFirstCreatePass(tView);
  const {ngOnChanges, ngOnInit, ngDoCheck} = directiveDef.type.prototype as OnChanges &
    OnInit &
    DoCheck;

  if (ngOnChanges as Function | undefined) {
    const wrappedOnChanges = NgOnChangesFeatureImpl(directiveDef);
    (tView.preOrderHooks ??= []).push(directiveIndex, wrappedOnChanges);
    (tView.preOrderCheckHooks ??= []).push(directiveIndex, wrappedOnChanges);
  }

  if (ngOnInit) {
    (tView.preOrderHooks ??= []).push(0 - directiveIndex, ngOnInit);
  }

  if (ngDoCheck) {
    (tView.preOrderHooks ??= []).push(directiveIndex, ngDoCheck);
    (tView.preOrderCheckHooks ??= []).push(directiveIndex, ngDoCheck);
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
  ngDevMode && assertFirstCreatePass(tView);
  // It's necessary to loop through the directives at elementEnd() (rather than processing in
  // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
  // hooks for projected components and directives must be called *before* their hosts.
  for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
    const directiveDef = tView.data[i] as DirectiveDef<any>;
    ngDevMode && assertDefined(directiveDef, 'Expecting DirectiveDef');
    const lifecycleHooks: AfterContentInit &
      AfterContentChecked &
      AfterViewInit &
      AfterViewChecked &
      OnDestroy = directiveDef.type.prototype;
    const {
      ngAfterContentInit,
      ngAfterContentChecked,
      ngAfterViewInit,
      ngAfterViewChecked,
      ngOnDestroy,
    } = lifecycleHooks;

    if (ngAfterContentInit) {
      (tView.contentHooks ??= []).push(-i, ngAfterContentInit);
    }

    if (ngAfterContentChecked) {
      (tView.contentHooks ??= []).push(i, ngAfterContentChecked);
      (tView.contentCheckHooks ??= []).push(i, ngAfterContentChecked);
    }

    if (ngAfterViewInit) {
      (tView.viewHooks ??= []).push(-i, ngAfterViewInit);
    }

    if (ngAfterViewChecked) {
      (tView.viewHooks ??= []).push(i, ngAfterViewChecked);
      (tView.viewCheckHooks ??= []).push(i, ngAfterViewChecked);
    }

    if (ngOnDestroy != null) {
      (tView.destroyHooks ??= []).push(i, ngOnDestroy);
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
 * They are stored as flags in LView[FLAGS].
 *
 * 2. Pre-order hooks can be executed in batches, because of the select instruction.
 * To be able to pause and resume their execution, we also need some state about the hook's array
 * that is being processed:
 * - the index of the next hook to be executed
 * - the number of init hooks already found in the processed part of the  array
 * They are stored as flags in LView[PREORDER_HOOK_FLAGS].
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
  lView: LView,
  hooks: HookData,
  initPhase: InitPhaseState,
  nodeIndex?: number | null,
) {
  ngDevMode &&
    assertNotEqual(
      initPhase,
      InitPhaseState.InitPhaseCompleted,
      'Init pre-order hooks should not be called more than once',
    );
  if ((lView[FLAGS] & LViewFlags.InitPhaseStateMask) === initPhase) {
    callHooks(lView, hooks, initPhase, nodeIndex);
  }
}

export function incrementInitPhaseFlags(lView: LView, initPhase: InitPhaseState): void {
  ngDevMode &&
    assertNotEqual(
      initPhase,
      InitPhaseState.InitPhaseCompleted,
      'Init hooks phase should not be incremented after all init hooks have been run.',
    );
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
  currentView: LView,
  arr: HookData,
  initPhase: InitPhaseState,
  currentNodeIndex: number | null | undefined,
): void {
  ngDevMode &&
    assertEqual(
      isInCheckNoChangesMode(),
      false,
      'Hooks should never be run when in check no changes mode.',
    );
  const startIndex =
    currentNodeIndex !== undefined
      ? currentView[PREORDER_HOOK_FLAGS] & PreOrderHookFlags.IndexOfTheNextPreOrderHookMaskMask
      : 0;
  const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
  const max = arr.length - 1; // Stop the loop at length - 1, because we look for the hook at i + 1
  let lastNodeIndexFound = 0;
  for (let i = startIndex; i < max; i++) {
    const hook = arr[i + 1] as number | (() => void);
    if (typeof hook === 'number') {
      lastNodeIndexFound = arr[i] as number;
      if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
        break;
      }
    } else {
      const isInitHook = (arr[i] as number) < 0;
      if (isInitHook) {
        currentView[PREORDER_HOOK_FLAGS] += PreOrderHookFlags.NumberOfInitHooksCalledIncrementer;
      }
      if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
        callHook(currentView, initPhase, arr, i);
        currentView[PREORDER_HOOK_FLAGS] =
          (currentView[PREORDER_HOOK_FLAGS] & PreOrderHookFlags.NumberOfInitHooksCalledMask) +
          i +
          2;
      }
      i++;
    }
  }
}

/**
 * Executes a single lifecycle hook, making sure that:
 * - it is called in the non-reactive context;
 * - profiling data are registered.
 */
function callHookInternal(directive: any, hook: () => void) {
  profiler(ProfilerEvent.LifecycleHookStart, directive, hook);
  const prevConsumer = setActiveConsumer(null);
  try {
    hook.call(directive);
  } finally {
    setActiveConsumer(prevConsumer);
    profiler(ProfilerEvent.LifecycleHookEnd, directive, hook);
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
  const isInitHook = (arr[i] as number) < 0;
  const hook = arr[i + 1] as () => void;
  const directiveIndex = isInitHook ? -arr[i] : (arr[i] as number);
  const directive = currentView[directiveIndex];
  if (isInitHook) {
    const indexWithintInitPhase = currentView[FLAGS] >> LViewFlags.IndexWithinInitPhaseShift;
    // The init phase state must be always checked here as it may have been recursively updated.
    if (
      indexWithintInitPhase <
        currentView[PREORDER_HOOK_FLAGS] >> PreOrderHookFlags.NumberOfInitHooksCalledShift &&
      (currentView[FLAGS] & LViewFlags.InitPhaseStateMask) === initPhase
    ) {
      currentView[FLAGS] += LViewFlags.IndexWithinInitPhaseIncrementer;
      callHookInternal(directive, hook);
    }
  } else {
    callHookInternal(directive, hook);
  }
}
