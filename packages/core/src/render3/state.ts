/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleSanitizeFn} from '../sanitization/style_sanitizer';
import {assertDefined, assertEqual} from '../util/assert';

import {assertLViewOrUndefined} from './assert';
import {ComponentDef, DirectiveDef} from './interfaces/definition';
import {TNode} from './interfaces/node';
import {CONTEXT, DECLARATION_VIEW, LView, OpaqueViewState, TVIEW} from './interfaces/view';


/**
 *
 */
interface LFrame {
  /**
   * Parent LFrame.
   *
   * This is needed when `leaveView` is called to restore the previous state.
   */
  parent: LFrame;

  /**
   * Child LFrame.
   *
   * This is used to cache existing LFrames to relieve the memory pressure.
   */
  child: LFrame|null;

  /**
   * State of the current view being processed.
   *
   * An array of nodes (text, element, container, etc), pipes, their bindings, and
   * any local variables that need to be stored between invocations.
   */
  lView: LView;

  /**
   * Used to set the parent property when nodes are created and track query results.
   *
   * This is used in conjection with `isParent`.
   */
  previousOrParentTNode: TNode;

  /**
   * If `isParent` is:
   *  - `true`: then `previousOrParentTNode` points to a parent node.
   *  - `false`: then `previousOrParentTNode` points to previous node (sibling).
   */
  isParent: boolean;

  /**
   * Index of currently selected element in LView.
   *
   * Used by binding instructions. Updated as part of advance instruction.
   */
  selectedIndex: number;

  /**
   * Current pointer to the binding index.
   */
  bindingIndex: number;

  /**
   * Store the element depth count. This is used to identify the root elements of the template
   * so that we can then attach patch data `LView` to only those elements. We know that those
   * are the only places where the patch data could change, this way we will save on number
   * of places where tha patching occurs.
   */
  elementDepthCount: number;

  expando: LFrameExpando|null;
}

/**
 * Stores values which are not often used.
 *
 * For performance reasons we would like to keep the `LFrame` as small as possible.
 * However, there are many properties which are used only rarely by the instructions but still need
 * to be tracked. These are attached lazily to the `LFrame` through the `LFrameExpando`.
 */
interface LFrameExpando {
  /**
   * To relieve memory presure the `LFrameExpando`s are kept in linked list for reuse.
   */
  parent: LFrameExpando|null;
  child: LFrameExpando|null;

  /**
   * The last viewData retrieved by nextContext().
   * Allows building nextContext() and reference() calls.
   *
   * e.g. const inner = x().$implicit; const outer = x().$implicit;
   */
  contextLView: LView;

  /**
   * Current namespace to be used when creating elements
   */
  currentNamespace: string|null;

  /**
   * Current sanitizer
   */
  currentSanitizer: StyleSanitizeFn|null;

  /**
   * Used when processing host bindings.
   */
  currentDirectiveDef: DirectiveDef<any>|ComponentDef<any>|null;

  /**
   * Used as the starting directive id value.
   *
   * All subsequent directives are incremented from this value onwards.
   * The reason why this value is `1` instead of `0` is because the `0`
   * value is reserved for the template.
   */
  activeDirectiveId: number;

  /**
   * The root index from which pure function instructions should calculate their binding
   * indices. In component views, this is TView.bindingStartIndex. In a host binding
   * context, this is the TView.expandoStartIndex + any dirs/hostVars before the given dir.
   */
  bindingRootIndex: number;

  /**
   * Current index of a View or Content Query which needs to be processed next.
   * We iterate over the list of Queries and increment current query index at every step.
   */
  currentQueryIndex: number;
}

/**
 * All implicit instruction state is stored here.
 *
 * It is useful to have a single object where all of the state is stored as a mental model
 * (rather it being spread across many different variables.)
 *
 * PERF NOTE: Turns out that writing to a true global variable is slower than
 * having an intermediate object with properties.
 */
interface InstructionState {
  /**
   * Current `LFrame`
   *
   * `null` if we have not called `enterView`
   */
  lFrame: LFrame;

  /**
   * Pointer to the next available expando for caching purposes.
   */
  nextExpando: LFrameExpando;

  /**
   * Stores whether directives should be matched to elements.
   *
   * When template contains `ngNonBindable` then we need to prevent the runtime from matching
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
  bindingsEnabled: boolean;

  /**
   * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
   *
   * Necessary to support ChangeDetectorRef.checkNoChanges().
   */
  checkNoChangesMode: boolean;

