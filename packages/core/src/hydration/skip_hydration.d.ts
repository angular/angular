/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode } from '../render3/interfaces/node';
import { RElement } from '../render3/interfaces/renderer_dom';
/**
 * The name of an attribute that can be added to the hydration boundary node
 * (component host node) to disable hydration for the content within that boundary.
 */
export declare const SKIP_HYDRATION_ATTR_NAME = "ngSkipHydration";
/**
 * Helper function to check if a given TNode has the 'ngSkipHydration' attribute.
 */
export declare function hasSkipHydrationAttrOnTNode(tNode: TNode): boolean;
/**
 * Helper function to check if a given RElement has the 'ngSkipHydration' attribute.
 */
export declare function hasSkipHydrationAttrOnRElement(rNode: RElement): boolean;
/**
 * Checks whether a TNode has a flag to indicate that it's a part of
 * a skip hydration block.
 */
export declare function hasInSkipHydrationBlockFlag(tNode: TNode): boolean;
/**
 * Helper function that determines if a given node is within a skip hydration block
 * by navigating up the TNode tree to see if any parent nodes have skip hydration
 * attribute.
 */
export declare function isInSkipHydrationBlock(tNode: TNode): boolean;
/**
 * Check if an i18n block is in a skip hydration section by looking at a parent TNode
 * to determine if this TNode is in a skip hydration section or the TNode has
 * the `ngSkipHydration` attribute.
 */
export declare function isI18nInSkipHydrationBlock(parentTNode: TNode): boolean;
