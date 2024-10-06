/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * errors thrown by parser
 */
export enum CssSelectorParserErrors {
  NotInNot = 'Nesting :not in a selector is not allowed',
  CommaInNot = 'Multiple selectors in :not are not supported',
  PseudoElement = 'Pseudo element are not supported',
  Combinators = 'CSS combinators (> + ~ "space") are not supported',
  MultipleTagName = 'Multiple tag names are not allowed',
}

const _SELECTOR_REGEXP = (() => {
  const identifierNameRegexp = '[a-zA-Z0-9_-]+';
  return new RegExp(
    [
      '(:svg:[^:]+)', // svg syntax used internally
      '(:not\\([^)]+\\))', // :not pseudo selector
      '([.#]' + identifierNameRegexp + ')', // classes and id ( starting by . or # )
      '(\\[[^\\]]+(?:=.*)?\\])', // attributes (surrounded by "[" and "]")
      '((?<![#:[(])' + identifierNameRegexp + ')', // element (not preceded by "#.(:")
    ].join('|'),
    'gm',
  );
})();

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element: string | null = null;
  classNames: string[] = [];
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
  attrs: string[] = [];
  notSelectors: CssSelector[] = [];

  static parse(globalSelector: string): CssSelector[] {
    const results: CssSelector[] = [];

    const throwError = (message: string) => {
      // add initial selector in error for better debugging experience
      throw new Error(message + ' for selector ' + globalSelector);
    };

    // check for unimplemented syntax
    [
      {
        // :not in :not
        exp: /:not\([^)]*:not[^)]*\)/,
        message: CssSelectorParserErrors.NotInNot,
      },
      {
        // comma in :not
        exp: /:not\([^)]*,[^)]*\)/,
        message: CssSelectorParserErrors.CommaInNot,
      },
      {
        // pseudo element
        exp: /(::)/,
        message: CssSelectorParserErrors.PseudoElement,
      },
    ].forEach(({exp, message}) => {
      if (exp.test(globalSelector)) {
        throwError(message);
      }
    });

    // right now, we have only comma separated selectors, letz grab them
    const selectorsList = globalSelector.split(',').map((s) => s.trim()); // remove extra space from each selector

    for (const selector of selectorsList) {
      // for each selector, check if combinators are used
      if (/[>+~\s]/.test(selector)) {
        throwError(CssSelectorParserErrors.Combinators);
      }

      const cssSelector = new CssSelector();

      _SELECTOR_REGEXP.lastIndex = 0;
      const matches = selector.match(_SELECTOR_REGEXP) || [];
      for (const match of matches) {
        const matchWithoutFirstChar = match.slice(1);
        switch (match[0]) {
          case '.': // classes
            cssSelector.addClassName(matchWithoutFirstChar);
            break;
          case '[': // attributes
            const [name, value] = matchWithoutFirstChar
              .slice(0, -1) // remove last "]"
              .replace(/['"]/g, '') // remove quotes
              .split('='); // split name from value

            const unescapedName = cssSelector.unescapeAttribute(name);
            cssSelector.addAttribute(unescapedName, value);
            break;
          case '#': // id
            cssSelector.addAttribute('id', matchWithoutFirstChar);
            break;
          case ':': // :not and :svg:
            if (match.startsWith(':svg:')) {
              cssSelector.element = match.replace(':svg:', '');
              break;
            }
            const notInSelector = matchWithoutFirstChar.slice(4, -1); // remove "not(" and last ")"
            // parse selector of :not and get first one selector,
            // because we know here that comma inside ":not" is forbidden by previous checks
            cssSelector.notSelectors.push(CssSelector.parse(notInSelector)[0]);
            break;
          default: // tagName
            if (cssSelector.element) {
              throwError(CssSelectorParserErrors.MultipleTagName);
            }
            cssSelector.setElement(match);
            break;
        }
      }

      // add wildcard element if no element, classes and attributes
      if (
        cssSelector.notSelectors.length > 0 &&
        !cssSelector.element &&
        cssSelector.classNames.length == 0 &&
        cssSelector.attrs.length == 0
      ) {
        cssSelector.element = '*';
      }

      results.push(cssSelector);
    }

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
  unescapeAttribute(attr: string): string {
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

  /**
   * Escape `$` sequences from the CSS attribute selector.
   *
   * This is needed because `$` can have a special meaning in CSS selectors,
   * with this method we are escaping `$` with `\$'.
   * [MDN web link for more
   * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
   * @param attr the attribute to escape.
   * @returns the escaped string.
   */
  escapeAttribute(attr: string): string {
    return attr.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');
  }

  isElementSelector(): boolean {
    return (
      this.hasElementSelector() &&
      this.classNames.length == 0 &&
      this.attrs.length == 0 &&
      this.notSelectors.length === 0
    );
  }

  hasElementSelector(): boolean {
    return !!this.element;
  }

  setElement(element: string | null = null) {
    this.element = element;
  }

  getAttrs(): string[] {
    const result: string[] = [];
    if (this.classNames.length > 0) {
      result.push('class', this.classNames.join(' '));
    }
    return result.concat(this.attrs);
  }

  addAttribute(name: string, value: string = '') {
    this.attrs.push(name, (value && value.toLowerCase()) || '');
  }

  addClassName(name: string) {
    this.classNames.push(name.toLowerCase());
  }

  toString(): string {
    let res: string = this.element || '';
    if (this.classNames) {
      this.classNames.forEach((klass) => (res += `.${klass}`));
    }
    if (this.attrs) {
      for (let i = 0; i < this.attrs.length; i += 2) {
        const name = this.escapeAttribute(this.attrs[i]);
        const value = this.attrs[i + 1];
        res += `[${name}${value ? '=' + value : ''}]`;
      }
    }
    this.notSelectors.forEach((notSelector) => (res += `:not(${notSelector})`));
    return res;
  }
}

/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export class SelectorMatcher<T = any> {
  static createNotMatcher(notSelectors: CssSelector[]): SelectorMatcher<null> {
    const notMatcher = new SelectorMatcher<null>();
    notMatcher.addSelectables(notSelectors, null);
    return notMatcher;
  }

  private _elementMap = new Map<string, SelectorContext<T>[]>();
  private _elementPartialMap = new Map<string, SelectorMatcher<T>>();
  private _classMap = new Map<string, SelectorContext<T>[]>();
  private _classPartialMap = new Map<string, SelectorMatcher<T>>();
  private _attrValueMap = new Map<string, Map<string, SelectorContext<T>[]>>();
  private _attrValuePartialMap = new Map<string, Map<string, SelectorMatcher<T>>>();
  private _listContexts: SelectorListContext[] = [];

  addSelectables(cssSelectors: CssSelector[], callbackCtxt?: T) {
    let listContext: SelectorListContext = null!;
    if (cssSelectors.length > 1) {
      listContext = new SelectorListContext(cssSelectors);
      this._listContexts.push(listContext);
    }
    for (let i = 0; i < cssSelectors.length; i++) {
      this._addSelectable(cssSelectors[i], callbackCtxt as T, listContext);
    }
  }

  /**
   * Add an object that can be found later on by calling `match`.
   * @param cssSelector A css selector
   * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
   */
  private _addSelectable(
    cssSelector: CssSelector,
    callbackCtxt: T,
    listContext: SelectorListContext,
  ) {
    let matcher: SelectorMatcher<T> = this;
    const element = cssSelector.element;
    const classNames = cssSelector.classNames;
    const attrs = cssSelector.attrs;
    const selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);

    if (element) {
      const isTerminal = attrs.length === 0 && classNames.length === 0;
      if (isTerminal) {
        this._addTerminal(matcher._elementMap, element, selectable);
      } else {
        matcher = this._addPartial(matcher._elementPartialMap, element);
      }
    }

    if (classNames) {
      for (let i = 0; i < classNames.length; i++) {
        const isTerminal = attrs.length === 0 && i === classNames.length - 1;
        const className = classNames[i];
        if (isTerminal) {
          this._addTerminal(matcher._classMap, className, selectable);
        } else {
          matcher = this._addPartial(matcher._classPartialMap, className);
        }
      }
    }

    if (attrs) {
      for (let i = 0; i < attrs.length; i += 2) {
        const isTerminal = i === attrs.length - 2;
        const name = attrs[i];
        const value = attrs[i + 1];
        if (isTerminal) {
          const terminalMap = matcher._attrValueMap;
          let terminalValuesMap = terminalMap.get(name);
          if (!terminalValuesMap) {
            terminalValuesMap = new Map<string, SelectorContext<T>[]>();
            terminalMap.set(name, terminalValuesMap);
          }
          this._addTerminal(terminalValuesMap, value, selectable);
        } else {
          const partialMap = matcher._attrValuePartialMap;
          let partialValuesMap = partialMap.get(name);
          if (!partialValuesMap) {
            partialValuesMap = new Map<string, SelectorMatcher<T>>();
            partialMap.set(name, partialValuesMap);
          }
          matcher = this._addPartial(partialValuesMap, value);
        }
      }
    }
  }

  private _addTerminal(
    map: Map<string, SelectorContext<T>[]>,
    name: string,
    selectable: SelectorContext<T>,
  ) {
    let terminalList = map.get(name);
    if (!terminalList) {
      terminalList = [];
      map.set(name, terminalList);
    }
    terminalList.push(selectable);
  }

  private _addPartial(map: Map<string, SelectorMatcher<T>>, name: string): SelectorMatcher<T> {
    let matcher = map.get(name);
    if (!matcher) {
      matcher = new SelectorMatcher<T>();
      map.set(name, matcher);
    }
    return matcher;
  }

  /**
   * Find the objects that have been added via `addSelectable`
   * whose css selector is contained in the given css selector.
   * @param cssSelector A css selector
   * @param matchedCallback This callback will be called with the object handed into `addSelectable`
   * @return boolean true if a match was found
   */
  match(
    cssSelector: CssSelector,
    matchedCallback: ((c: CssSelector, a: T) => void) | null,
  ): boolean {
    let result = false;
    const element = cssSelector.element!;
    const classNames = cssSelector.classNames;
    const attrs = cssSelector.attrs;

    for (let i = 0; i < this._listContexts.length; i++) {
      this._listContexts[i].alreadyMatched = false;
    }

    result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
    result =
      this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) || result;

    if (classNames) {
      for (let i = 0; i < classNames.length; i++) {
        const className = classNames[i];
        result =
          this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
        result =
          this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) ||
          result;
      }
    }

    if (attrs) {
      for (let i = 0; i < attrs.length; i += 2) {
        const name = attrs[i];
        const value = attrs[i + 1];

        const terminalValuesMap = this._attrValueMap.get(name)!;
        if (value) {
          result =
            this._matchTerminal(terminalValuesMap, '', cssSelector, matchedCallback) || result;
        }
        result =
          this._matchTerminal(terminalValuesMap, value, cssSelector, matchedCallback) || result;

        const partialValuesMap = this._attrValuePartialMap.get(name)!;
        if (value) {
          result = this._matchPartial(partialValuesMap, '', cssSelector, matchedCallback) || result;
        }
        result =
          this._matchPartial(partialValuesMap, value, cssSelector, matchedCallback) || result;
      }
    }
    return result;
  }

  /** @internal */
  _matchTerminal(
    map: Map<string, SelectorContext<T>[]>,
    name: string,
    cssSelector: CssSelector,
    matchedCallback: ((c: CssSelector, a: any) => void) | null,
  ): boolean {
    if (!map || typeof name !== 'string') {
      return false;
    }

    let selectables: SelectorContext<T>[] = map.get(name) || [];
    const starSelectables: SelectorContext<T>[] = map.get('*')!;
    if (starSelectables) {
      selectables = selectables.concat(starSelectables);
    }
    if (selectables.length === 0) {
      return false;
    }
    let selectable: SelectorContext<T>;
    let result = false;
    for (let i = 0; i < selectables.length; i++) {
      selectable = selectables[i];
      result = selectable.finalize(cssSelector, matchedCallback) || result;
    }
    return result;
  }

  /** @internal */
  _matchPartial(
    map: Map<string, SelectorMatcher<T>>,
    name: string,
    cssSelector: CssSelector,
    matchedCallback: ((c: CssSelector, a: any) => void) | null,
  ): boolean {
    if (!map || typeof name !== 'string') {
      return false;
    }

    const nestedSelector = map.get(name);
    if (!nestedSelector) {
      return false;
    }
    // TODO(perf): get rid of recursion and measure again
    // TODO(perf): don't pass the whole selector into the recursion,
    // but only the not processed parts
    return nestedSelector.match(cssSelector, matchedCallback);
  }
}

export class SelectorListContext {
  alreadyMatched: boolean = false;

  constructor(public selectors: CssSelector[]) {}
}

// Store context to pass back selector and context when a selector is matched
export class SelectorContext<T = any> {
  notSelectors: CssSelector[];

  constructor(
    public selector: CssSelector,
    public cbContext: T,
    public listContext: SelectorListContext,
  ) {
    this.notSelectors = selector.notSelectors;
  }

  finalize(cssSelector: CssSelector, callback: ((c: CssSelector, a: T) => void) | null): boolean {
    let result = true;
    if (this.notSelectors.length > 0 && (!this.listContext || !this.listContext.alreadyMatched)) {
      const notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
      result = !notMatcher.match(cssSelector, null);
    }
    if (result && callback && (!this.listContext || !this.listContext.alreadyMatched)) {
      if (this.listContext) {
        this.listContext.alreadyMatched = true;
      }
      callback(this.selector, this.cbContext);
    }
    return result;
  }
}
