/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';

import {assertNotNull} from './assert';
import {TNode, unusedValueExportToPlacateAjd as unused1} from './interfaces/node';
import {CssSelector, CssSelectorWithNegations, SimpleCssSelector, unusedValueExportToPlacateAjd as unused2} from './interfaces/projection';

const unusedValueToPlacateAjd = unused1 + unused2;

function isCssClassMatching(nodeClassAttrVal: string, cssClassToMatch: string): boolean {
  const nodeClassesLen = nodeClassAttrVal.length;
  const matchIndex = nodeClassAttrVal !.indexOf(cssClassToMatch);
  const matchEndIdx = matchIndex + cssClassToMatch.length;
  if (matchIndex === -1                                                  // no match
      || (matchIndex > 0 && nodeClassAttrVal ![matchIndex - 1] !== ' ')  // no space before
      ||
      (matchEndIdx < nodeClassesLen && nodeClassAttrVal ![matchEndIdx] !== ' '))  // no space after
  {
    return false;
  }
  return true;
}

/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param node static data to match
 * @param selector
 * @returns true if node matches the selector.
 */
export function isNodeMatchingSimpleSelector(tNode: TNode, selector: SimpleCssSelector): boolean {
  const noOfSelectorParts = selector.length;
  ngDevMode && assertNotNull(selector[0], 'the selector should have a tag name');
  const tagNameInSelector = selector[0];

  // check tag tame
  if (tagNameInSelector !== '' && tagNameInSelector !== tNode.tagName) {
    return false;
  }

  // short-circuit case where we are only matching on element's tag name
  if (noOfSelectorParts === 1) {
    return true;
  }

  // short-circuit case where an element has no attrs but a selector tries to match some
  if (noOfSelectorParts > 1 && !tNode.attrs) {
    return false;
  }

  const attrsInNode = tNode.attrs !;

  for (let i = 1; i < noOfSelectorParts; i += 2) {
    const attrNameInSelector = selector[i];
    const attrIdxInNode = attrsInNode.indexOf(attrNameInSelector);
    if (attrIdxInNode % 2 !== 0) {  // attribute names are stored at even indexes
      return false;
    } else {
      const attrValInSelector = selector[i + 1];
      if (attrValInSelector !== '') {
        // selector should also match on an attribute value
        const attrValInNode = attrsInNode[attrIdxInNode + 1];
        if (attrNameInSelector === 'class') {
          // iterate over all the remaining items in the selector selector array = class names
          for (i++; i < noOfSelectorParts; i++) {
            if (!isCssClassMatching(attrValInNode, selector[i])) {
              return false;
            }
          }
        } else if (attrValInSelector !== attrValInNode) {
          return false;
        }
      }
    }
  }

  return true;
}

export function isNodeMatchingSelectorWithNegations(
    tNode: TNode, selector: CssSelectorWithNegations): boolean {
  const positiveSelector = selector[0];
  if (positiveSelector != null && !isNodeMatchingSimpleSelector(tNode, positiveSelector)) {
    return false;
  }

  // do we have any negation parts in this selector?
  const negativeSelectors = selector[1];
  if (negativeSelectors) {
    for (let i = 0; i < negativeSelectors.length; i++) {
      // if one of negative selectors matched than the whole selector doesn't match
      if (isNodeMatchingSimpleSelector(tNode, negativeSelectors[i])) {
        return false;
      }
    }
  }

  return true;
}

export function isNodeMatchingSelector(tNode: TNode, selector: CssSelector): boolean {
  for (let i = 0; i < selector.length; i++) {
    if (isNodeMatchingSelectorWithNegations(tNode, selector[i])) {
      return true;
    }
  }

  return false;
}

/**
 * Checks a given node against matching selectors and returns
 * selector index (or 0 if none matched);
 */
export function matchingSelectorIndex(tNode: TNode, selectors: CssSelector[]): number {
  for (let i = 0; i < selectors.length; i++) {
    if (isNodeMatchingSelector(tNode, selectors[i])) {
      return i + 1;  // first matching selector "captures" a given node
    }
  }
  return 0;
}
