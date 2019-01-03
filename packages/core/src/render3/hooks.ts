/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from './assert';
import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {FLAGS, HookData, LView, LViewFlags, TView} from './interfaces/view';
import {OnChangesDirectiveWrapper, isOnChangesDirectiveWrapper, unwrapOnChangesDirectiveWrapper} from './util';


/**
 * Run on first template pass.
 *
 * This will update `tView` with all of the appropriate hook information found
 * in the `def` provided.
 *
 * The hooks arrays this sets up are in the sets of directiveIndex and hook functions,
 * such that it looks like `[index, hook, index, hook, index, hook]`. However,
 * if the hook happens to be an OnChanges hook, then the `index` will be _negative_,
 * this signals {@link callHooks} that it's dealing with an OnChanges hook, and needs
 * to pass the {@link SimpleChanges} object.
 *
 * @param index The index of the directive in LView
 * @param def The definition containing the hooks to setup in tView
 * @param tView The current TView
 */
export function setupHooksDirectiveStart(
    index: number, def: DirectiveDef<any>, tView: TView): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');

  const {onChanges, onInit, doCheck} = def;

  if (onChanges) {
    (tView.initHooks || (tView.initHooks = [])).push(-index, onChanges);
    (tView.checkHooks || (tView.checkHooks = [])).push(-index, onChanges);
  }

  if (onInit) {
    (tView.initHooks || (tView.initHooks = [])).push(index, onInit);
  }

  if (doCheck) {
    (tView.initHooks || (tView.initHooks = [])).push(index, doCheck);
    (tView.checkHooks || (tView.checkHooks = [])).push(index, doCheck);
  }
}

/**
 * To be run during `elementEnd()` and similar.
 *
 * Loops through the directives on the provided `tNode` and queues hooks to be
 * run that are not initialization hooks. This is to be done at `elementEnd()` to
 * preserve hook execution order. Content, view, and destroy hooks for projected
 * components and directives must be called *before* their hosts.
 *
 * Sets up the content, view, and destroy hooks on the provided `tView`.
 *
 * NOTE: This does not set up onChanges, onInit or doCheck, those are set up
 * separately at elementStart.
 */
export function setupHooksDirectiveEnd(tView: TView, tNode: TNode): void {
  if (tView.firstTemplatePass) {
    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
      const def = tView.data[i] as DirectiveDef<any>;
      if (def.afterContentInit) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentInit);
      }

      if (def.afterContentChecked) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentChecked);
        (tView.contentCheckHooks || (tView.contentCheckHooks = [
         ])).push(i, def.afterContentChecked);
      }

      if (def.afterViewInit) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewInit);
      }

      if (def.afterViewChecked) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewChecked);
        (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, def.afterViewChecked);
      }

      if (def.onDestroy != null) {
        (tView.destroyHooks || (tView.destroyHooks = [])).push(i, def.onDestroy);
      }
    }
  }
}

/**
 * Executes necessary hooks at the start of executing a template.
 *
 * Executes hooks that are to be run during the initialization of a directive such
 * as `onChanges`, `onInit`, and `doCheck`.
 *
 * Has the side effect of updating the RunInit flag in `lView` to be `0`, so that
 * this isn't run a second time.
 *
 * @param lView The current view
 * @param tView Static data for the view containing the hooks to be executed
 * @param creationMode Whether or not we're in creation mode.
 */
export function executeInitHooks(
    currentView: LView, tView: TView, checkNoChangesMode: boolean): void {
  if (!checkNoChangesMode && currentView[FLAGS] & LViewFlags.RunInit) {
    executeHooks(currentView, tView.initHooks, tView.checkHooks, checkNoChangesMode);
    currentView[FLAGS] &= ~LViewFlags.RunInit;
  }
}

/**
 * Executes hooks against the given `LView` based off of whether or not
 * This is the first pass.
 *
 * @param lView The view instance data to run the hooks against
 * @param firstPassHooks An array of hooks to run if we're in the first view pass
 * @param checkHooks An Array of hooks to run if we're not in the first view pass.
 * @param checkNoChangesMode Whether or not we're in no changes mode.
 */
export function executeHooks(
    currentView: LView, firstPassHooks: HookData | null, checkHooks: HookData | null,
    checkNoChangesMode: boolean): void {
  if (checkNoChangesMode) return;

  const hooksToCall = currentView[FLAGS] & LViewFlags.FirstLViewPass ? firstPassHooks : checkHooks;
  if (hooksToCall) {
    callHooks(currentView, hooksToCall);
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass, and skipping onChanges hooks if there are no changes present.
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 */
export function callHooks(currentView: any[], arr: HookData): void {
  for (let i = 0; i < arr.length; i += 2) {
    const index = arr[i] as number;
    const hook = arr[i + 1] as any;
    const isOnChangesHook = index < 0;
    const directive = currentView[isOnChangesHook ? -index : index];

    if (isOnChangesHook) {
      const onChanges: OnChangesDirectiveWrapper = directive;
      const changes = onChanges.changes;
      if (changes) {
        onChanges.previous = changes;
        onChanges.changes = null;
        hook.call(onChanges.instance, changes);
      }
    } else {
      hook.call(directive);
    }
  }
}
