/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getHtmlTagDefinition} from './ml_parser/html_tags';

const _SELECTOR_REGEXP = new RegExp(
    '(\\:not\\()|' +                              //":not("
        '([-\\w]+)|' +                            // "tag"
        '(?:\\.([-\\w]+))|' +                     // ".class"
        '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' +  // "[name]", "[name=value]"
        '(\\))|' +                                // ")"
        '(\\s*,\\s*)',                            // ","
    'g');

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element: string = null;
  classNames: string[] = [];
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
    let match: string[];
    let current = cssSelector;
    let inNot = false;
    _SELECTOR_REGEXP.lastIndex = 0;
    while (match = _SELECTOR_REGEXP.exec(selector)) {
      if (match[1]) {
        if (inNot) {
          throw new Error('Nesting :not is not allowed in a selector');
        }
        inNot = true;
        current = new CssSelector();
        cssSelector.notSelectors.push(current);
      }
      if (match[2]) {
        current.setElement(match[2]);
      }
      if (match[3]) {
        current.addClassName(match[3]);
      }
      if (match[4]) {
        current.addAttribute(match[4], match[5]);
      }
      if (match[6]) {
        inNot = false;
        current = cssSelector;
      }
      if (match[7]) {
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

  hasElementSelector(): boolean { return !!this.element; }

  setElement(element: string = null) { this.element = element; }

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

  addAttribute(name: string, value: string = '') {
    this.attrs.push(name, value && value.toLowerCase() || '');
  }

  addClassName(name: string) { this.classNames.push(name.toLowerCase()); }

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
export class SelectorMatcher {
  static createNotMatcher(notSelectors: CssSelector[]): SelectorMatcher {
    const notMatcher = new SelectorMatcher();
    notMatcher.addSelectables(notSelectors, null);
    return notMatcher;
  }

  private _elementMap: {[k: string]: SelectorContext[]} = {};
  private _elementPartialMap: {[k: string]: SelectorMatcher} = {};
  private _classMap: {[k: string]: SelectorContext[]} = {};
  private _classPartialMap: {[k: string]: SelectorMatcher} = {};
  private _attrValueMap: {[k: string]: {[k: string]: SelectorContext[]}} = {};
  private _attrValuePartialMap: {[k: string]: {[k: string]: SelectorMatcher}} = {};
  private _listContexts: SelectorListContext[] = [];

  addSelectables(cssSelectors: CssSelector[], callbackCtxt?: any) {
    let listContext: SelectorListContext = null;
    if (cssSelectors.length > 1) {
      listContext = new SelectorListContext(cssSelectors);
      this._listContexts.push(listContext);
    }
    for (let i = 0; i < cssSelectors.length; i++) {
      this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
    }
  }

  /**
   * Add an object that can be found later on by calling `match`.
   * @param cssSelector A css selector
   * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
   */
  private _addSelectable(
      cssSelector: CssSelector, callbackCtxt: any, listContext: SelectorListContext) {
    let matcher: SelectorMatcher = this;
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
          let terminalValuesMap = terminalMap[name];
          if (!terminalValuesMap) {
            terminalValuesMap = {};
            terminalMap[name] = terminalValuesMap;
          }
          this._addTerminal(terminalValuesMap, value, selectable);
        } else {
          let partialMap = matcher._attrValuePartialMap;
          let partialValuesMap = partialMap[name];
          if (!partialValuesMap) {
            partialValuesMap = {};
            partialMap[name] = partialValuesMap;
          }
          matcher = this._addPartial(partialValuesMap, value);
        }
      }
    }
  }

  private _addTerminal(
      map: {[k: string]: SelectorContext[]}, name: string, selectable: SelectorContext) {
    let terminalList = map[name];
    if (!terminalList) {
      terminalList = [];
      map[name] = terminalList;
    }
    terminalList.push(selectable);
  }

  private _addPartial(map: {[k: string]: SelectorMatcher}, name: string): SelectorMatcher {
    let matcher = map[name];
    if (!matcher) {
      matcher = new SelectorMatcher();
      map[name] = matcher;
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
  match(cssSelector: CssSelector, matchedCallback: (c: CssSelector, a: any) => void): boolean {
    let result = false;
    const element = cssSelector.element;
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

        const terminalValuesMap = this._attrValueMap[name];
        if (value) {
          result =
              this._matchTerminal(terminalValuesMap, '', cssSelector, matchedCallback) || result;
        }
        result =
            this._matchTerminal(terminalValuesMap, value, cssSelector, matchedCallback) || result;

        const partialValuesMap = this._attrValuePartialMap[name];
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
      map: {[k: string]: SelectorContext[]}, name: string, cssSelector: CssSelector,
      matchedCallback: (c: CssSelector, a: any) => void): boolean {
    if (!map || typeof name !== 'string') {
      return false;
    }

    let selectables = map[name];
    const starSelectables = map['*'];
    if (starSelectables) {
      selectables = selectables.concat(starSelectables);
    }
    if (!selectables) {
      return false;
    }
    let selectable: SelectorContext;
    let result = false;
    for (let i = 0; i < selectables.length; i++) {
      selectable = selectables[i];
      result = selectable.finalize(cssSelector, matchedCallback) || result;
    }
    return result;
  }

  /** @internal */
  _matchPartial(
      map: {[k: string]: SelectorMatcher}, name: string, cssSelector: CssSelector,
      matchedCallback: (c: CssSelector, a: any) => void): boolean {
    if (!map || typeof name !== 'string') {
      return false;
    }

    const nestedSelector = map[name];
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
export class SelectorContext {
  notSelectors: CssSelector[];

  constructor(
      public selector: CssSelector, public cbContext: any,
      public listContext: SelectorListContext) {
    this.notSelectors = selector.notSelectors;
  }

  finalize(cssSelector: CssSelector, callback: (c: CssSelector, a: any) => void): boolean {
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
