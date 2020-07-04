/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getHtmlTagDefinition} from './ml_parser/html_tags';

const _SELECTOR_REGEXP = new RegExp(
    '(\\:not\\()|' +               // 1: ":not("
        '(([\\.\\#]?)[-\\w]+)|' +  // 2: "tag"; 3: "."/"#";
        // "-" should appear first in the regexp below as FF31 parses "[.-\w]" as a range
        // 4: attribute; 5: attribute_string; 6: attribute_value
        '(?:\\[([-.\\w*]+)(?:=([\"\']?)([^\\]\"\']*)\\5)?\\])|' +  // "[name]", "[name=value]",
                                                                   // "[name="value"]",
                                                                   // "[name='value']"
        '(\\))|' +                                                 // 7: ")"
        '(\\s*,\\s*)',                                             // 8: ","
    'g');

/**
 * These offsets should match the match-groups in `_SELECTOR_REGEXP` offsets.
 */
const enum SelectorRegexp {
  ALL = 0,  // The whole match
  NOT = 1,
  TAG = 2,
  PREFIX = 3,
  ATTRIBUTE = 4,
  ATTRIBUTE_STRING = 5,
  ATTRIBUTE_VALUE = 6,
  NOT_END = 7,
  SEPARATOR = 8,
}
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element: string|null = null;
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

  static parse(selector: string): CssSelector[] {
    const results: CssSelector[] = [];
    const _addResult = (res: CssSelector[], cssSel: CssSelector) => {
      if (cssSel.notSelectors.length > 0 && !cssSel.element && cssSel.classNames.length == 0 &&
          cssSel.attrs.length == 0) {
        cssSel.element = '*';
      }
      res.push(cssSel);
    };
    let cssSelector = new CssSelector();
    let match: string[]|null;
    let current = cssSelector;
    let inNot = false;
    _SELECTOR_REGEXP.lastIndex = 0;
    while (match = _SELECTOR_REGEXP.exec(selector)) {
      if (match[SelectorRegexp.NOT]) {
        if (inNot) {
          throw new Error('Nesting :not in a selector is not allowed');
        }
        inNot = true;
        current = new CssSelector();
        cssSelector.notSelectors.push(current);
      }
      const tag = match[SelectorRegexp.TAG];
      if (tag) {
        const prefix = match[SelectorRegexp.PREFIX];
        if (prefix === '#') {
          // #hash
          current.addAttribute('id', tag.substr(1));
        } else if (prefix === '.') {
          // Class
          current.addClassName(tag.substr(1));
        } else {
          // Element
          current.setElement(tag);
        }
      }
      const attribute = match[SelectorRegexp.ATTRIBUTE];
      if (attribute) {
        current.addAttribute(attribute, match[SelectorRegexp.ATTRIBUTE_VALUE]);
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
        cssSelector = current = new CssSelector();
      }
    }
    _addResult(results, cssSelector);
    return results;
  }

  isElementSelector(): boolean {
    return this.hasElementSelector() && this.classNames.length == 0 && this.attrs.length == 0 &&
        this.notSelectors.length === 0;
  }

  hasElementSelector(): boolean {
    return !!this.element;
  }

  setElement(element: string|null = null) {
    this.element = element;
  }

  /** Gets a template string for an element that matches the selector. */
  getMatchingElementTemplate(): string {
    const tagName = this.element || 'div';
    const classAttr = this.classNames.length > 0 ? ` class="${this.classNames.join(' ')}"` : '';

    let attrs = '';
    for (let i = 0; i < this.attrs.length; i += 2) {
      const attrName = this.attrs[i];
      const attrValue = this.attrs[i + 1] !== '' ? `="${this.attrs[i + 1]}"` : '';
      attrs += ` ${attrName}${attrValue}`;
    }

    return getHtmlTagDefinition(tagName).isVoid ? `<${tagName}${classAttr}${attrs}/>` :
                                                  `<${tagName}${classAttr}${attrs}></${tagName}>`;
  }

  getAttrs(): string[] {
    const result: string[] = [];
    if (this.classNames.length > 0) {
      result.push('class', this.classNames.join(' '));
    }
    return result.concat(this.attrs);
  }

  addAttribute(name: string, value: string = '') {
    this.attrs.push(name, value && value.toLowerCase() || '');
  }

  addClassName(name: string) {
    this.classNames.push(name.toLowerCase());
  }

  toString(): string {
    let res: string = this.element || '';
    if (this.classNames) {
      this.classNames.forEach(klass => res += `.${klass}`);
    }
    if (this.attrs) {
      for (let i = 0; i < this.attrs.length; i += 2) {
        const name = this.attrs[i];
        const value = this.attrs[i + 1];
        res += `[${name}${value ? '=' + value : ''}]`;
      }
    }
    this.notSelectors.forEach(notSelector => res += `:not(${notSelector})`);
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
      cssSelector: CssSelector, callbackCtxt: T, listContext: SelectorListContext) {
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
      map: Map<string, SelectorContext<T>[]>, name: string, selectable: SelectorContext<T>) {
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
  match(cssSelector: CssSelector, matchedCallback: ((c: CssSelector, a: T) => void)|null): boolean {
    let result = false;
    const element = cssSelector.element!;
    const classNames = cssSelector.classNames;
    const attrs = cssSelector.attrs;

    for (let i = 0; i < this._listContexts.length; i++) {
      this._listContexts[i].alreadyMatched = false;
    }

    result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
    result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) ||
        result;

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
      map: Map<string, SelectorContext<T>[]>, name: string, cssSelector: CssSelector,
      matchedCallback: ((c: CssSelector, a: any) => void)|null): boolean {
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
      map: Map<string, SelectorMatcher<T>>, name: string, cssSelector: CssSelector,
      matchedCallback: ((c: CssSelector, a: any) => void)|null): boolean {
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
      public selector: CssSelector, public cbContext: T, public listContext: SelectorListContext) {
    this.notSelectors = selector.notSelectors;
  }

  finalize(cssSelector: CssSelector, callback: ((c: CssSelector, a: T) => void)|null): boolean {
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
