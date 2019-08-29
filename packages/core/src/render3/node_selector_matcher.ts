/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../util/ng_dev_mode';

import {assertDefined, assertNotEqual} from '../util/assert';

import {AttributeMarker, TAttributes, TNode, TNodeType, unusedValueExportToPlacateAjd as unused1} from './interfaces/node';
import {CssSelector, CssSelectorList, SelectorFlags, unusedValueExportToPlacateAjd as unused2} from './interfaces/projection';
import {getInitialStylingValue} from './styling_next/util';
import {isNameOnlyAttributeMarker} from './util/attrs_utils';

const unusedValueToPlacateAjd = unused1 + unused2;

const NG_TEMPLATE_SELECTOR = 'ng-template';

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
 * Function that checks whether a given tNode matches tag-based selector and has a valid type.
 *
 * Matching can be performed in 2 modes: projection mode (when we project nodes) and regular
 * directive matching mode:
 * - in the "directive matching" mode we do _not_ take TContainer's tagName into account if it is
 * different from NG_TEMPLATE_SELECTOR (value different from NG_TEMPLATE_SELECTOR indicates that a
 * tag name was extracted from * syntax so we would match the same directive twice);
 * - in the "projection" mode, we use a tag name potentially extracted from the * syntax processing
 * (applicable to TNodeType.Container only).
 */
function hasTagAndTypeMatch(
    tNode: TNode, currentSelector: string, isProjectionMode: boolean): boolean {
  const tagNameToCompare = tNode.type === TNodeType.Container && !isProjectionMode ?
      NG_TEMPLATE_SELECTOR :
      tNode.tagName;
  return currentSelector === tagNameToCompare;
}

/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param node static data of the node to match
 * @param selector The selector to try matching against the node.
 * @param isProjectionMode if `true` we are matching for content projection, otherwise we are doing
 * directive matching.
 * @returns true if node matches the selector.
 */
export function isNodeMatchingSelector(
    tNode: TNode, selector: CssSelector, isProjectionMode: boolean): boolean {
  ngDevMode && assertDefined(selector[0], 'Selector should have a tag name');
  let mode: SelectorFlags = SelectorFlags.ELEMENT;
  const nodeAttrs = tNode.attrs || [];

  // Find the index of first attribute that has no value, only a name.
  const nameOnlyMarkerIdx = getNameOnlyMarkerIndex(nodeAttrs);

  // When processing ":not" selectors, we skip to the next ":not" if the
  // current one doesn't match
  let skipToNextSelector = false;

  for (let i = 0; i < selector.length; i++) {
    const current = selector[i];
    if (typeof current === 'number') {
      // If we finish processing a :not selector and it hasn't failed, return false
      if (!skipToNextSelector && !isPositive(mode) && !isPositive(current as number)) {
        return false;
      }
      // If we are skipping to the next :not() and this mode flag is positive,
      // it's a part of the current :not() selector, and we should keep skipping
      if (skipToNextSelector && isPositive(current)) continue;
      skipToNextSelector = false;
      mode = (current as number) | (mode & SelectorFlags.NOT);
      continue;
    }

    if (skipToNextSelector) continue;

    if (mode & SelectorFlags.ELEMENT) {
      mode = SelectorFlags.ATTRIBUTE | mode & SelectorFlags.NOT;
      if (current !== '' && !hasTagAndTypeMatch(tNode, current, isProjectionMode) ||
          current === '' && selector.length === 1) {
        if (isPositive(mode)) return false;
        skipToNextSelector = true;
      }
    } else {
      const selectorAttrValue = mode & SelectorFlags.CLASS ? current : selector[++i];

      // special case for matching against classes when a tNode has been instantiated with
      // class and style values as separate attribute values (e.g. ['title', CLASS, 'foo'])
      if ((mode & SelectorFlags.CLASS) && tNode.classes) {
        if (!isCssClassMatching(
                getInitialStylingValue(tNode.classes), selectorAttrValue as string)) {
          if (isPositive(mode)) return false;
          skipToNextSelector = true;
        }
        continue;
      }

      const isInlineTemplate =
          tNode.type == TNodeType.Container && tNode.tagName !== NG_TEMPLATE_SELECTOR;
      const attrName = (mode & SelectorFlags.CLASS) ? 'class' : current;
      const attrIndexInNode =
          findAttrIndexInNode(attrName, nodeAttrs, isInlineTemplate, isProjectionMode);

      if (attrIndexInNode === -1) {
        if (isPositive(mode)) return false;
        skipToNextSelector = true;
        continue;
      }

      if (selectorAttrValue !== '') {
        let nodeAttrValue: string;
        if (attrIndexInNode > nameOnlyMarkerIdx) {
          nodeAttrValue = '';
        } else {
          ngDevMode && assertNotEqual(
                           nodeAttrs[attrIndexInNode], AttributeMarker.NamespaceURI,
                           'We do not match directives on namespaced attributes');
          nodeAttrValue = nodeAttrs[attrIndexInNode + 1] as string;
        }

        const compareAgainstClassName = mode & SelectorFlags.CLASS ? nodeAttrValue : null;
        if (compareAgainstClassName &&
                !isCssClassMatching(compareAgainstClassName, selectorAttrValue as string) ||
            mode & SelectorFlags.ATTRIBUTE && selectorAttrValue !== nodeAttrValue) {
          if (isPositive(mode)) return false;
          skipToNextSelector = true;
        }
      }
    }
  }

  return isPositive(mode) || skipToNextSelector;
}