  /**
   * Function to be called when the element is exited.
   *
   * NOTE: The function is here for tree shakable purposes since it is only needed by styling.
   */
  elementExitFn: (() => void)|null;
}

export const instructionState: InstructionState = {
  lFrame: createLFrame(null),
  nextExpando: createExpando(null),
  bindingsEnabled: true,
  elementExitFn: null,
  checkNoChangesMode: false,
};


export function getElementDepthCount() {
  return instructionState.lFrame.elementDepthCount;
}

export function increaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount++;
}

export function decreaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount--;
}

export function getCurrentDirectiveDef(): DirectiveDef<any>|ComponentDef<any>|null {
  const expando = instructionState.lFrame.expando;
  return expando === null ? null : expando.currentDirectiveDef;
}

export function setCurrentDirectiveDef(def: DirectiveDef<any>| ComponentDef<any>| null): void {
  const expando = shouldAssignToExpando(def, null);
  if (expando) expando.currentDirectiveDef = def;
}

export function getBindingsEnabled(): boolean {
  return instructionState.bindingsEnabled;
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
  instructionState.bindingsEnabled = true;
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
  instructionState.bindingsEnabled = false;
}

/**
 * Return the current LView.
 *
 * The return value can be `null` if the method is called outside of template. This can happen if
 * directive is instantiated by module injector (rather than by node injector.)
 */
export function getLView(): LView {
  // TODO(misko): the return value should be `LView|null` but doing so breaks a lot of code.
  const lFrame = instructionState.lFrame;
  return lFrame === null ? null ! : lFrame.lView;
}

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
  Size = 1,
}

/**
 * Determines whether or not a flag is currently set for the active element.
 */
export function hasActiveElementFlag(flag: ActiveElementFlags) {
  return (instructionState.lFrame.selectedIndex & flag) === flag;
}

/**
 * Sets a flag is for the active element.
 */
function setActiveElementFlag(flag: ActiveElementFlags) {
  instructionState.lFrame.selectedIndex |= flag;
}

/**
 * Sets the active directive host element and resets the directive id value
 * (when the provided elementIndex value has changed).
 *
 * @param elementIndex the element index value for the host element where
 *                     the directive/component instance lives
 */
export function setActiveHostElement(elementIndex: number | null = null) {
  if (hasActiveElementFlag(ActiveElementFlags.RunExitFn)) {
    executeElementExitFn();
  }
  setSelectedIndex(elementIndex === null ? -1 : elementIndex);
  const expando = shouldAssignToExpando(0, 0);
  if (expando) expando.activeDirectiveId = 0;
}

