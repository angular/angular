/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NodeNavigationStep } from './interfaces';
/**
 * Helper function that takes a reference node location and a set of navigation steps
 * (from the reference node) to a target node and outputs a string that represents
 * a location.
 *
 * For example, given: referenceNode = 'b' (body) and path = ['firstChild', 'firstChild',
 * 'nextSibling'], the function returns: `bf2n`.
 */
export declare function compressNodeLocation(referenceNode: string, path: NodeNavigationStep[]): string;
/**
 * Helper function that reverts the `compressNodeLocation` and transforms a given
 * string into an array where at 0th position there is a reference node info and
 * after that it contains information (in pairs) about a navigation step and the
 * number of repetitions.
 *
 * For example, the path like 'bf2n' will be transformed to:
 * ['b', 'firstChild', 2, 'nextSibling', 1].
 *
 * This information is later consumed by the code that navigates the DOM to find
 * a given node by its location.
 */
export declare function decompressNodeLocation(path: string): [string | number, ...(number | NodeNavigationStep)[]];
