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
import {ComponentDef, DirectiveDef} from './interfaces/definition';
import {TElementNode, TNode, TViewNode} from './interfaces/node';
import {CONTEXT, DECLARATION_VIEW, LView, OpaqueViewState, TVIEW} from './interfaces/view';
import {resetStylingState} from './styling_next/state';


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
let activeDirectiveId = 0;

/**
 * Flags used for an active element during change detection.
 *
 * These flags are used within other instructions to inform cleanup or
 * exit operations to run when an element is being processed.
 *
 * Note that these flags are reset each time an element changes (whether it
 * happens when `advance()` is run or when change detection exits out of a template
 * function or when all host bindings are processed for an element).
 */
export const enum ActiveElementFlags {
  Initial = 0b00,
  RunExitFn = 0b01,
  ResetStylesOnExit = 0b10,
  Size = 2,
}

/**
 * Determines whether or not a flag is currently set for the active element.
 */
export function hasActiveElementFlag(flag: ActiveElementFlags) {
  return (_selectedIndex & flag) === flag;
}

/**
 * Sets a flag is for the active element.
 */
export function setActiveElementFlag(flag: ActiveElementFlags) {
  _selectedIndex |= flag;
}

/**
 * Sets the active directive host element and resets the directive id value
 * (when the provided elementIndex value has changed).
 *
 * @param elementIndex the element index value for the host element where
 *                     the directive/component instance lives
 */
export function setActiveHostElement(elementIndex: number | null = null) {
  if (getSelectedIndex() !== elementIndex) {
    if (hasActiveElementFlag(ActiveElementFlags.RunExitFn)) {
      executeElementExitFn();
    }
    if (hasActiveElementFlag(ActiveElementFlags.ResetStylesOnExit)) {
      resetStylingState();
    }
    setSelectedIndex(elementIndex === null ? -1 : elementIndex);
    activeDirectiveId = 0;
  }
}

let _elementExitFn: Function|null = null;
export function executeElementExitFn() {
  _elementExitFn !();
}

/**
 * Queues a function to be run once the element is "exited" in CD.
 *
 * Change detection will focus on an element either when the `advance()`
 * instruction is called or when the template or host bindings instruction
 * code is invoked. The element is then "exited" when the next element is
 * selected or when change detection for the template or host bindings is
 * complete. When this occurs (the element change operation) then an exit
 * function will be invoked if it has been set. This function can be used
 * to assign that exit function.
 *
 * @param fn
 */
export function setElementExitFn(fn: Function): void {
  setActiveElementFlag(ActiveElementFlags.RunExitFn);
  _elementExitFn = fn;
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
  // Each directive gets a uniqueId value that is the same for both
  // create and update calls when the hostBindings function is called. The
  // directive uniqueId is not set anywhere--it is just incremented between
  // each hostBindings call and is useful for helping instruction code
  // uniquely determine which directive is currently active when executed.
  activeDirectiveId += 1;
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
 * Swap the current lView with a new lView.
 *
 * For performance reasons we store the lView in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the lView for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New lView to become active
 * @param host Element to which the View is a child of
 * @returns the previously active lView;
 */
export function selectView(newView: LView, hostTNode: TElementNode | TViewNode | null): LView {
  ngDevMode && assertLViewOrUndefined(newView);
  const oldView = lView;

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
}

/* tslint:disable */
let _selectedIndex = -1 << ActiveElementFlags.Size;

/**
 * Gets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function getSelectedIndex() {
  return _selectedIndex >> ActiveElementFlags.Size;
}

/**
 * Sets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 *
 * (Note that if an "exit function" was set earlier (via `setElementExitFn()`) then that will be
 * run if and when the provided `index` value is different from the current selected index value.)
 */
export function setSelectedIndex(index: number) {
  _selectedIndex = index << ActiveElementFlags.Size;
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