export function executeElementExitFn() {
  instructionState.elementExitFn !();
  instructionState.lFrame.selectedIndex &= ~ActiveElementFlags.RunExitFn;
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
export function setElementExitFn(fn: () => void): void {
  setActiveElementFlag(ActiveElementFlags.RunExitFn);
  if (instructionState.elementExitFn == null) {
    instructionState.elementExitFn = fn;
  }
  ngDevMode &&
      assertEqual(instructionState.elementExitFn, fn, 'Expecting to always get the same function');
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
  const expando = instructionState.lFrame.expando;
  return expando === null ? 0 : expando.activeDirectiveId;
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
  const expando = shouldAssignToExpando(1, 0);
  if (expando) expando.activeDirectiveId++;
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
  const restoreLView = viewToRestore as unknown as LView;
  const lFrame = instructionState.lFrame;
  const expando = lFrame.expando;
  if (expando === null) {
    if (lFrame.lView !== restoreLView) {
      // only create one if it is different.
      allocateExpando(lFrame).contextLView = restoreLView;
    }
  } else {
    expando.contextLView = restoreLView;
  };
}

function allocateExpando(lFrame: LFrame): LFrameExpando {
  const nextExpando = lFrame.expando = instructionState.nextExpando;
  instructionState.nextExpando =
      nextExpando.child || (nextExpando.child = createExpando(nextExpando));

  // Reset the expando
  nextExpando.contextLView == null !;
  nextExpando.currentNamespace = null;
  nextExpando.currentSanitizer = null;
  nextExpando.currentDirectiveDef = null;
  nextExpando.activeDirectiveId = 0;
  nextExpando.bindingRootIndex = -1;
  nextExpando.currentQueryIndex = 0;
  return nextExpando;
}

function createExpando(parent: LFrameExpando | null): LFrameExpando {
  return {
    parent: parent,             //
    child: null,                //
    contextLView: null !,       //
    currentNamespace: null,     //
    currentSanitizer: null,     //
    currentDirectiveDef: null,  //
    activeDirectiveId: 0,       //
    bindingRootIndex: -1,       //
    currentQueryIndex: 0,       //
  };
}

/**
 * Determines if the `LFrameExpando` should be allocated.
 *
 * Expando is only allocated if the value which we want to store is different from the default
 * value.
 *
 * @param value value to store
 * @param defaultValue expected default Value.
 */
function shouldAssignToExpando<T>(value: T, defaultValue: T): LFrameExpando|null {
  const lFrame = instructionState.lFrame;
  const expando = lFrame.expando;
  return expando !== null ? expando :  // if we have expando return it
      (value !== defaultValue ?        //
           allocateExpando(lFrame) :   // if we are setting something other than default than
                                       // allocate a new expando
           null                        // if we are setting same as default no need to create a new
                                       // expando, just rely on default behavior
       );
}

export function getPreviousOrParentTNode(): TNode {
  return instructionState.lFrame.previousOrParentTNode;
}

export function setPreviousOrParentTNode(tNode: TNode, _isParent: boolean) {
  instructionState.lFrame.previousOrParentTNode = tNode;
  instructionState.lFrame.isParent = _isParent;
}

export function getIsParent(): boolean {
  return instructionState.lFrame.isParent;
}

export function setIsNotParent(): void {
  instructionState.lFrame.isParent = false;
}
export function setIsParent(): void {
  instructionState.lFrame.isParent = true;
}

export function getContextLView(): LView {
  const lFrame = instructionState.lFrame;
  const expando = lFrame.expando;
  return expando === null ? lFrame.lView : expando.contextLView;
}

export function getCheckNoChangesMode(): boolean {
  return instructionState.checkNoChangesMode;
}

export function setCheckNoChangesMode(mode: boolean): void {
  instructionState.checkNoChangesMode = mode;
}

// top level variables should not be exported for performance reasons (PERF_NOTES.md)
export function getBindingRoot() {
  const lFrame = instructionState.lFrame;
  const expando = instructionState.lFrame.expando || allocateExpando(lFrame);
  let index = expando.bindingRootIndex;
  if (index === -1) {
    const lView = lFrame.lView;
    index = expando.bindingRootIndex = lView[TVIEW].bindingStartIndex;
  }
  return index;
}

export function getBindingIndex(): number {
  return instructionState.lFrame.bindingIndex;
}

export function setBindingIndex(value: number): number {
  return instructionState.lFrame.bindingIndex = value;
}

export function nextBindingIndex(): number {
  return instructionState.lFrame.bindingIndex++;
}

export function nextBindingIndex2(): number {
  const lFrame = instructionState.lFrame;
  const index = lFrame.bindingIndex;
  lFrame.bindingIndex = lFrame.bindingIndex + 2;
  return index;
}

export function incrementBindingIndex(count: number): number {
  return instructionState.lFrame.bindingIndex += count;
}

/**
 * Set a new binding root index so that host template functions can execute.
 *
 * Bindings inside the host template are 0 index. But because we don't know ahead of time
 * how many host bindings we have we can't pre-compute them. For this reason they are all
 * 0 index and we just shift the root so that they match next available location in the LView.
 * @param value
 */
export function setBindingRoot(value: number) {
  const expando = shouldAssignToExpando(value, -1);
  if (expando !== null) expando.bindingRootIndex = value;
}

export function getCurrentQueryIndex(): number {
  const expando = instructionState.lFrame.expando;
  return expando === null ? 0 : expando.currentQueryIndex;
}

export function setCurrentQueryIndex(value: number): void {
  const expando = shouldAssignToExpando(value, 0);
  if (expando !== null) expando.currentQueryIndex = value;
}

/**
 * This is a light weight version of the `enterView` which is needed by the DI system.
 * @param newView
 * @param tNode
 */
export function enterDI(newView: LView, tNode: TNode) {
  ngDevMode && assertLViewOrUndefined(newView);
  const newLFrame = allocLFrame();
  instructionState.lFrame = newLFrame;
  newLFrame.previousOrParentTNode = tNode !;
  newLFrame.lView = newView;
  if (ngDevMode) {
    // resetting for safety in dev mode only.
    newLFrame.isParent = DEV_MODE_VALUE;
    newLFrame.selectedIndex = DEV_MODE_VALUE;
    newLFrame.elementDepthCount = DEV_MODE_VALUE;
  }
}

const DEV_MODE_VALUE: any =
    'Value indicating that DI is trying to read value which it should not need to know about.';

/**
 * This is a light weight version of the `leaveView` which is needed by the DI system.
 *
 * Because the implementation is same it is only an alias
 */
export const leaveDI = leaveView;

/**
 * Swap the current lView with a new lView.
 *
 * For performance reasons we store the lView in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the lView for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New lView to become active
 * @param tNode Element to which the View is a child of
 * @returns the previously active lView;
 */
export function enterView(newView: LView, tNode: TNode | null): void {
  ngDevMode && assertLViewOrUndefined(newView);
  const newLFrame = allocLFrame();
  instructionState.lFrame = newLFrame;
  newLFrame.previousOrParentTNode = tNode !;
  newLFrame.isParent = true;
  newLFrame.lView = newView;
  newLFrame.selectedIndex = 0;
  newLFrame.expando = null;
  newLFrame.elementDepthCount = 0;
  newLFrame.bindingIndex = newView === null ? -1 : newView[TVIEW].bindingStartIndex;
}

/**
 * Allocates next free LFrame. This function tries to reuse the `LFrame`s to lower memory pressure.
 */
function allocLFrame() {
  const currentLFrame = instructionState.lFrame;
  const childLFrame = currentLFrame === null ? null : currentLFrame.child;
  const newLFrame = childLFrame === null ? createLFrame(currentLFrame) : childLFrame;
  return newLFrame;
}

function createLFrame(parent: LFrame | null): LFrame {
  const lFrame: LFrame = {
    previousOrParentTNode: null !,  //
    isParent: true,                 //
    lView: null !,                  //
    selectedIndex: 0,               //
    elementDepthCount: 0,           //
    expando: null,                  //
    bindingIndex: -1,               //
    parent: parent !,               //
    child: null,                    //
  };
  parent !== null && (parent.child = lFrame);  // link the new LFrame for reuse.
  return lFrame;
}

export function leaveViewProcessExit() {
  if (hasActiveElementFlag(ActiveElementFlags.RunExitFn)) {
    executeElementExitFn();
  }
  leaveView();
}

export function leaveView() {
  const lFrame = instructionState.lFrame;
  instructionState.lFrame = lFrame.parent;
  const expando = lFrame.expando;
  if (expando !== null) {
    lFrame.expando = null;
    instructionState.nextExpando = expando;
  }
}

export function nextContextImpl<T = any>(level: number = 1): T {
  const newLView = walkUpViews(level, getContextLView());
  ɵɵrestoreView(newLView as unknown as OpaqueViewState);
  return newLView[CONTEXT] as T;
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
 * Gets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function getSelectedIndex() {
  return instructionState.lFrame.selectedIndex >> ActiveElementFlags.Size;
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
  instructionState.lFrame.selectedIndex = index << ActiveElementFlags.Size;
}


/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceSVG() {
  setCurrentNamespace('http://www.w3.org/2000/svg');
}

/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceMathML() {
  setCurrentNamespace('http://www.w3.org/1998/MathML/');
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
  setCurrentNamespace(null);
}

function setCurrentNamespace(namespace: string | null) {
  const expando = shouldAssignToExpando(namespace, null);
  if (expando !== null) expando.currentNamespace = namespace;
}

export function getNamespace(): string|null {
  const expando = instructionState.lFrame.expando;
  return expando === null ? null : expando.currentNamespace;
}

export function setCurrentStyleSanitizer(sanitizer: StyleSanitizeFn | null) {
  const expando = shouldAssignToExpando(sanitizer, null);
  if (expando !== null) expando.currentSanitizer = sanitizer;
}

export function resetCurrentStyleSanitizer() {
  setCurrentStyleSanitizer(null);
}

export function getCurrentStyleSanitizer() {
  const lFrame = instructionState.lFrame;
  // TODO(misko): This should throw when there is no LView, but it turns out we can get here from
  // `NodeStyleDebug` hence we return `null`. This should be fixed
  if (lFrame === null) return null;
  const expando = lFrame.expando;
  return expando === null ? null : expando.currentSanitizer;
}
