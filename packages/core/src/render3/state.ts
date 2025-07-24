/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnimationRemovalRegistry, ElementRegistry} from '../animation';
import {InternalInjectFlags} from '../di/interface/injector';
import {
  assertDefined,
  assertEqual,
  assertGreaterThanOrEqual,
  assertLessThan,
  assertNotEqual,
  throwError,
} from '../util/assert';

import {assertLViewOrUndefined, assertTNodeForLView, assertTNodeForTView} from './assert';
import {DirectiveDef} from './interfaces/definition';
import {TNode, TNodeType} from './interfaces/node';
import {
  CONTEXT,
  DECLARATION_VIEW,
  HEADER_OFFSET,
  LView,
  OpaqueViewState,
  T_HOST,
  TData,
  TVIEW,
  TView,
  TViewType,
} from './interfaces/view';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from './namespaces';
import {getTNode, walkUpViews} from './util/view_utils';

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
  child: LFrame | null;

  /**
   * State of the current view being processed.
   *
   * An array of nodes (text, element, container, etc), pipes, their bindings, and
   * any local variables that need to be stored between invocations.
   */
  lView: LView;

  /**
   * Current `TView` associated with the `LFrame.lView`.
   *
   * One can get `TView` from `lFrame[TVIEW]` however because it is so common it makes sense to
   * store it in `LFrame` for perf reasons.
   */
  tView: TView;

  /**
   * Used to set the parent property when nodes are created and track query results.
   *
   * This is used in conjunction with `isParent`.
   */
  currentTNode: TNode | null;

  /**
   * If `isParent` is:
   *  - `true`: then `currentTNode` points to a parent node.
   *  - `false`: then `currentTNode` points to previous node (sibling).
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
   * The last viewData retrieved by nextContext().
   * Allows building nextContext() and reference() calls.
   *
   * e.g. const inner = x().$implicit; const outer = x().$implicit;
   */
  contextLView: LView | null;

  /**
   * Store the element depth count. This is used to identify the root elements of the template
   * so that we can then attach patch data `LView` to only those elements. We know that those
   * are the only places where the patch data could change, this way we will save on number
   * of places where tha patching occurs.
   */
  elementDepthCount: number;

  /**
   * Current namespace to be used when creating elements
   */
  currentNamespace: string | null;

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

  /**
   * When host binding is executing this points to the directive index.
   * `TView.data[currentDirectiveIndex]` is `DirectiveDef`
   * `LView[currentDirectiveIndex]` is directive instance.
   */
  currentDirectiveIndex: number;

  /**
   * Are we currently in i18n block as denoted by `ɵɵelementStart` and `ɵɵelementEnd`.
   *
   * This information is needed because while we are in i18n block all elements must be pre-declared
   * in the translation. (i.e. `Hello �#2�World�/#2�!` pre-declares element at `�#2�` location.)
   * This allocates `TNodeType.Placeholder` element at location `2`. If translator removes `�#2�`
   * from translation than the runtime must also ensure tha element at `2` does not get inserted
   * into the DOM. The translation does not carry information about deleted elements. Therefor the
   * only way to know that an element is deleted is that it was not pre-declared in the translation.
   *
   * This flag works by ensuring that elements which are created without pre-declaration
   * (`TNodeType.Placeholder`) are not inserted into the DOM render tree. (It does mean that the
   * element still gets instantiated along with all of its behavior [directives])
   */
  inI18n: boolean;
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
   * Stores whether directives should be matched to elements.
   *
   * When template contains `ngNonBindable` then we need to prevent the runtime from matching
   * directives on children of that element.
   *
   * Example:
   * ```html
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
   * Stores the root TNode that has the 'ngSkipHydration' attribute on it for later reference.
   *
   * Example:
   * ```html
   * <my-comp ngSkipHydration>
   *   Should reference this root node
   * </my-comp>
   * ```
   */
  skipHydrationRootTNode: TNode | null;
}

const instructionState: InstructionState = {
  lFrame: createLFrame(null),
  bindingsEnabled: true,
  skipHydrationRootTNode: null,
};

export enum CheckNoChangesMode {
  Off,
  Exhaustive,
  OnlyDirtyViews,
}

/**
 * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
 *
 * Necessary to support ChangeDetectorRef.checkNoChanges().
 *
 * The `checkNoChanges` function is invoked only in ngDevMode=true and verifies that no unintended
 * changes exist in the change detector or its children.
 */
let _checkNoChangesMode: CheckNoChangesMode = 0; /* CheckNoChangesMode.Off */

/**
 * Flag used to indicate that we are in the middle running change detection on a view
 *
 * @see detectChangesInViewWhileDirty
 */
let _isRefreshingViews = false;

/**
 * Returns true if the instruction state stack is empty.
 *
 * Intended to be called from tests only (tree shaken otherwise).
 */
export function specOnlyIsInstructionStateEmpty(): boolean {
  return instructionState.lFrame.parent === null;
}

export function getElementDepthCount() {
  return instructionState.lFrame.elementDepthCount;
}

export function increaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount++;
}

export function decreaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount--;
}

export function getBindingsEnabled(): boolean {
  return instructionState.bindingsEnabled;
}

/**
 * Returns true if currently inside a skip hydration block.
 * @returns boolean
 */
export function isInSkipHydrationBlock(): boolean {
  return instructionState.skipHydrationRootTNode !== null;
}

/**
 * Returns true if this is the root TNode of the skip hydration block.
 * @param tNode the current TNode
 * @returns boolean
 */
export function isSkipHydrationRootTNode(tNode: TNode): boolean {
  return instructionState.skipHydrationRootTNode === tNode;
}

/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```html
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
 * Sets a flag to specify that the TNode is in a skip hydration block.
 * @param tNode the current TNode
 */
