/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  SelectorFlags,
  CssSelector as R3CssSelector,
  CssSelectorList as R3CssSelectorList,
} from '../render3/interfaces/projection';

// These functions are adapted from Angular's core selector parser (packages/compiler/src/core.ts).
// They are duplicated here for functional use in render3, as direct references to compiler are not possible.

const _SELECTOR_REGEXP = new RegExp(
  '(\\:not\\()|' + // 1: ":not("
    '(([\\.\\#]?)[-\\w]+)|' + // 2: "tag"; 3: "."/"#";
    // "-" should appear first in the regexp below as FF31 parses "[.-\w]" as a range
    // 4: attribute; 5: attribute_string; 6: attribute_value
    '(?:\\[([-.\\w*\\\\$]+)(?:=(["\']?)([^\\]"\']*)\\5)?\\])|' + // "[name]", "[name=value]",
    // "[name="value"]",
    // "[name='value']"
    '(\\))|' + // 7: ")"
    '(\\s*,\\s*)', // 8: ","
  'g',
);

/**
 * These offsets should match the match-groups in `_SELECTOR_REGEXP` offsets.
 */
const SelectorRegexp = {
  ALL: 0, // The whole match
  NOT: 1,
  TAG: 2,
  PREFIX: 3,
  ATTRIBUTE: 4,
  ATTRIBUTE_STRING: 5,
  ATTRIBUTE_VALUE: 6,
  NOT_END: 7,
  SEPARATOR: 8,
};

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export interface CssSelector {
  element: string | null;
  classNames: string[];
  /**
   * The selectors are encoded in pairs where:
   * - even locations are attribute names
   * - odd locations are attribute values.
   *
   * Example:
   * Selector: `[key1=value1][key2]` would parse to:
   * ```
   * ['key1', 'value1', 'key2', '']
   * ```
   */
  attrs: string[];
  notSelectors: CssSelector[];
}

function createCssSelector(): CssSelector {
  return {
    element: null,
    classNames: [],
    attrs: [],
    notSelectors: [],
  };
}

function parseCssSelector(selector: string): CssSelector[] {
  const results: CssSelector[] = [];
  const _addResult = (res: CssSelector[], cssSel: CssSelector) => {
    if (
      cssSel.notSelectors.length > 0 &&
      !cssSel.element &&
      cssSel.classNames.length == 0 &&
      cssSel.attrs.length == 0
    ) {
      cssSel.element = '*';
    }
    res.push(cssSel);
  };
  let cssSelector = createCssSelector();
  let match: string[] | null;
  let current = cssSelector;
  let inNot = false;
  _SELECTOR_REGEXP.lastIndex = 0;
  while ((match = _SELECTOR_REGEXP.exec(selector))) {
    if (match[SelectorRegexp.NOT]) {
      if (inNot) {
        throw new Error('Nesting :not in a selector is not allowed');
      }
      inNot = true;
      current = createCssSelector();
      cssSelector.notSelectors.push(current);
    }
    const tag = match[SelectorRegexp.TAG];
    if (tag) {
      const prefix = match[SelectorRegexp.PREFIX];
      if (prefix === '#') {
        // #hash
        addAttribute(current, 'id', tag.slice(1));
      } else if (prefix === '.') {
        // Class
        addClassName(current, tag.slice(1));
      } else {
        // Element
        setElement(current, tag);
      }
    }
    const attribute = match[SelectorRegexp.ATTRIBUTE];

    if (attribute) {
      addAttribute(current, unescapeAttribute(attribute), match[SelectorRegexp.ATTRIBUTE_VALUE]);
    }
    if (match[SelectorRegexp.NOT_END]) {
      inNot = false;
      current = cssSelector;
    }
    if (match[SelectorRegexp.SEPARATOR]) {
      if (inNot) {
        throw new Error('Multiple selectors in :not are not supported');
      }
      _addResult(results, cssSelector);
      cssSelector = current = createCssSelector();
    }
  }
  _addResult(results, cssSelector);
  return results;
}

/**
 * Unescape `\$` sequences from the CSS attribute selector.
 *
 * This is needed because `$` can have a special meaning in CSS selectors,
 * but we might want to match an attribute that contains `$`.
 * [MDN web link for more
 * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
 * @param attr the attribute to unescape.
 * @returns the unescaped string.
 */
function unescapeAttribute(attr: string): string {
  let result = '';
  let escaping = false;
  for (let i = 0; i < attr.length; i++) {
    const char = attr.charAt(i);
    if (char === '\\') {
      escaping = true;
      continue;
    }
    if (char === '$' && !escaping) {
      throw new Error(
        `Error in attribute selector "${attr}". ` +
          `Unescaped "$" is not supported. Please escape with "\\$".`,
      );
    }
    escaping = false;
    result += char;
  }
  return result;
}

function setElement(selector: CssSelector, element: string | null = null): void {
  selector.element = element;
}

function addAttribute(selector: CssSelector, name: string, value: string = ''): void {
  selector.attrs.push(name, (value && value.toLowerCase()) || '');
}

function addClassName(selector: CssSelector, name: string): void {
  selector.classNames.push(name.toLowerCase());
}

function parserSelectorToSimpleSelector(selector: CssSelector): R3CssSelector {
  const classes =
    selector.classNames && selector.classNames.length
      ? [SelectorFlags.CLASS, ...selector.classNames]
      : [];
  const elementName = selector.element && selector.element !== '*' ? selector.element : '';
  return [elementName, ...selector.attrs, ...classes];
}

function parserSelectorToNegativeSelector(selector: CssSelector): R3CssSelector {
  const classes =
    selector.classNames && selector.classNames.length
      ? [SelectorFlags.CLASS, ...selector.classNames]
      : [];

  if (selector.element) {
    return [
      SelectorFlags.NOT | SelectorFlags.ELEMENT,
      selector.element,
      ...selector.attrs,
      ...classes,
    ];
  } else if (selector.attrs.length) {
    return [SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, ...selector.attrs, ...classes];
  } else {
    return selector.classNames && selector.classNames.length
      ? [SelectorFlags.NOT | SelectorFlags.CLASS, ...selector.classNames]
      : [];
  }
}

function parserSelectorToR3Selector(selector: CssSelector): R3CssSelector {
  const positive = parserSelectorToSimpleSelector(selector);

  const negative: R3CssSelectorList =
    selector.notSelectors && selector.notSelectors.length
      ? selector.notSelectors.map((notSelector) => parserSelectorToNegativeSelector(notSelector))
      : [];

  return positive.concat(...negative);
}

export function parseSelectorStringToCssSelector(
  selector: string | null | undefined,
): R3CssSelectorList {
  return selector ? parseCssSelector(selector).map(parserSelectorToR3Selector) : [];
}
