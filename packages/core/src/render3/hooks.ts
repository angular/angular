/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChanges} from '../interface/simple_change';
import {assertEqual} from '../util/assert';

import {DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {FLAGS, HookData, LView, LViewFlags, TView} from './interfaces/view';
import {OnChangesDirectiveWrapper, unwrapOnChangesDirectiveWrapper} from './onchanges_util';



/**
 * Adds all directive lifecycle hooks from the given `DirectiveDef` to the given `TView`.
 *
 * Must be run *only* on the first template pass.
 *
 * The TView's hooks arrays are arranged in alternating pairs of directiveIndex and hookFunction,
 * i.e.: `[directiveIndexA, hookFunctionA, directiveIndexB, hookFunctionB, ...]`. For `OnChanges`
 * hooks, the `directiveIndex` will be *negative*, signaling {@link callHooks} that the
 * `hookFunction` must be passed the the appropriate {@link SimpleChanges} object.
 *
 * @param directiveIndex The index of the directive in LView
 * @param directiveDef The definition containing the hooks to setup in tView
 * @param tView The current TView
 */
export function registerPreOrderHooks(
    directiveIndex: number, directiveDef: DirectiveDef<any>, tView: TView): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');

  const {onChanges, onInit, doCheck} = directiveDef;

  if (onChanges) {
    (tView.initHooks || (tView.initHooks = [])).push(-directiveIndex, onChanges);
    (tView.checkHooks || (tView.checkHooks = [])).push(-directiveIndex, onChanges);
  }

  if (onInit) {
    (tView.initHooks || (tView.initHooks = [])).push(directiveIndex, onInit);
  }

  if (doCheck) {
    (tView.initHooks || (tView.initHooks = [])).push(directiveIndex, doCheck);
    (tView.checkHooks || (tView.checkHooks = [])).push(directiveIndex, doCheck);
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
 * Sets up the content, view, and destroy hooks on the provided `tView` such that
 * they're added in alternating pairs of directiveIndex and hookFunction,
 * i.e.: `[directiveIndexA, hookFunctionA, directiveIndexB, hookFunctionB, ...]`
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
        (tView.contentHooks || (tView.contentHooks = [])).push(i, directiveDef.afterContentInit);
      }

      if (directiveDef.afterContentChecked) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, directiveDef.afterContentChecked);
        (tView.contentCheckHooks || (tView.contentCheckHooks = [
         ])).push(i, directiveDef.afterContentChecked);
      }

      if (directiveDef.afterViewInit) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, directiveDef.afterViewInit);
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
 * @param checkNoChangesMode Whether or not we're in checkNoChanges mode.
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
export function callHooks(currentView: LView, arr: HookData): void {
  for (let i = 0; i < arr.length; i += 2) {
    const directiveIndex = arr[i] as number;
    const hook = arr[i + 1] as((() => void) | ((changes: SimpleChanges) => void));
    // Negative indices signal that we're dealing with an `onChanges` hook.
    const isOnChangesHook = directiveIndex < 0;
    const directiveOrWrappedDirective =
        currentView[isOnChangesHook ? -directiveIndex : directiveIndex];
    const directive = unwrapOnChangesDirectiveWrapper(directiveOrWrappedDirective);

    if (isOnChangesHook) {
      const onChanges: OnChangesDirectiveWrapper = directiveOrWrappedDirective;
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
