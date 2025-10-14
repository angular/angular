/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from '../interfaces/container';
import { TNode } from '../interfaces/node';
import { RComment, RElement } from '../interfaces/renderer_dom';
import { LView } from '../interfaces/view';
/**
 * Creates a LContainer, either from a container instruction, or for a ViewContainerRef.
 *
 * @param hostNative The host element for the LContainer
 * @param hostTNode The host TNode for the LContainer
 * @param currentView The parent view of the LContainer
 * @param native The native comment element
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export declare function createLContainer(hostNative: RElement | RComment | LView, currentView: LView, native: RComment, tNode: TNode): LContainer;
export declare function getLViewFromLContainer<T>(lContainer: LContainer, index: number): LView<T> | undefined;
export declare function addLViewToLContainer(lContainer: LContainer, lView: LView<unknown>, index: number, addToDOM?: boolean): void;
export declare function removeLViewFromLContainer(lContainer: LContainer, index: number): LView<unknown> | undefined;
/**
 * Detaches a view from a container.
 *
 * This method removes the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param lContainer The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @returns Detached LView instance.
 */
export declare function detachView(lContainer: LContainer, removeIndex: number): LView | undefined;
/**
 * Track views created from the declaration container (TemplateRef) and inserted into a
 * different LContainer or attached directly to ApplicationRef.
 */
export declare function trackMovedView(declarationContainer: LContainer, lView: LView): void;
