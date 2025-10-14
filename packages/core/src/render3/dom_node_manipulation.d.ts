/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Renderer } from './interfaces/renderer';
import { RComment, RElement, RNode, RText } from './interfaces/renderer_dom';
import { TNode } from './interfaces/node';
export declare function createTextNode(renderer: Renderer, value: string): RText;
export declare function updateTextNode(renderer: Renderer, rNode: RText, value: string): void;
export declare function createCommentNode(renderer: Renderer, value: string): RComment;
/**
 * Creates a native element from a tag name, using a renderer.
 * @param renderer A renderer to use
 * @param name the tag name
 * @param namespace Optional namespace for element.
 * @returns the element created
 */
export declare function createElementNode(renderer: Renderer, name: string, namespace: string | null): RElement;
/**
 * Inserts a native node before another native node for a given parent.
 * This is a utility function that can be used when native nodes were determined.
 */
export declare function nativeInsertBefore(renderer: Renderer, parent: RElement, child: RNode, beforeNode: RNode | null, isMove: boolean): void;
export declare function nativeAppendChild(renderer: Renderer, parent: RElement, child: RNode): void;
export declare function nativeAppendOrInsertBefore(renderer: Renderer, parent: RElement, child: RNode, beforeNode: RNode | null, isMove: boolean): void;
/**
 * Removes a native node itself using a given renderer. To remove the node we are looking up its
 * parent from the native tree as not all platforms / browsers support the equivalent of
 * node.remove().
 *
 * @param renderer A renderer to be used
 * @param rNode The native node that should be removed
 * @param isHostElement A flag indicating if a node to be removed is a host of a component.
 * @param requireSynchronousElementRemoval A flag indicating if a node requires synchronous
 * removal from the DOM.
 */
export declare function nativeRemoveNode(renderer: Renderer, rNode: RNode, isHostElement?: boolean, requireSynchronousElementRemoval?: boolean): void;
/**
 * Clears the contents of a given RElement.
 *
 * @param rElement the native RElement to be cleared
 */
export declare function clearElementContents(rElement: RElement): void;
/** Sets up the static DOM attributes on an `RNode`. */
export declare function setupStaticAttributes(renderer: Renderer, element: RElement, tNode: TNode): void;
