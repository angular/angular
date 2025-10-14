/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_dev_mode';
import { TAttributes, TNode } from './interfaces/node';
import { CssSelector, CssSelectorList } from './interfaces/projection';
/**
 * Checks whether the `tNode` represents an inline template (e.g. `*ngFor`).
 *
 * @param tNode current TNode
 */
export declare function isInlineTemplate(tNode: TNode): boolean;
/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param tNode static data of the node to match
 * @param selector The selector to try matching against the node.
 * @param isProjectionMode if `true` we are matching for content projection, otherwise we are doing
 * directive matching.
 * @returns true if node matches the selector.
 */
export declare function isNodeMatchingSelector(tNode: TNode, selector: CssSelector, isProjectionMode: boolean): boolean;
export declare function isNodeMatchingSelectorList(tNode: TNode, selector: CssSelectorList, isProjectionMode?: boolean): boolean;
export declare function getProjectAsAttrValue(tNode: TNode): CssSelector | null;
/**
 * Checks whether a selector is inside a CssSelectorList
 * @param selector Selector to be checked.
 * @param list List in which to look for the selector.
 */
export declare function isSelectorInSelectorList(selector: CssSelector, list: CssSelectorList): boolean;
/**
 * Generates string representation of CSS selector in parsed form.
 *
 * ComponentDef and DirectiveDef are generated with the selector in parsed form to avoid doing
 * additional parsing at runtime (for example, for directive matching). However in some cases (for
 * example, while bootstrapping a component), a string version of the selector is required to query
 * for the host element on the page. This function takes the parsed form of a selector and returns
 * its string representation.
 *
 * @param selectorList selector in parsed form
 * @returns string representation of a given selector
 */
export declare function stringifyCSSSelectorList(selectorList: CssSelectorList): string;
/**
 * Extracts attributes and classes information from a given CSS selector.
 *
 * This function is used while creating a component dynamically. In this case, the host element
 * (that is created dynamically) should contain attributes and classes specified in component's CSS
 * selector.
 *
 * @param selector CSS selector in parsed form (in a form of array)
 * @returns object with `attrs` and `classes` fields that contain extracted information
 */
export declare function extractAttrsAndClassesFromSelector(selector: CssSelector): TAttributes;
