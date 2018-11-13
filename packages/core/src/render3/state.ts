/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Sanitizer} from '../sanitization/security';

import {assertDefined, assertEqual} from './assert';
import {executeHooks} from './hooks';
import {TElementNode, TNode, TNodeFlags, TViewNode} from './interfaces/node';
import {LQueries} from './interfaces/query';
import {Renderer3, RendererFactory3} from './interfaces/renderer';
import {BINDING_INDEX, CLEANUP, CONTEXT, DECLARATION_VIEW, FLAGS, HOST_NODE, LViewData, LViewFlags, OpaqueViewState, QUERIES, RENDERER, SANITIZER, TVIEW, TView} from './interfaces/view';
import {assertDataInRangeInternal, isContentQueryHost} from './util';

/**
 * This property gets set before entering a template.
 *
 * This renderer can be one of two varieties of Renderer3:
 *
 * - ObjectedOrientedRenderer3
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade (reducing payload
 * size).
 *
 * - ProceduralRenderer3
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the facade
 * that enables element manipulation. This also facilitates backwards compatibility with
 * Renderer2.
 */
let renderer: Renderer3;

export function getRenderer(): Renderer3 {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return renderer;
}

export function setRenderer(r: Renderer3): void {
  renderer = r;
}

let rendererFactory: RendererFactory3;

export function getRendererFactory(): RendererFactory3 {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return rendererFactory;
}

export function setRendererFactory(factory: RendererFactory3): void {
  rendererFactory = factory;
}

export function getCurrentSanitizer(): Sanitizer|null {
  return viewData && viewData[SANITIZER];
}

/**
 * Store the element depth count. This is used to identify the root elements of the template
 * so that we can than attach `LViewData` to only those elements.
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

/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 */
export function getCurrentView(): OpaqueViewState {
  return viewData as any as OpaqueViewState;
}

export function _getViewData(): LViewData {
  return viewData;
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
  contextViewData = viewToRestore as any as LViewData;
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

export function setTNodeAndViewData(tNode: TNode, view: LViewData) {
  previousOrParentTNode = tNode;
  viewData = view;
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

let tView: TView;

export function getTView(): TView {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return tView;
}

let currentQueries: LQueries|null;

export function getCurrentQueries(): LQueries|null {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return currentQueries;
}

export function setCurrentQueries(queries: LQueries | null): void {
  currentQueries = queries;
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
  // if this is the first content query on a node, any existing LQueries needs to be cloned
  // in subsequent template passes, the cloning occurs before directive instantiation.
  if (previousOrParentTNode && previousOrParentTNode !== viewData[HOST_NODE] &&
      !isContentQueryHost(previousOrParentTNode)) {
    currentQueries && (currentQueries = currentQueries.clone());
    previousOrParentTNode.flags |= TNodeFlags.hasContentQuery;
  }

  return currentQueries || (currentQueries = new QueryType(null, null, null));
}

/**
 * This property gets set before entering a template.
 */
let creationMode: boolean;

export function getCreationMode(): boolean {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return creationMode;
}

/**
 * State of the current view being processed.
 *
 * An array of nodes (text, element, container, etc), pipes, their bindings, and
 * any local variables that need to be stored between invocations.
 */
let viewData: LViewData;

/**
 * Internal function that returns the current LViewData instance.
 *
 * The getCurrentView() instruction should be used for anything public.
 */
export function getViewData(): LViewData {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return viewData;
}

/**
 * The last viewData retrieved by nextContext().
 * Allows building nextContext() and reference() calls.
 *
 * e.g. const inner = x().$implicit; const outer = x().$implicit;
 */
let contextViewData: LViewData = null !;

export function getContextViewData(): LViewData {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return contextViewData;
}

export function getCleanup(view: LViewData): any[] {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return view[CLEANUP] || (view[CLEANUP] = []);
}

export function getTViewCleanup(view: LViewData): any[] {
  return view[TVIEW].cleanup || (view[TVIEW].cleanup = []);
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
export function enterView(
    newView: LViewData, hostTNode: TElementNode | TViewNode | null): LViewData {
  const oldView: LViewData = viewData;
  tView = newView && newView[TVIEW];

  creationMode = newView && (newView[FLAGS] & LViewFlags.CreationMode) === LViewFlags.CreationMode;
  firstTemplatePass = newView && tView.firstTemplatePass;
  bindingRootIndex = newView && tView.bindingStartIndex;
  renderer = newView && newView[RENDERER];

  previousOrParentTNode = hostTNode !;
  isParent = true;

  viewData = contextViewData = newView;
  oldView && (oldView[QUERIES] = currentQueries);
  currentQueries = newView && newView[QUERIES];

  return oldView;
}

export function nextContextImpl<T = any>(level: number = 1): T {
  contextViewData = walkUpViews(level, contextViewData !);
  return contextViewData[CONTEXT] as T;
}

function walkUpViews(nestingLevel: number, currentView: LViewData): LViewData {
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
 * @param creationOnly An optional boolean to indicate that the view was processed in creation mode
 * only, i.e. the first update will be done later. Only possible for dynamically created views.
 */
export function leaveView(newView: LViewData, creationOnly?: boolean): void {
  if (!creationOnly) {
    if (!checkNoChangesMode) {
      executeHooks(viewData, tView.viewHooks, tView.viewCheckHooks, creationMode);
    }
    // Views are clean and in update mode after being checked, so these bits are cleared
    viewData[FLAGS] &= ~(LViewFlags.CreationMode | LViewFlags.Dirty);
  }
  viewData[FLAGS] |= LViewFlags.RunInit;
  viewData[BINDING_INDEX] = tView.bindingStartIndex;
  enterView(newView, null);
}

export function assertPreviousIsParent() {
  assertEqual(isParent, true, 'previousOrParentTNode should be a parent');
}

export function assertHasParent() {
  assertDefined(previousOrParentTNode.parent, 'previousOrParentTNode should have a parent');
}

export function assertDataInRange(index: number, arr?: any[]) {
  if (arr == null) arr = viewData;
  assertDataInRangeInternal(index, arr || viewData);
}

export function assertDataNext(index: number, arr?: any[]) {
  if (arr == null) arr = viewData;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}
