/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveDef} from './interfaces/definition';
import {LNodeFlags} from './interfaces/node';
import {HookData, LView, LifecycleStage, TView} from './interfaces/view';



/** Constants used by lifecycle hooks to determine when and how a hook should be called. */
export const enum LifecycleHook {
  ON_INIT = 0b00,
  ON_CHECK = 0b01,

  /* Mask used to get the type of the lifecycle hook from flags in hook queue */
  TYPE_MASK = 0b00000000000000000000000000000001,

  /* Shift needed to get directive index from flags in hook queue */
  INDX_SHIFT = 1
}

/**
 * If this is the first template pass, any ngOnInit or ngDoCheck hooks will be queued into
 * TView.initHooks during directiveCreate.
 *
 * The directive index and hook type are encoded into one number (1st bit: type, remaining bits:
 * directive index), then saved in the even indices of the initHooks array. The odd indices
 * hold the hook functions themselves.
 *
 * @param index The index of the directive in LView.data
 * @param hooks The static hooks map on the directive def
 * @param tView The current TView
 */
export function queueInitHooks(
    index: number, onInit: (() => void) | null, doCheck: (() => void) | null, tView: TView): void {
  if (tView.firstTemplatePass === true) {
    if (onInit != null) {
      (tView.initHooks || (tView.initHooks = [])).push(getInitFlags(index), onInit);
    }

    if (doCheck != null) {
      (tView.initHooks || (tView.initHooks = [])).push(getCheckFlags(index), doCheck);
    }
  }
}

/**
 * Loops through the directives on a node and queues all their hooks except ngOnInit
 * and ngDoCheck, which are queued separately in directiveCreate.
 */
export function queueLifecycleHooks(flags: number, currentView: LView): void {
  const tView = currentView.tView;
  if (tView.firstTemplatePass === true) {
    const size = (flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;
    const start = flags >> LNodeFlags.INDX_SHIFT;

    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = start, end = start + size; i < end; i++) {
      const def = (tView.data[i] as DirectiveDef<any>);
      queueContentHooks(def, tView, i);
      queueViewHooks(def, tView, i);
      queueDestroyHooks(def, tView, i);
    }
  }
}

/** Queues afterContentInit and afterContentChecked hooks on TView */
function queueContentHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.afterContentInit != null) {
    (tView.contentHooks || (tView.contentHooks = [])).push(getInitFlags(i), def.afterContentInit);
  }

  if (def.afterContentChecked != null) {
    (tView.contentHooks || (tView.contentHooks = [
     ])).push(getCheckFlags(i), def.afterContentChecked);
  }
}

/** Queues afterViewInit and afterViewChecked hooks on TView */
function queueViewHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.afterViewInit != null) {
    (tView.viewHooks || (tView.viewHooks = [])).push(getInitFlags(i), def.afterViewInit);
  }

  if (def.afterViewChecked != null) {
    (tView.viewHooks || (tView.viewHooks = [])).push(getCheckFlags(i), def.afterViewChecked);
  }
}

/** Queues onDestroy hooks on TView */
function queueDestroyHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.onDestroy != null) {
    (tView.destroyHooks || (tView.destroyHooks = [])).push(i, def.onDestroy);
  }
}

/** Generates flags for init-only hooks */
function getInitFlags(index: number): number {
  return index << LifecycleHook.INDX_SHIFT;
}

/** Generates flags for hooks called every change detection run */
function getCheckFlags(index: number): number {
  return (index << LifecycleHook.INDX_SHIFT) | LifecycleHook.ON_CHECK;
}

/**
 * Calls onInit and doCheck calls if they haven't already been called.
 *
 * @param currentView The current view
 */
export function executeInitHooks(currentView: LView): void {
  const initHooks = currentView.tView.initHooks;

  if (currentView.lifecycleStage === LifecycleStage.INIT && initHooks != null) {
    executeLifecycleHooks(currentView, initHooks);
    currentView.lifecycleStage = LifecycleStage.CONTENT_INIT;
  }
}

/**
 * Calls all afterContentInit and afterContentChecked hooks for the view, then splices
 * out afterContentInit hooks to prep for the next run in update mode.
 *
 * @param currentView The current view
 */
export function executeContentHooks(currentView: LView): void {
  const contentHooks = currentView.tView.contentHooks;

  if (currentView.lifecycleStage < LifecycleStage.VIEW_INIT && contentHooks != null) {
    executeLifecycleHooks(currentView, contentHooks);
    currentView.lifecycleStage = LifecycleStage.VIEW_INIT;
  }
}

/**
 * Iterates over afterViewInit and afterViewChecked functions and calls them.
 *
 * @param currentView The current view
 */
export function executeViewHooks(currentView: LView): void {
  const viewHooks = currentView.tView.viewHooks;

  if (viewHooks != null) {
    executeLifecycleHooks(currentView, viewHooks);
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * creation mode.
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 */
function executeLifecycleHooks(currentView: LView, arr: HookData): void {
  const data = currentView.data;
  const creationMode = currentView.creationMode;

  for (let i = 0; i < arr.length; i += 2) {
    const flags = arr[i] as number;
    const initOnly = (flags & LifecycleHook.TYPE_MASK) === LifecycleHook.ON_INIT;
    if (initOnly === false || creationMode) {
      (arr[i | 1] as() => void).call(data[flags >> LifecycleHook.INDX_SHIFT]);
    }
  }
}
