/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../util/ng_dev_mode';

import {assertDefined, assertEqual, assertNotEqual} from '../util/assert';

import {AttributeMarker, TAttributes, TNode, TNodeType} from './interfaces/node';
import {CssSelector, CssSelectorList, SelectorFlags} from './interfaces/projection';
import {classIndexOf} from './styling/class_differ';
import {isNameOnlyAttributeMarker} from './util/attrs_utils';

const NG_TEMPLATE_SELECTOR = 'ng-template';

/**
 * Search the `TAttributes` to see if it contains `cssClassToMatch` (case insensitive)
 *
 * @param attrs `TAttributes` to search through.
 * @param cssClassToMatch class to match (lowercase)
 * @param isProjectionMode Whether or not class matching should look into the attribute `class` in
 *    addition to the `AttributeMarker.Classes`.
 */
function isCssClassMatching(
    attrs: TAttributes, cssClassToMatch: string, isProjectionMode: boolean): boolean {
  // TODO(misko): The fact that this function needs to know about `isProjectionMode` seems suspect.
  // It is strange to me that sometimes the class information comes in form of `class` attribute
  // and sometimes in form of `AttributeMarker.Classes`. Some investigation is needed to determine
  // if that is the right behavior.
  ngDevMode &&
      assertEqual(
          cssClassToMatch, cssClassToMatch.toLowerCase(), 'Class name expected to be lowercase.');
  let i = 0;
  // Indicates whether we are processing value from the implicit
  // attribute section (i.e. before the first marker in the array).
  let isImplicitAttrsSection = true;
  while (i < attrs.length) {
    let item = attrs[i++];
    if (typeof item === 'string' && isImplicitAttrsSection) {
      const value = attrs[i++] as string;
      if (isProjectionMode && item === 'class') {
        // We found a `class` attribute in the implicit attribute section,
        // check if it matches the value of the `cssClassToMatch` argument.
        if (classIndexOf(value.toLowerCase(), cssClassToMatch, 0) !== -1) {
          return true;
        }
      }
    } else if (item === AttributeMarker.Classes) {
      // We found the classes section. Start searching for the class.
      while (i < attrs.length && typeof (item = attrs[i++]) == 'string') {
        // while we have strings
        if (item.toLowerCase() === cssClassToMatch) return true;
      }
      return false;
    } else if (typeof item === 'number') {
      // We've came across a first marker, which indicates
      // that the implicit attribute section is over.
      isImplicitAttrsSection = false;
    }
  }
  return false;
}

/**
 * Checks whether the `tNode` represents an inline template (e.g. `*ngFor`).
 *
 * @param tNode current TNode
 */
