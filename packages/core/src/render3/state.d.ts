/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InternalInjectFlags } from '../di/interface/injector';
import { DirectiveDef } from './interfaces/definition';
import { TNode } from './interfaces/node';
import { LView, OpaqueViewState, TData, TView } from './interfaces/view';
export declare enum CheckNoChangesMode {
    Off = 0,
    Exhaustive = 1,
    OnlyDirtyViews = 2
}
/**
 * Returns true if the instruction state stack is empty.
 *
 * Intended to be called from tests only (tree shaken otherwise).
 */
export declare function specOnlyIsInstructionStateEmpty(): boolean;
export declare function getElementDepthCount(): number;
export declare function increaseElementDepthCount(): void;
export declare function decreaseElementDepthCount(): void;
export declare function getBindingsEnabled(): boolean;
/**
 * Returns true if currently inside a skip hydration block.
 * @returns boolean
 */
export declare function isInSkipHydrationBlock(): boolean;
/**
 * Returns true if this is the root TNode of the skip hydration block.
 * @param tNode the current TNode
 * @returns boolean
 */
export declare function isSkipHydrationRootTNode(tNode: TNode): boolean;
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
export declare function ɵɵenableBindings(): void;
/**
 * Sets a flag to specify that the TNode is in a skip hydration block.
 * @param tNode the current TNode
 */
export declare function enterSkipHydrationBlock(tNode: TNode): void;
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
export declare function ɵɵdisableBindings(): void;
/**
 * Clears the root skip hydration node when leaving a skip hydration block.
 */
export declare function leaveSkipHydrationBlock(): void;
/**
 * Return the current `LView`.
 */
export declare function getLView<T>(): LView<T>;
/**
 * Return the current `TView`.
 */
export declare function getTView(): TView;
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
export declare function ɵɵrestoreView<T = any>(viewToRestore: OpaqueViewState): T;
/**
 * Clears the view set in `ɵɵrestoreView` from memory. Returns the passed in
 * value so that it can be used as a return value of an instruction.
 *
 * @codeGenApi
 */
export declare function ɵɵresetView<T>(value?: T): T | undefined;
export declare function getCurrentTNode(): TNode | null;
export declare function getCurrentTNodePlaceholderOk(): TNode | null;
export declare function getCurrentParentTNode(): TNode | null;
export declare function setCurrentTNode(tNode: TNode | null, isParent: boolean): void;
export declare function isCurrentTNodeParent(): boolean;
export declare function setCurrentTNodeAsNotParent(): void;
export declare function getContextLView(): LView;
export declare function isInCheckNoChangesMode(): boolean;
export declare function isExhaustiveCheckNoChanges(): boolean;
export declare function setIsInCheckNoChangesMode(mode: CheckNoChangesMode): void;
export declare function isRefreshingViews(): boolean;
export declare function setIsRefreshingViews(mode: boolean): boolean;
export declare function getBindingRoot(): number;
export declare function getBindingIndex(): number;
export declare function setBindingIndex(value: number): number;
export declare function nextBindingIndex(): number;
export declare function incrementBindingIndex(count: number): number;
export declare function isInI18nBlock(): boolean;
export declare function setInI18nBlock(isInI18nBlock: boolean): void;
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
export declare function setBindingRootForHostBindings(bindingRootIndex: number, currentDirectiveIndex: number): void;
/**
 * When host binding is executing this points to the directive index.
 * `TView.data[getCurrentDirectiveIndex()]` is `DirectiveDef`
 * `LView[getCurrentDirectiveIndex()]` is directive instance.
 */
export declare function getCurrentDirectiveIndex(): number;
/**
 * Sets an index of a directive whose `hostBindings` are being processed.
 *
 * @param currentDirectiveIndex `TData` index where current directive instance can be found.
 */
export declare function setCurrentDirectiveIndex(currentDirectiveIndex: number): void;
/**
 * Retrieve the current `DirectiveDef` which is active when `hostBindings` instruction is being
 * executed.
 *
 * @param tData Current `TData` where the `DirectiveDef` will be looked up at.
 */
export declare function getCurrentDirectiveDef(tData: TData): DirectiveDef<any> | null;
export declare function getCurrentQueryIndex(): number;
export declare function setCurrentQueryIndex(value: number): void;
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
export declare function enterDI(lView: LView, tNode: TNode, flags: InternalInjectFlags): boolean;
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
export declare function enterView(newView: LView): void;
/**
 * This is a lightweight version of the `leaveView` which is needed by the DI system.
 *
 * NOTE: this function is an alias so that we can change the type of the function to have `void`
 * return type.
 */
export declare const leaveDI: () => void;
/**
 * Leave the current `LView`
 *
 * This pops the `LFrame` with the associated `LView` from the stack.
 *
 * IMPORTANT: We must zero out the `LFrame` values here otherwise they will be retained. This is
 * because for performance reasons we don't release `LFrame` but rather keep it for next use.
 */
export declare function leaveView(): void;
export declare function nextContextImpl<T = any>(level: number): T;
/**
 * Gets the currently selected element index.
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 */
export declare function getSelectedIndex(): number;
/**
 * Sets the most recent index passed to {@link select}
 *
 * Used with {@link property} instruction (and more in the future) to identify the index in the
 * current `LView` to act on.
 *
 * (Note that if an "exit function" was set earlier (via `setElementExitFn()`) then that will be
 * run if and when the provided `index` value is different from the current selected index value.)
 */
export declare function setSelectedIndex(index: number): void;
/**
 * Gets the `tNode` that represents currently selected element.
 */
export declare function getSelectedTNode(): TNode;
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
export declare function ɵɵnamespaceSVG(): void;
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
export declare function ɵɵnamespaceMathML(): void;
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 *
 * @codeGenApi
 */
export declare function ɵɵnamespaceHTML(): void;
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 */
export declare function namespaceHTMLInternal(): void;
export declare function getNamespace(): string | null;
/**
 * Retrieves a global flag that indicates whether the most recent DOM node
 * was created or hydrated.
 */
export declare function wasLastNodeCreated(): boolean;
/**
 * Sets a global flag to indicate whether the most recent DOM node
 * was created or hydrated.
 */
export declare function lastNodeWasCreated(flag: boolean): void;
