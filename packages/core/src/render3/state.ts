/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from './assert';
import {executeHooks} from './hooks';
import {ComponentDef, DirectiveDef} from './interfaces/definition';
import {TElementNode, TNode, TNodeFlags, TViewNode} from './interfaces/node';
import {LQueries} from './interfaces/query';
import {BINDING_INDEX, CONTEXT, DECLARATION_VIEW, FLAGS, HOST_NODE, LView, LViewFlags, OpaqueViewState, QUERIES, TVIEW} from './interfaces/view';
import {isContentQueryHost} from './util';



/**
 * Store the element depth count. This is used to identify the root elements of the template
 * so that we can than attach `LView` to only those elements.
 */
let elementDepthCount !: number;

export function getElementDepthCount() {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return elementDepthCount;
}

export function increaseElementDepthCount() {
  elementDepthCount++;
}

export function decreaseElementDepthCount() {
  elementDepthCount--;
}

let currentDirectiveDef: DirectiveDef<any>|ComponentDef<any>|null = null;

export function getCurrentDirectiveDef(): DirectiveDef<any>|ComponentDef<any>|null {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return currentDirectiveDef;
}

export function setCurrentDirectiveDef(def: DirectiveDef<any>| ComponentDef<any>| null): void {
  currentDirectiveDef = def;
}

/**
 * Stores whether directives should be matched to elements.
 *
 * When template contains `ngNonBindable` than we need to prevent the runtime form matching
 * directives on children of that element.
 *
 * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 * </div>
 * ```
 */
let bindingsEnabled !: boolean;

export function getBindingsEnabled(): boolean {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return bindingsEnabled;
}


/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- disabledBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- enableBindings() -->
 * </div>
 * ```
 */
export function enableBindings(): void {
  bindingsEnabled = true;
}

/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- disabledBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- enableBindings() -->
 * </div>
 * ```
 */
export function disableBindings(): void {
  bindingsEnabled = false;
}

export function getLView(): LView {
  return lView;
}

/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 */
export function restoreView(viewToRestore: OpaqueViewState) {
  contextLView = viewToRestore as any as LView;
}

/** Used to set the parent property when nodes are created and track query results. */
let previousOrParentTNode: TNode;

export function getPreviousOrParentTNode(): TNode {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return previousOrParentTNode;
}

export function setPreviousOrParentTNode(tNode: TNode) {
  previousOrParentTNode = tNode;
}

export function setTNodeAndViewData(tNode: TNode, view: LView) {
  previousOrParentTNode = tNode;
  lView = view;
}

/**
 * If `isParent` is:
 *  - `true`: then `previousOrParentTNode` points to a parent node.
 *  - `false`: then `previousOrParentTNode` points to previous node (sibling).
 */
let isParent: boolean;

export function getIsParent(): boolean {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return isParent;
}

export function setIsParent(value: boolean): void {
  isParent = value;
}

/**
 * Query instructions can ask for "current queries" in 2 different cases:
 * - when creating view queries (at the root of a component view, before any node is created - in
 * this case currentQueries points to view queries)
 * - when creating content queries (i.e. this previousOrParentTNode points to a node on which we
 * create content queries).
 */
export function getOrCreateCurrentQueries(
    QueryType: {new (parent: null, shallow: null, deep: null): LQueries}): LQueries {
  const lView = getLView();
  let currentQueries = lView[QUERIES];
  // if this is the first content query on a node, any existing LQueries needs to be cloned
  // in subsequent template passes, the cloning occurs before directive instantiation.
  if (previousOrParentTNode && previousOrParentTNode !== lView[HOST_NODE] &&
      !isContentQueryHost(previousOrParentTNode)) {
    currentQueries && (currentQueries = lView[QUERIES] = currentQueries.clone());
    previousOrParentTNode.flags |= TNodeFlags.hasContentQuery;
  }

  return currentQueries || (lView[QUERIES] = new QueryType(null, null, null));
}

/** Checks whether a given view is in creation mode */
export function isCreationMode(view: LView = lView): boolean {
  return (view[FLAGS] & LViewFlags.CreationMode) === LViewFlags.CreationMode;
}

/**
 * State of the current view being processed.
 *
 * An array of nodes (text, element, container, etc), pipes, their bindings, and
 * any local variables that need to be stored between invocations.
 */
let lView: LView;

/**
 * The last viewData retrieved by nextContext().
 * Allows building nextContext() and reference() calls.
 *
 * e.g. const inner = x().$implicit; const outer = x().$implicit;
 */
let contextLView: LView = null !;

export function getContextLView(): LView {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return contextLView;
}

/**
 * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
 *
 * Necessary to support ChangeDetectorRef.checkNoChanges().
 */
let checkNoChangesMode = false;

export function getCheckNoChangesMode(): boolean {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return checkNoChangesMode;
}

export function setCheckNoChangesMode(mode: boolean): void {
  checkNoChangesMode = mode;
}

/** Whether or not this is the first time the current view has been processed. */
let firstTemplatePass = true;

export function getFirstTemplatePass(): boolean {
  return firstTemplatePass;
}

export function setFirstTemplatePass(value: boolean): void {
  firstTemplatePass = value;
}

/**
 * The root index from which pure function instructions should calculate their binding
 * indices. In component views, this is TView.bindingStartIndex. In a host binding
 * context, this is the TView.expandoStartIndex + any dirs/hostVars before the given dir.
 */
let bindingRootIndex: number = -1;

// top level variables should not be exported for performance reasons (PERF_NOTES.md)
export function getBindingRoot() {
  return bindingRootIndex;
}

export function setBindingRoot(value: number) {
  bindingRootIndex = value;
}

/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export function enterView(newView: LView, hostTNode: TElementNode | TViewNode | null): LView {
  const oldView = lView;
  if (newView) {
    const tView = newView[TVIEW];
    firstTemplatePass = tView.firstTemplatePass;
    bindingRootIndex = tView.bindingStartIndex;
  }

  previousOrParentTNode = hostTNode !;
  isParent = true;

  lView = contextLView = newView;
  return oldView;
}

export function nextContextImpl<T = any>(level: number = 1): T {
  contextLView = walkUpViews(level, contextLView !);
  return contextLView[CONTEXT] as T;
}

function walkUpViews(nestingLevel: number, currentView: LView): LView {
  while (nestingLevel > 0) {
    ngDevMode && assertDefined(
                     currentView[DECLARATION_VIEW],
                     'Declaration view should be defined if nesting level is greater than 0.');
    currentView = currentView[DECLARATION_VIEW] !;
    nestingLevel--;
  }
  return currentView;
}

/**
 * Resets the application state.
 */
export function resetComponentState() {
  isParent = false;
  previousOrParentTNode = null !;
  elementDepthCount = 0;
  bindingsEnabled = true;
}

/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 *
 * @param newView New state to become active
 */
export function leaveView(newView: LView): void {
  const tView = lView[TVIEW];
  if (isCreationMode(lView)) {
    lView[FLAGS] &= ~LViewFlags.CreationMode;
  } else {
    executeHooks(lView, tView.viewHooks, tView.viewCheckHooks, checkNoChangesMode);
    // Views are clean and in update mode after being checked, so these bits are cleared
    lView[FLAGS] &= ~(LViewFlags.Dirty | LViewFlags.FirstLViewPass);
    lView[FLAGS] |= LViewFlags.RunInit;
    lView[BINDING_INDEX] = tView.bindingStartIndex;
  }
  enterView(newView, null);
}