export function isInlineTemplate(tNode: TNode): boolean {
  return tNode.type === TNodeType.Container && tNode.value !== NG_TEMPLATE_SELECTOR;
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
  const tagNameToCompare =
      tNode.type === TNodeType.Container && !isProjectionMode ? NG_TEMPLATE_SELECTOR : tNode.value;
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
      if (!skipToNextSelector && !isPositive(mode) && !isPositive(current)) {
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
      if ((mode & SelectorFlags.CLASS) && tNode.attrs !== null) {
        if (!isCssClassMatching(tNode.attrs, selectorAttrValue as string, isProjectionMode)) {
          if (isPositive(mode)) return false;
          skipToNextSelector = true;
        }
        continue;
      }

      const attrName = (mode & SelectorFlags.CLASS) ? 'class' : current;
      const attrIndexInNode =
          findAttrIndexInNode(attrName, nodeAttrs, isInlineTemplate(tNode), isProjectionMode);

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
          ngDevMode &&
              assertNotEqual(
                  nodeAttrs[attrIndexInNode], AttributeMarker.NamespaceURI,
                  'We do not match directives on namespaced attributes');
          // we lowercase the attribute value to be able to match
          // selectors without case-sensitivity
          // (selectors are already in lowercase when generated)
          nodeAttrValue = (nodeAttrs[attrIndexInNode + 1] as string).toLowerCase();
        }

        const compareAgainstClassName = mode & SelectorFlags.CLASS ? nodeAttrValue : null;
        if (compareAgainstClassName &&
                classIndexOf(compareAgainstClassName, selectorAttrValue as string, 0) !== -1 ||
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
    name: string, attrs: TAttributes|null, isInlineTemplate: boolean,
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
      const attr = attrs[i];
      // Return in case we checked all template attrs and are switching to the next section in the
      // attrs array (that starts with a number that represents an attribute marker).
      if (typeof attr === 'number') return -1;
      if (attr === name) return i;
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

function maybeWrapInNotSelector(isNegativeMode: boolean, chunk: string): string {
  return isNegativeMode ? ':not(' + chunk.trim() + ')' : chunk;
}

function stringifyCSSSelector(selector: CssSelector): string {
  let result = selector[0] as string;
  let i = 1;
  let mode = SelectorFlags.ATTRIBUTE;
  let currentChunk = '';
  let isNegativeMode = false;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === 'string') {
      if (mode & SelectorFlags.ATTRIBUTE) {
        const attrValue = selector[++i] as string;
        currentChunk +=
            '[' + valueOrMarker + (attrValue.length > 0 ? '="' + attrValue + '"' : '') + ']';
      } else if (mode & SelectorFlags.CLASS) {
        currentChunk += '.' + valueOrMarker;
      } else if (mode & SelectorFlags.ELEMENT) {
        currentChunk += ' ' + valueOrMarker;
      }
    } else {
      //
      // Append current chunk to the final result in case we come across SelectorFlag, which
      // indicates that the previous section of a selector is over. We need to accumulate content
      // between flags to make sure we wrap the chunk later in :not() selector if needed, e.g.
      // ```
      //  ['', Flags.CLASS, '.classA', Flags.CLASS | Flags.NOT, '.classB', '.classC']
      // ```
      // should be transformed to `.classA :not(.classB .classC)`.
      //
      // Note: for negative selector part, we accumulate content between flags until we find the
      // next negative flag. This is needed to support a case where `:not()` rule contains more than
      // one chunk, e.g. the following selector:
      // ```
      //  ['', Flags.ELEMENT | Flags.NOT, 'p', Flags.CLASS, 'foo', Flags.CLASS | Flags.NOT, 'bar']
      // ```
      // should be stringified to `:not(p.foo) :not(.bar)`
      //
      if (currentChunk !== '' && !isPositive(valueOrMarker)) {
        result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
        currentChunk = '';
      }
      mode = valueOrMarker;
      // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
      // mode is maintained for remaining chunks of a selector.
      isNegativeMode = isNegativeMode || !isPositive(mode);
    }
    i++;
  }
  if (currentChunk !== '') {
    result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
  }
  return result;
}

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
export function stringifyCSSSelectorList(selectorList: CssSelectorList): string {
  return selectorList.map(stringifyCSSSelector).join(',');
}

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
export function extractAttrsAndClassesFromSelector(selector: CssSelector):
    {attrs: string[], classes: string[]} {
  const attrs: string[] = [];
  const classes: string[] = [];
  let i = 1;
  let mode = SelectorFlags.ATTRIBUTE;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === 'string') {
      if (mode === SelectorFlags.ATTRIBUTE) {
        if (valueOrMarker !== '') {
          attrs.push(valueOrMarker, selector[++i] as string);
        }
      } else if (mode === SelectorFlags.CLASS) {
        classes.push(valueOrMarker);
      }
    } else {
      // According to CssSelector spec, once we come across `SelectorFlags.NOT` flag, the negative
      // mode is maintained for remaining chunks of a selector. Since attributes and classes are
      // extracted only for "positive" part of the selector, we can stop here.
      if (!isPositive(mode)) break;
      mode = valueOrMarker;
    }
    i++;
  }
  return {attrs, classes};
}
