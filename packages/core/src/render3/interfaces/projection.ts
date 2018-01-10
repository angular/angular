/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LContainerNode, LElementNode, LTextNode} from './node';

/**
 * An LProjection is just an array of projected nodes.
 *
 * It would be nice if we could not need an array, but since a projected node can be
 * re-projected, the same node can be part of more than one LProjectionNode which makes
 * list approach not possible.
 */
export type LProjection = Array<LElementNode|LTextNode|LContainerNode>;


/**
 * Parsed selector in the following format:
 * [tagName, attr1Name, attr1Val, ..., attrnName, attrnValue, 'class', className1, className2, ...,
 * classNameN]
 *
 * * For example, given the following selector:
 *  `div.foo.bar[attr1=val1][attr2]` a parsed format would be:
 * `['div', 'attr1', 'val1', 'attr2', '', 'class', 'foo', 'bar']`.
 *
 * Things to notice:
 * - tag name is always at the position 0
 * - the `class` attribute is always the last attribute in a pre-parsed array
 * - class names in a selector are at the end of an array (after the attribute with the name
 * 'class').
 */
export type SimpleCssSelector = string[];

/**
 * A complex selector expressed as an Array where:
 * - element at index 0 is a selector (SimpleCSSSelector) to match
 * - elements at index 1..n is a selector (SimpleCSSSelector) that should NOT match
 */
export type CssSelectorWithNegations = [SimpleCssSelector | null, SimpleCssSelector[] | null];

/**
 * A collection of complex selectors (CSSSelectorWithNegations) in a parsed form
 */
export type CssSelector = CssSelectorWithNegations[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
