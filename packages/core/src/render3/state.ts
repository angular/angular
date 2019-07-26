/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleSanitizeFn} from '../sanitization/style_sanitizer';
import {assertDefined} from '../util/assert';

import {assertLViewOrUndefined} from './assert';
import {executeHooks} from './hooks';
import {ComponentDef, DirectiveDef} from './interfaces/definition';
import {TElementNode, TNode, TViewNode} from './interfaces/node';
import {BINDING_INDEX, CONTEXT, DECLARATION_VIEW, FLAGS, InitPhaseState, LView, LViewFlags, OpaqueViewState, TVIEW} from './interfaces/view';
import {resetAllStylingState, resetStylingState} from './styling_next/state';
import {resetPreOrderHookFlags} from './util/view_utils';



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
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
export function ɵɵenableBindings(): void {
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
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
export function ɵɵdisableBindings(): void {
  bindingsEnabled = false;
}

export function getLView(): LView {
  return lView;
}

/**
 * Used as the starting directive id value.
 *
 * All subsequent directives are incremented from this value onwards.
 * The reason why this value is `1` instead of `0` is because the `0`
 * value is reserved for the template.
 */
const MIN_DIRECTIVE_ID = 1;

let activeDirectiveId = MIN_DIRECTIVE_ID;

/**
 * Position depth (with respect from leaf to root) in a directive sub-class inheritance chain.
 */
let activeDirectiveSuperClassDepthPosition = 0;

/**
 * Total count of how many directives are a part of an inheritance chain.
 *
 * When directives are sub-classed (extended) from one to another, Angular
 * needs to keep track of exactly how many were encountered so it can accurately
 * generate the next directive id (once the next directive id is visited).
 * Normally the next directive id just a single incremented value from the
 * previous one, however, if the previous directive is a part of an inheritance
 * chain (a series of sub-classed directives) then the incremented value must
 * also take into account the total amount of sub-classed values.
 *
 * Note that this value resets back to zero once the next directive is
 * visited (when `incrementActiveDirectiveId` or `setActiveHostElement`
 * is called).
 */
let activeDirectiveSuperClassHeight = 0;

/**
 * Sets the active directive host element and resets the directive id value
 * (when the provided elementIndex value has changed).
 *
 * @param elementIndex the element index value for the host element where
 *                     the directive/component instance lives
 */
export function setActiveHostElement(elementIndex: number | null = null) {
  if (_selectedIndex !== elementIndex) {
    setSelectedIndex(elementIndex === null ? -1 : elementIndex);
    activeDirectiveId = elementIndex === null ? 0 : MIN_DIRECTIVE_ID;
    activeDirectiveSuperClassDepthPosition = 0;
    activeDirectiveSuperClassHeight = 0;
  }
}

/**
 * Returns the current id value of the current directive.
 *
 * For example we have an element that has two directives on it:
 * <div dir-one dir-two></div>
 *
 * dirOne->hostBindings() (id == 1)
 * dirTwo->hostBindings() (id == 2)
 *
 * Note that this is only active when `hostBinding` functions are being processed.
 *
 * Note that directive id values are specific to an element (this means that
 * the same id value could be present on another element with a completely
 * different set of directives).
 */
export function getActiveDirectiveId() {
  return activeDirectiveId;
}

/**
 * Increments the current directive id value.
 *
 * For example we have an element that has two directives on it:
 * <div dir-one dir-two></div>
 *
 * dirOne->hostBindings() (index = 1)
 * // increment
 * dirTwo->hostBindings() (index = 2)
 *
 * Depending on whether or not a previous directive had any inherited
 * directives present, that value will be incremented in addition
 * to the id jumping up by one.
 *
 * Note that this is only active when `hostBinding` functions are being processed.
 *
 * Note that directive id values are specific to an element (this means that
 * the same id value could be present on another element with a completely
 * different set of directives).
 */
export function incrementActiveDirectiveId() {
  activeDirectiveId += 1 + activeDirectiveSuperClassHeight;

  // because we are dealing with a new directive this
  // means we have exited out of the inheritance chain
  activeDirectiveSuperClassDepthPosition = 0;
  activeDirectiveSuperClassHeight = 0;
}

/**
 * Set the current super class (reverse inheritance) position depth for a directive.
 *
 * For example we have two directives: Child and Other (but Child is a sub-class of Parent)
 * <div child-dir other-dir></div>
 *
 * // increment
 * parentInstance->hostBindings() (depth = 1)
 * // decrement
 * childInstance->hostBindings() (depth = 0)
 * otherInstance->hostBindings() (depth = 0 b/c it's a different directive)
 *
 * Note that this is only active when `hostBinding` functions are being processed.
 */
export function adjustActiveDirectiveSuperClassDepthPosition(delta: number) {
  activeDirectiveSuperClassDepthPosition += delta;

  // we keep track of the height value so that when the next directive is visited
  // then Angular knows to generate a new directive id value which has taken into
  // account how many sub-class directives were a part of the previous directive.
  activeDirectiveSuperClassHeight =
      Math.max(activeDirectiveSuperClassHeight, activeDirectiveSuperClassDepthPosition);
}

/**
 * Returns he current depth of the super/sub class inheritance chain.
 *
 * This will return how many inherited directive/component classes
 * exist in the current chain.
 *
 * ```typescript
 * @Directive({ selector: '[super-dir]' })
 * class SuperDir {}
 *
 * @Directive({ selector: '[sub-dir]' })
 * class SubDir extends SuperDir {}
 *
 * // if `<div sub-dir>` is used then the super class height is `1`
 * // if `<div super-dir>` is used then the super class height is `0`
 * ```
 */
export function getActiveDirectiveSuperClassHeight() {
  return activeDirectiveSuperClassHeight;
}

/**
 * Returns the current super class (reverse inheritance) depth for a directive.
 *
 * This is designed to help instruction code distinguish different hostBindings
 * calls from each other when a directive has extended from another directive.
 * Normally using the directive id value is enough, but with the case
 * of parent/sub-class directive inheritance more information is required.
 *
 * Note that this is only active when `hostBinding` functions are being processed.
 */
export function getActiveDirectiveSuperClassDepth() {
  return activeDirectiveSuperClassDepthPosition;
}

/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 *
 * @codeGenApi
 */
export function ɵɵrestoreView(viewToRestore: OpaqueViewState) {
  contextLView = viewToRestore as any as LView;
}

/** Used to set the parent property when nodes are created and track query results. */
let previousOrParentTNode: TNode;

export function getPreviousOrParentTNode(): TNode {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return previousOrParentTNode;
}

export function setPreviousOrParentTNode(tNode: TNode, _isParent: boolean) {
  previousOrParentTNode = tNode;
  isParent = _isParent;
}

export function setTNodeAndViewData(tNode: TNode, view: LView) {
  ngDevMode && assertLViewOrUndefined(view);
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

export function setIsNotParent(): void {
  isParent = false;
}
export function setIsParent(): void {
  isParent = true;
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
 * Current index of a View or Content Query which needs to be processed next.
 * We iterate over the list of Queries and increment current query index at every step.
 */
let currentQueryIndex: number = 0;

export function getCurrentQueryIndex(): number {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return currentQueryIndex;
}

export function setCurrentQueryIndex(value: number): void {
  currentQueryIndex = value;
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
  ngDevMode && assertLViewOrUndefined(newView);
  const oldView = lView;
  if (newView) {
    const tView = newView[TVIEW];
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
  setCurrentStyleSanitizer(null);
  resetAllStylingState();
}

/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 *
 * @param newView New state to become active
 * @param safeToRunHooks Whether the runtime is in a state where running lifecycle hooks is valid.
 * This is not always the case (for example, the application may have crashed and `leaveView` is
 * being executed while unwinding the call stack).
 */
export function leaveView(newView: LView, safeToRunHooks: boolean): void {
  const tView = lView[TVIEW];
  if (isCreationMode(lView)) {
    lView[FLAGS] &= ~LViewFlags.CreationMode;
  } else {
    try {
      resetPreOrderHookFlags(lView);
      safeToRunHooks && executeHooks(
                            lView, tView.viewHooks, tView.viewCheckHooks, checkNoChangesMode,
                            InitPhaseState.AfterViewInitHooksToBeRun, undefined);
    } finally {
      // Views are clean and in update mode after being checked, so these bits are cleared
      lView[FLAGS] &= ~(LViewFlags.Dirty | LViewFlags.FirstLViewPass);
      lView[BINDING_INDEX] = tView.bindingStartIndex;
    }
  }
  enterView(newView, null);
}

let _selectedIndex = -1;

/**
 * Gets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function getSelectedIndex() {
  return _selectedIndex;
}

/**
 * Sets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function setSelectedIndex(index: number) {
  _selectedIndex = index;

  // we have now jumped to another element
  // therefore the state is stale
  resetStylingState();
}


let _currentNamespace: string|null = null;

/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceSVG() {
  _currentNamespace = 'http://www.w3.org/2000/svg';
}

/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceMathML() {
  _currentNamespace = 'http://www.w3.org/1998/MathML/';
}

/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceHTML() {
  namespaceHTMLInternal();
}

/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 */
export function namespaceHTMLInternal() {
  _currentNamespace = null;
}

export function getNamespace(): string|null {
  return _currentNamespace;
}

let _currentSanitizer: StyleSanitizeFn|null;
export function setCurrentStyleSanitizer(sanitizer: StyleSanitizeFn | null) {
  _currentSanitizer = sanitizer;
}

export function getCurrentStyleSanitizer() {
  return _currentSanitizer;
}