function isPositive(mode: SelectorFlags): boolean {
  return (mode & SelectorFlags.NOT) === 0;
}

/**
 * Examines the attribute's definition array for a node to find the index of the
 * attribute that matches the given `name`.
 *
 * NOTE: This will not match namespaced attributes.
 *
 * Attribute matching depends upon `isInlineTemplate` and `isProjectionMode`.
 * The following table summarizes which types of attributes we attempt to match:
 *
 * ===========================================================================================================
 * Modes                   | Normal Attributes | Bindings Attributes | Template Attributes | I18n
 * Attributes
 * ===========================================================================================================
 * Inline + Projection     | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Inline + Directive      | NO                | NO                  | YES                 | NO
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Projection | YES               | YES                 | NO                  | YES
 * -----------------------------------------------------------------------------------------------------------
 * Non-inline + Directive  | YES               | YES                 | NO                  | YES
 * ===========================================================================================================
 *
 * @param name the name of the attribute to find
 * @param attrs the attribute array to examine
 * @param isInlineTemplate true if the node being matched is an inline template (e.g. `*ngFor`)
 * rather than a manually expanded template node (e.g `<ng-template>`).
 * @param isProjectionMode true if we are matching against content projection otherwise we are
 * matching against directives.
 */
function findAttrIndexInNode(
    name: string, attrs: TAttributes | null, isInlineTemplate: boolean,
    isProjectionMode: boolean): number {
  if (attrs === null) return -1;

  let i = 0;

  if (isProjectionMode || !isInlineTemplate) {
    let bindingsMode = false;
    while (i < attrs.length) {
      const maybeAttrName = attrs[i];
      if (maybeAttrName === name) {
        return i;
      } else if (
          maybeAttrName === AttributeMarker.Bindings || maybeAttrName === AttributeMarker.I18n) {
        bindingsMode = true;
      } else if (
          maybeAttrName === AttributeMarker.Classes || maybeAttrName === AttributeMarker.Styles) {
        let value = attrs[++i];
        // We should skip classes here because we have a separate mechanism for
        // matching classes in projection mode.
        while (typeof value === 'string') {
          value = attrs[++i];
        }
        continue;
      } else if (maybeAttrName === AttributeMarker.Template) {
        // We do not care about Template attributes in this scenario.
        break;
      } else if (maybeAttrName === AttributeMarker.NamespaceURI) {
        // Skip the whole namespaced attribute and value. This is by design.
        i += 4;
        continue;
      }
      // In binding mode there are only names, rather than name-value pairs.
      i += bindingsMode ? 1 : 2;
    }
    // We did not match the attribute
    return -1;
  } else {
    return matchTemplateAttribute(attrs, name);
  }
}

export function isNodeMatchingSelectorList(
    tNode: TNode, selector: CssSelectorList, isProjectionMode: boolean = false): boolean {
  for (let i = 0; i < selector.length; i++) {
    if (isNodeMatchingSelector(tNode, selector[i], isProjectionMode)) {
      return true;
    }
  }

  return false;
}

export function getProjectAsAttrValue(tNode: TNode): CssSelector|null {
  const nodeAttrs = tNode.attrs;
  if (nodeAttrs != null) {
    const ngProjectAsAttrIdx = nodeAttrs.indexOf(AttributeMarker.ProjectAs);
    // only check for ngProjectAs in attribute names, don't accidentally match attribute's value
    // (attribute names are stored at even indexes)
    if ((ngProjectAsAttrIdx & 1) === 0) {
      return nodeAttrs[ngProjectAsAttrIdx + 1] as CssSelector;
    }
  }
  return null;
}

function getNameOnlyMarkerIndex(nodeAttrs: TAttributes) {
  for (let i = 0; i < nodeAttrs.length; i++) {
    const nodeAttr = nodeAttrs[i];
    if (isNameOnlyAttributeMarker(nodeAttr)) {
      return i;
    }
  }
  return nodeAttrs.length;
}

function matchTemplateAttribute(attrs: TAttributes, name: string): number {
  let i = attrs.indexOf(AttributeMarker.Template);
  if (i > -1) {
    i++;
    while (i < attrs.length) {
      if (attrs[i] === name) return i;
      i++;
    }
  }
  return -1;
}

/**
 * Checks whether a selector is inside a CssSelectorList
 * @param selector Selector to be checked.
 * @param list List in which to look for the selector.
 */
export function isSelectorInSelectorList(selector: CssSelector, list: CssSelectorList): boolean {
  selectorListLoop: for (let i = 0; i < list.length; i++) {
    const currentSelectorInList = list[i];
    if (selector.length !== currentSelectorInList.length) {
      continue;
    }
    for (let j = 0; j < selector.length; j++) {
      if (selector[j] !== currentSelectorInList[j]) {
        continue selectorListLoop;
      }
    }
    return true;
  }
  return false;
}
