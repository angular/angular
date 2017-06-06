import { Map, ListWrapper } from 'angular2/src/facade/collection';
import { isPresent, isBlank, RegExpWrapper, RegExpMatcherWrapper, StringWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
const _EMPTY_ATTR_VALUE = '';
// TODO: Can't use `const` here as
// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP = RegExpWrapper.create('(\\:not\\()|' +
    '([-\\w]+)|' +
    '(?:\\.([-\\w]+))|' +
    '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' +
    '(\\))|' +
    '(\\s*,\\s*)'); // ","
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
    constructor() {
        this.element = null;
        this.classNames = [];
        this.attrs = [];
        this.notSelectors = [];
    }
    static parse(selector) {
        var results = [];
        var _addResult = (res, cssSel) => {
            if (cssSel.notSelectors.length > 0 && isBlank(cssSel.element) &&
                ListWrapper.isEmpty(cssSel.classNames) && ListWrapper.isEmpty(cssSel.attrs)) {
                cssSel.element = "*";
            }
            res.push(cssSel);
        };
        var cssSelector = new CssSelector();
        var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
        var match;
        var current = cssSelector;
        var inNot = false;
        while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
            if (isPresent(match[1])) {
                if (inNot) {
                    throw new BaseException('Nesting :not is not allowed in a selector');
                }
                inNot = true;
                current = new CssSelector();
                cssSelector.notSelectors.push(current);
            }
            if (isPresent(match[2])) {
                current.setElement(match[2]);
            }
            if (isPresent(match[3])) {
                current.addClassName(match[3]);
            }
            if (isPresent(match[4])) {
                current.addAttribute(match[4], match[5]);
            }
            if (isPresent(match[6])) {
                inNot = false;
                current = cssSelector;
            }
            if (isPresent(match[7])) {
                if (inNot) {
                    throw new BaseException('Multiple selectors in :not are not supported');
                }
                _addResult(results, cssSelector);
                cssSelector = current = new CssSelector();
            }
        }
        _addResult(results, cssSelector);
        return results;
    }
    isElementSelector() {
        return isPresent(this.element) && ListWrapper.isEmpty(this.classNames) &&
            ListWrapper.isEmpty(this.attrs) && this.notSelectors.length === 0;
    }
    setElement(element = null) { this.element = element; }
    /** Gets a template string for an element that matches the selector. */
    getMatchingElementTemplate() {
        let tagName = isPresent(this.element) ? this.element : 'div';
        let classAttr = this.classNames.length > 0 ? ` class="${this.classNames.join(' ')}"` : '';
        let attrs = '';
        for (let i = 0; i < this.attrs.length; i += 2) {
            let attrName = this.attrs[i];
            let attrValue = this.attrs[i + 1] !== '' ? `="${this.attrs[i + 1]}"` : '';
            attrs += ` ${attrName}${attrValue}`;
        }
        return `<${tagName}${classAttr}${attrs}></${tagName}>`;
    }
    addAttribute(name, value = _EMPTY_ATTR_VALUE) {
        this.attrs.push(name);
        if (isPresent(value)) {
            value = value.toLowerCase();
        }
        else {
            value = _EMPTY_ATTR_VALUE;
        }
        this.attrs.push(value);
    }
    addClassName(name) { this.classNames.push(name.toLowerCase()); }
    toString() {
        var res = '';
        if (isPresent(this.element)) {
            res += this.element;
        }
        if (isPresent(this.classNames)) {
            for (var i = 0; i < this.classNames.length; i++) {
                res += '.' + this.classNames[i];
            }
        }
        if (isPresent(this.attrs)) {
            for (var i = 0; i < this.attrs.length;) {
                var attrName = this.attrs[i++];
                var attrValue = this.attrs[i++];
                res += '[' + attrName;
                if (attrValue.length > 0) {
                    res += '=' + attrValue;
                }
                res += ']';
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
    constructor() {
        this._elementMap = new Map();
        this._elementPartialMap = new Map();
        this._classMap = new Map();
        this._classPartialMap = new Map();
        this._attrValueMap = new Map();
        this._attrValuePartialMap = new Map();
        this._listContexts = [];
    }
    static createNotMatcher(notSelectors) {
        var notMatcher = new SelectorMatcher();
        notMatcher.addSelectables(notSelectors, null);
        return notMatcher;
    }
    addSelectables(cssSelectors, callbackCtxt) {
        var listContext = null;
        if (cssSelectors.length > 1) {
            listContext = new SelectorListContext(cssSelectors);
            this._listContexts.push(listContext);
        }
        for (var i = 0; i < cssSelectors.length; i++) {
            this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
        }
    }
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
     */
    _addSelectable(cssSelector, callbackCtxt, listContext) {
        var matcher = this;
        var element = cssSelector.element;
        var classNames = cssSelector.classNames;
        var attrs = cssSelector.attrs;
        var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
        if (isPresent(element)) {
            var isTerminal = attrs.length === 0 && classNames.length === 0;
            if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
            }
            else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
            }
        }
        if (isPresent(classNames)) {
            for (var index = 0; index < classNames.length; index++) {
                var isTerminal = attrs.length === 0 && index === classNames.length - 1;
                var className = classNames[index];
                if (isTerminal) {
                    this._addTerminal(matcher._classMap, className, selectable);
                }
                else {
                    matcher = this._addPartial(matcher._classPartialMap, className);
                }
            }
        }
        if (isPresent(attrs)) {
            for (var index = 0; index < attrs.length;) {
                var isTerminal = index === attrs.length - 2;
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                if (isTerminal) {
                    var terminalMap = matcher._attrValueMap;
                    var terminalValuesMap = terminalMap.get(attrName);
                    if (isBlank(terminalValuesMap)) {
                        terminalValuesMap = new Map();
                        terminalMap.set(attrName, terminalValuesMap);
                    }
                    this._addTerminal(terminalValuesMap, attrValue, selectable);
                }
                else {
                    var parttialMap = matcher._attrValuePartialMap;
                    var partialValuesMap = parttialMap.get(attrName);
                    if (isBlank(partialValuesMap)) {
                        partialValuesMap = new Map();
                        parttialMap.set(attrName, partialValuesMap);
                    }
                    matcher = this._addPartial(partialValuesMap, attrValue);
                }
            }
        }
    }
    _addTerminal(map, name, selectable) {
        var terminalList = map.get(name);
        if (isBlank(terminalList)) {
            terminalList = [];
            map.set(name, terminalList);
        }
        terminalList.push(selectable);
    }
    _addPartial(map, name) {
        var matcher = map.get(name);
        if (isBlank(matcher)) {
            matcher = new SelectorMatcher();
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
    match(cssSelector, matchedCallback) {
        var result = false;
        var element = cssSelector.element;
        var classNames = cssSelector.classNames;
        var attrs = cssSelector.attrs;
        for (var i = 0; i < this._listContexts.length; i++) {
            this._listContexts[i].alreadyMatched = false;
        }
        result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
        result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) ||
            result;
        if (isPresent(classNames)) {
            for (var index = 0; index < classNames.length; index++) {
                var className = classNames[index];
                result =
                    this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                result =
                    this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) ||
                        result;
            }
        }
        if (isPresent(attrs)) {
            for (var index = 0; index < attrs.length;) {
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var terminalValuesMap = this._attrValueMap.get(attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                    result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) ||
                        result;
                }
                result = this._matchTerminal(terminalValuesMap, attrValue, cssSelector, matchedCallback) ||
                    result;
                var partialValuesMap = this._attrValuePartialMap.get(attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                    result = this._matchPartial(partialValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) ||
                        result;
                }
                result =
                    this._matchPartial(partialValuesMap, attrValue, cssSelector, matchedCallback) || result;
            }
        }
        return result;
    }
    /** @internal */
    _matchTerminal(map, name, cssSelector, matchedCallback) {
        if (isBlank(map) || isBlank(name)) {
            return false;
        }
        var selectables = map.get(name);
        var starSelectables = map.get("*");
        if (isPresent(starSelectables)) {
            selectables = selectables.concat(starSelectables);
        }
        if (isBlank(selectables)) {
            return false;
        }
        var selectable;
        var result = false;
        for (var index = 0; index < selectables.length; index++) {
            selectable = selectables[index];
            result = selectable.finalize(cssSelector, matchedCallback) || result;
        }
        return result;
    }
    /** @internal */
    _matchPartial(map, name, cssSelector, matchedCallback /*: (c: CssSelector, a: any) => void*/) {
        if (isBlank(map) || isBlank(name)) {
            return false;
        }
        var nestedSelector = map.get(name);
        if (isBlank(nestedSelector)) {
            return false;
        }
        // TODO(perf): get rid of recursion and measure again
        // TODO(perf): don't pass the whole selector into the recursion,
        // but only the not processed parts
        return nestedSelector.match(cssSelector, matchedCallback);
    }
}
export class SelectorListContext {
    constructor(selectors) {
        this.selectors = selectors;
        this.alreadyMatched = false;
    }
}
// Store context to pass back selector and context when a selector is matched
export class SelectorContext {
    constructor(selector, cbContext, listContext) {
        this.selector = selector;
        this.cbContext = cbContext;
        this.listContext = listContext;
        this.notSelectors = selector.notSelectors;
    }
    finalize(cssSelector, callback) {
        var result = true;
        if (this.notSelectors.length > 0 &&
            (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
            var notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
            result = !notMatcher.match(cssSelector, null);
        }
        if (result && isPresent(callback) &&
            (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
            if (isPresent(this.listContext)) {
                this.listContext.alreadyMatched = true;
            }
            callback(this.selector, this.cbContext);
        }
        return result;
    }
}
