/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode } from '../render3/interfaces/node';
import { RNode } from '../render3/interfaces/renderer_dom';
import { LView } from '../render3/interfaces/view';
/**
 * Validates that provided nodes match during the hydration process.
 */
export declare function validateMatchingNode(node: RNode | null, nodeType: number, tagName: string | null, lView: LView, tNode: TNode, isViewContainerAnchor?: boolean): void;
/**
 * Validates that a given node has sibling nodes
 */
export declare function validateSiblingNodeExists(node: RNode | null): void;
/**
 * Validates that a node exists or throws
 */
export declare function validateNodeExists(node: RNode | null, lView?: LView | null, tNode?: TNode | null): void;
/**
 * Builds the hydration error message when a node is not found
 *
 * @param lView the LView where the node exists
 * @param tNode the TNode
 */
export declare function nodeNotFoundError(lView: LView, tNode: TNode): Error;
/**
 * Builds a hydration error message when a node is not found at a path location
 *
 * @param host the Host Node
 * @param path the path to the node
 */
export declare function nodeNotFoundAtPathError(host: Node, path: string): Error;
/**
 * Builds the hydration error message in the case that dom nodes are created outside of
 * the Angular context and are being used as projected nodes
 *
 * @param lView the LView
 * @param tNode the TNode
 * @returns an error
 */
export declare function unsupportedProjectionOfDomNodes(rNode: RNode): Error;
/**
 * Builds the hydration error message in the case that ngSkipHydration was used on a
 * node that is not a component host element or host binding
 *
 * @param rNode the HTML Element
 * @returns an error
 */
export declare function invalidSkipHydrationHost(rNode: RNode): Error;