export function enterSkipHydrationBlock(tNode: TNode): void {
  instructionState.skipHydrationRootTNode = tNode;
}

/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```html
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
 * Clears the root skip hydration node when leaving a skip hydration block.
 */
export function leaveSkipHydrationBlock(): void {
  instructionState.skipHydrationRootTNode = null;
}

/**
 * Return the current `LView`.
 */
export function getLView<T>(): LView<T> {
  return instructionState.lFrame.lView as LView<T>;
}

/**
 * Return the current `TView`.
 */
export function getTView(): TView {
  return instructionState.lFrame.tView;
}

/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 * @returns Context of the restored OpaqueViewState instance.
 *
 * @codeGenApi
 */
export function ɵɵrestoreView<T = any>(viewToRestore: OpaqueViewState): T {
  instructionState.lFrame.contextLView = viewToRestore as any as LView;
  return (viewToRestore as any as LView)[CONTEXT] as unknown as T;
}

/**
 * Clears the view set in `ɵɵrestoreView` from memory. Returns the passed in
 * value so that it can be used as a return value of an instruction.
 *
 * @codeGenApi
 */
export function ɵɵresetView<T>(value?: T): T | undefined {
  instructionState.lFrame.contextLView = null;
  return value;
}

export function getCurrentTNode(): TNode | null {
  let currentTNode = getCurrentTNodePlaceholderOk();
  while (currentTNode !== null && currentTNode.type === TNodeType.Placeholder) {
    currentTNode = currentTNode.parent;
  }
  return currentTNode;
}

export function getCurrentTNodePlaceholderOk(): TNode | null {
  return instructionState.lFrame.currentTNode;
}

export function getCurrentParentTNode(): TNode | null {
  const lFrame = instructionState.lFrame;
  const currentTNode = lFrame.currentTNode;
  return lFrame.isParent ? currentTNode : currentTNode!.parent;
}

export function setCurrentTNode(tNode: TNode | null, isParent: boolean) {
  ngDevMode && tNode && assertTNodeForTView(tNode, instructionState.lFrame.tView);
  const lFrame = instructionState.lFrame;
  lFrame.currentTNode = tNode;
  lFrame.isParent = isParent;
}

export function isCurrentTNodeParent(): boolean {
  return instructionState.lFrame.isParent;
}

export function setCurrentTNodeAsNotParent(): void {
  instructionState.lFrame.isParent = false;
}

export function getContextLView(): LView {
  const contextLView = instructionState.lFrame.contextLView;
  ngDevMode && assertDefined(contextLView, 'contextLView must be defined.');
  return contextLView!;
}

export function isInCheckNoChangesMode(): boolean {
  !ngDevMode && throwError('Must never be called in production mode');
  return _checkNoChangesMode !== CheckNoChangesMode.Off;
}

export function isExhaustiveCheckNoChanges(): boolean {
  !ngDevMode && throwError('Must never be called in production mode');
  return _checkNoChangesMode === CheckNoChangesMode.Exhaustive;
}

export function setIsInCheckNoChangesMode(mode: CheckNoChangesMode): void {
  !ngDevMode && throwError('Must never be called in production mode');
  _checkNoChangesMode = mode;
}

export function isRefreshingViews(): boolean {
  return _isRefreshingViews;
}

export function setIsRefreshingViews(mode: boolean): boolean {
  const prev = _isRefreshingViews;
  _isRefreshingViews = mode;
  return prev;
}

// top level variables should not be exported for performance reasons (PERF_NOTES.md)
export function getBindingRoot() {
  const lFrame = instructionState.lFrame;
  let index = lFrame.bindingRootIndex;
  if (index === -1) {
    index = lFrame.bindingRootIndex = lFrame.tView.bindingStartIndex;
  }
  return index;
}

export function getBindingIndex(): number {
  return instructionState.lFrame.bindingIndex;
}

export function setBindingIndex(value: number): number {
  return (instructionState.lFrame.bindingIndex = value);
}

export function nextBindingIndex(): number {
  return instructionState.lFrame.bindingIndex++;
}

export function incrementBindingIndex(count: number): number {
  const lFrame = instructionState.lFrame;
  const index = lFrame.bindingIndex;
  lFrame.bindingIndex = lFrame.bindingIndex + count;
  return index;
}

export function isInI18nBlock() {
  return instructionState.lFrame.inI18n;
}

export function setInI18nBlock(isInI18nBlock: boolean): void {
  instructionState.lFrame.inI18n = isInI18nBlock;
}

/**
 * Set a new binding root index so that host template functions can execute.
 *
 * Bindings inside the host template are 0 index. But because we don't know ahead of time
 * how many host bindings we have we can't pre-compute them. For this reason they are all
 * 0 index and we just shift the root so that they match next available location in the LView.
 *
 * @param bindingRootIndex Root index for `hostBindings`
 * @param currentDirectiveIndex `TData[currentDirectiveIndex]` will point to the current directive
 *        whose `hostBindings` are being processed.
 */
export function setBindingRootForHostBindings(
  bindingRootIndex: number,
  currentDirectiveIndex: number,
) {
  const lFrame = instructionState.lFrame;
  lFrame.bindingIndex = lFrame.bindingRootIndex = bindingRootIndex;
  setCurrentDirectiveIndex(currentDirectiveIndex);
}

/**
 * When host binding is executing this points to the directive index.
 * `TView.data[getCurrentDirectiveIndex()]` is `DirectiveDef`
 * `LView[getCurrentDirectiveIndex()]` is directive instance.
 */
export function getCurrentDirectiveIndex(): number {
  return instructionState.lFrame.currentDirectiveIndex;
}

/**
 * Sets an index of a directive whose `hostBindings` are being processed.
 *
 * @param currentDirectiveIndex `TData` index where current directive instance can be found.
 */
export function setCurrentDirectiveIndex(currentDirectiveIndex: number): void {
  instructionState.lFrame.currentDirectiveIndex = currentDirectiveIndex;
}

/**
 * Retrieve the current `DirectiveDef` which is active when `hostBindings` instruction is being
 * executed.
 *
 * @param tData Current `TData` where the `DirectiveDef` will be looked up at.
 */
export function getCurrentDirectiveDef(tData: TData): DirectiveDef<any> | null {
  const currentDirectiveIndex = instructionState.lFrame.currentDirectiveIndex;
  return currentDirectiveIndex === -1 ? null : (tData[currentDirectiveIndex] as DirectiveDef<any>);
}

export function getCurrentQueryIndex(): number {
  return instructionState.lFrame.currentQueryIndex;
}

export function setCurrentQueryIndex(value: number): void {
  instructionState.lFrame.currentQueryIndex = value;
}

/**
 * Returns a `TNode` of the location where the current `LView` is declared at.
 *
 * @param lView an `LView` that we want to find parent `TNode` for.
 */
function getDeclarationTNode(lView: LView): TNode | null {
  const tView = lView[TVIEW];

  // Return the declaration parent for embedded views
  if (tView.type === TViewType.Embedded) {
    ngDevMode && assertDefined(tView.declTNode, 'Embedded TNodes should have declaration parents.');
    return tView.declTNode;
  }

  // Components don't have `TView.declTNode` because each instance of component could be
  // inserted in different location, hence `TView.declTNode` is meaningless.
  // Falling back to `T_HOST` in case we cross component boundary.
  if (tView.type === TViewType.Component) {
    return lView[T_HOST];
  }

  // Remaining TNode type is `TViewType.Root` which doesn't have a parent TNode.
  return null;
}

/**
 * This is a light weight version of the `enterView` which is needed by the DI system.
 *
 * @param lView `LView` location of the DI context.
 * @param tNode `TNode` for DI context
 * @param flags DI context flags. if `SkipSelf` flag is set than we walk up the declaration
 *     tree from `tNode`  until we find parent declared `TElementNode`.
 * @returns `true` if we have successfully entered DI associated with `tNode` (or with declared
 *     `TNode` if `flags` has  `SkipSelf`). Failing to enter DI implies that no associated
 *     `NodeInjector` can be found and we should instead use `ModuleInjector`.
 *     - If `true` than this call must be fallowed by `leaveDI`
 *     - If `false` than this call failed and we should NOT call `leaveDI`
 */
export function enterDI(lView: LView, tNode: TNode, flags: InternalInjectFlags) {
  ngDevMode && assertLViewOrUndefined(lView);

  if (flags & InternalInjectFlags.SkipSelf) {
    ngDevMode && assertTNodeForTView(tNode, lView[TVIEW]);

    let parentTNode = tNode as TNode | null;
    let parentLView = lView;

    while (true) {
      ngDevMode && assertDefined(parentTNode, 'Parent TNode should be defined');
      parentTNode = parentTNode!.parent as TNode | null;
      if (parentTNode === null && !(flags & InternalInjectFlags.Host)) {
        parentTNode = getDeclarationTNode(parentLView);
        if (parentTNode === null) break;

        // In this case, a parent exists and is definitely an element. So it will definitely
        // have an existing lView as the declaration view, which is why we can assume it's defined.
        ngDevMode && assertDefined(parentLView, 'Parent LView should be defined');
        parentLView = parentLView[DECLARATION_VIEW]!;

        // In Ivy there are Comment nodes that correspond to ngIf and NgFor embedded directives
        // We want to skip those and look only at Elements and ElementContainers to ensure
        // we're looking at true parent nodes, and not content or other types.
        if (parentTNode.type & (TNodeType.Element | TNodeType.ElementContainer)) {
          break;
        }
      } else {
        break;
      }
    }
    if (parentTNode === null) {
      // If we failed to find a parent TNode this means that we should use module injector.
      return false;
    } else {
      tNode = parentTNode;
      lView = parentLView;
    }
  }

  ngDevMode && assertTNodeForLView(tNode, lView);
  const lFrame = (instructionState.lFrame = allocLFrame());
  lFrame.currentTNode = tNode;
  lFrame.lView = lView;

  return true;
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
 * @returns the previously active lView;
 */
export function enterView(newView: LView): void {
  ngDevMode && assertNotEqual(newView[0], newView[1] as any, '????');
  ngDevMode && assertLViewOrUndefined(newView);
  const newLFrame = allocLFrame();
  if (ngDevMode) {
    assertEqual(newLFrame.isParent, true, 'Expected clean LFrame');
    assertEqual(newLFrame.lView, null, 'Expected clean LFrame');
    assertEqual(newLFrame.tView, null, 'Expected clean LFrame');
    assertEqual(newLFrame.selectedIndex, -1, 'Expected clean LFrame');
    assertEqual(newLFrame.elementDepthCount, 0, 'Expected clean LFrame');
    assertEqual(newLFrame.currentDirectiveIndex, -1, 'Expected clean LFrame');
    assertEqual(newLFrame.currentNamespace, null, 'Expected clean LFrame');
    assertEqual(newLFrame.bindingRootIndex, -1, 'Expected clean LFrame');
    assertEqual(newLFrame.currentQueryIndex, 0, 'Expected clean LFrame');
  }
  const tView = newView[TVIEW];
  instructionState.lFrame = newLFrame;
  ngDevMode && tView.firstChild && assertTNodeForTView(tView.firstChild, tView);
  newLFrame.currentTNode = tView.firstChild!;
  newLFrame.lView = newView;
  newLFrame.tView = tView;
  newLFrame.contextLView = newView;
  newLFrame.bindingIndex = tView.bindingStartIndex;
  newLFrame.inI18n = false;
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
    currentTNode: null,
    isParent: true,
    lView: null!,
    tView: null!,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: parent!,
    child: null,
    inI18n: false,
  };
  parent !== null && (parent.child = lFrame); // link the new LFrame for reuse.
  return lFrame;
}

/**
 * A lightweight version of leave which is used with DI.
 *
 * This function only resets `currentTNode` and `LView` as those are the only properties
 * used with DI (`enterDI()`).
 *
 * NOTE: This function is reexported as `leaveDI`. However `leaveDI` has return type of `void` where
 * as `leaveViewLight` has `LFrame`. This is so that `leaveViewLight` can be used in `leaveView`.
 */
function leaveViewLight(): LFrame {
  const oldLFrame = instructionState.lFrame;
  instructionState.lFrame = oldLFrame.parent;
  oldLFrame.currentTNode = null!;
  oldLFrame.lView = null!;
  return oldLFrame;
}

/**
 * This is a lightweight version of the `leaveView` which is needed by the DI system.
 *
 * NOTE: this function is an alias so that we can change the type of the function to have `void`
 * return type.
 */
export const leaveDI: () => void = leaveViewLight;

/**
 * Leave the current `LView`
 *
 * This pops the `LFrame` with the associated `LView` from the stack.
 *
 * IMPORTANT: We must zero out the `LFrame` values here otherwise they will be retained. This is
 * because for performance reasons we don't release `LFrame` but rather keep it for next use.
 */
export function leaveView() {
  const oldLFrame = leaveViewLight();
  oldLFrame.isParent = true;
  oldLFrame.tView = null!;
  oldLFrame.selectedIndex = -1;
  oldLFrame.contextLView = null;
  oldLFrame.elementDepthCount = 0;
  oldLFrame.currentDirectiveIndex = -1;
  oldLFrame.currentNamespace = null;
  oldLFrame.bindingRootIndex = -1;
  oldLFrame.bindingIndex = -1;
  oldLFrame.currentQueryIndex = 0;
}

export function nextContextImpl<T = any>(level: number): T {
  const contextLView = (instructionState.lFrame.contextLView = walkUpViews(
    level,
    instructionState.lFrame.contextLView!,
  ));
  return contextLView[CONTEXT] as unknown as T;
}

/**
 * Gets the currently selected element index.
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export function getSelectedIndex() {
  return instructionState.lFrame.selectedIndex;
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
  ngDevMode &&
    index !== -1 &&
    assertGreaterThanOrEqual(index, HEADER_OFFSET, 'Index must be past HEADER_OFFSET (or -1).');
  ngDevMode &&
    assertLessThan(
      index,
      instructionState.lFrame.lView.length,
      "Can't set index passed end of LView",
    );
  instructionState.lFrame.selectedIndex = index;
}

/**
 * Gets the `tNode` that represents currently selected element.
 */
export function getSelectedTNode() {
  const lFrame = instructionState.lFrame;
  return getTNode(lFrame.tView, lFrame.selectedIndex);
}

/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceSVG() {
  instructionState.lFrame.currentNamespace = SVG_NAMESPACE;
}

/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
export function ɵɵnamespaceMathML() {
  instructionState.lFrame.currentNamespace = MATH_ML_NAMESPACE;
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
  instructionState.lFrame.currentNamespace = null;
}

export function getNamespace(): string | null {
  return instructionState.lFrame.currentNamespace;
}

let _wasLastNodeCreated = true;

/**
 * Retrieves a global flag that indicates whether the most recent DOM node
 * was created or hydrated.
 */
export function wasLastNodeCreated(): boolean {
  return _wasLastNodeCreated;
}

/**
 * Sets a global flag to indicate whether the most recent DOM node
 * was created or hydrated.
 */
export function lastNodeWasCreated(flag: boolean): void {
  _wasLastNodeCreated = flag;
}

/**
 * We create an object here because it's possible the DOM Renderer is created
 * before the animation removal registry is defined. The object allows us to
 * update the instance once the registry is created.
 */
let registry: AnimationRemovalRegistry = {elements: undefined};

export function setAnimationElementRemovalRegistry(value: ElementRegistry) {
  if (registry.elements === undefined) {
    registry.elements = value;
  }
}

export function getAnimationElementRemovalRegistry(): AnimationRemovalRegistry {
  return registry;
}
