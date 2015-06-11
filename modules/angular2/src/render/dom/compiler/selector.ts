import {List, Map, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {
  isPresent,
  isBlank,
  RegExpWrapper,
  RegExpMatcherWrapper,
  StringWrapper,
  BaseException
} from 'angular2/src/facade/lang';

const _EMPTY_ATTR_VALUE = '';

// TODO: Can't use `const` here as
// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP = RegExpWrapper.create(
    '(\\:not\\()|' +                          //":not("
    '([-\\w]+)|' +                            // "tag"
    '(?:\\.([-\\w]+))|' +                     // ".class"
    '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' +  // "[name]", "[name=value]" or "[name*=value]"
    '(\\))|' +                                // ")"
    '(\\s*,\\s*)');                           // ","

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element: string = null;
  classNames: List<string> = [];
  attrs: List<string> = [];
  notSelectors: List<CssSelector> = [];

  static parse(selector: string): List<CssSelector> {
    var results = ListWrapper.create();
    var _addResult = (res, cssSel) => {
      if (cssSel.notSelectors.length > 0 && isBlank(cssSel.element) &&
          ListWrapper.isEmpty(cssSel.classNames) && ListWrapper.isEmpty(cssSel.attrs)) {
        cssSel.element = "*";
      }
      ListWrapper.push(res, cssSel);
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
        ListWrapper.push(cssSelector.notSelectors, current);
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

  isElementSelector(): boolean {
    return isPresent(this.element) && ListWrapper.isEmpty(this.classNames) &&
           ListWrapper.isEmpty(this.attrs) && this.notSelectors.length === 0;
  }

  setElement(element: string = null) {
    if (isPresent(element)) {
      element = element.toLowerCase();
    }
    this.element = element;
  }

  addAttribute(name: string, value: string = _EMPTY_ATTR_VALUE) {
    ListWrapper.push(this.attrs, name.toLowerCase());
    if (isPresent(value)) {
      value = value.toLowerCase();
    } else {
      value = _EMPTY_ATTR_VALUE;
    }
    ListWrapper.push(this.attrs, value);
  }

  addClassName(name: string) { ListWrapper.push(this.classNames, name.toLowerCase()); }

  toString(): string {
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
    ListWrapper.forEach(this.notSelectors,
                        (notSelector) => { res += ":not(" + notSelector.toString() + ")"; });
    return res;
  }
}

/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export class SelectorMatcher {
  static createNotMatcher(notSelectors: List<CssSelector>) {
    var notMatcher = new SelectorMatcher();
    notMatcher.addSelectables(notSelectors, null);
    return notMatcher;
  }

  private _elementMap: Map<string, List<string>> = MapWrapper.create();
  private _elementPartialMap: Map<string, SelectorMatcher> = MapWrapper.create();
  private _classMap: Map<string, List<string>> = MapWrapper.create();
  private _classPartialMap: Map<string, SelectorMatcher> = MapWrapper.create();
  private _attrValueMap: Map<string, Map<string, List<string>>> = MapWrapper.create();
  private _attrValuePartialMap: Map<string, Map<string, SelectorMatcher>> = MapWrapper.create();
  private _listContexts: List<SelectorListContext> = [];

  addSelectables(cssSelectors: List<CssSelector>, callbackCtxt?: any) {
    var listContext = null;
    if (cssSelectors.length > 1) {
      listContext = new SelectorListContext(cssSelectors);
      ListWrapper.push(this._listContexts, listContext);
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
  private _addSelectable(cssSelector: CssSelector, callbackCtxt: any,
                         listContext: SelectorListContext) {
    var matcher = this;
    var element = cssSelector.element;
    var classNames = cssSelector.classNames;
    var attrs = cssSelector.attrs;
    var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);

    if (isPresent(element)) {
      var isTerminal = attrs.length === 0 && classNames.length === 0;
      if (isTerminal) {
        this._addTerminal(matcher._elementMap, element, selectable);
      } else {
        matcher = this._addPartial(matcher._elementPartialMap, element);
      }
    }

    if (isPresent(classNames)) {
      for (var index = 0; index < classNames.length; index++) {
        var isTerminal = attrs.length === 0 && index === classNames.length - 1;
        var className = classNames[index];
        if (isTerminal) {
          this._addTerminal(matcher._classMap, className, selectable);
        } else {
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
          var terminalValuesMap = MapWrapper.get(terminalMap, attrName);
          if (isBlank(terminalValuesMap)) {
            terminalValuesMap = MapWrapper.create();
            MapWrapper.set(terminalMap, attrName, terminalValuesMap);
          }
          this._addTerminal(terminalValuesMap, attrValue, selectable);
        } else {
          var parttialMap = matcher._attrValuePartialMap;
          var partialValuesMap = MapWrapper.get(parttialMap, attrName);
          if (isBlank(partialValuesMap)) {
            partialValuesMap = MapWrapper.create();
            MapWrapper.set(parttialMap, attrName, partialValuesMap);
          }
          matcher = this._addPartial(partialValuesMap, attrValue);
        }
      }
    }
  }

  private _addTerminal(map: Map<string, List<string>>, name: string, selectable: SelectorContext) {
    var terminalList = MapWrapper.get(map, name);
    if (isBlank(terminalList)) {
      terminalList = ListWrapper.create();
      MapWrapper.set(map, name, terminalList);
    }
    ListWrapper.push(terminalList, selectable);
  }

  private _addPartial(map: Map<string, SelectorMatcher>, name: string): SelectorMatcher {
    var matcher = MapWrapper.get(map, name);
    if (isBlank(matcher)) {
      matcher = new SelectorMatcher();
      MapWrapper.set(map, name, matcher);
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
  match(cssSelector: CssSelector, matchedCallback /*: (CssSelector, any) => void*/): boolean {
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

        var terminalValuesMap = MapWrapper.get(this._attrValueMap, attrName);
        if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
          result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE, cssSelector,
                                       matchedCallback) ||
                   result;
        }
        result = this._matchTerminal(terminalValuesMap, attrValue, cssSelector, matchedCallback) ||
                 result;

        var partialValuesMap = MapWrapper.get(this._attrValuePartialMap, attrName);
        if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
          result = this._matchPartial(partialValuesMap, _EMPTY_ATTR_VALUE, cssSelector,
                                      matchedCallback) ||
                   result;
        }
        result =
            this._matchPartial(partialValuesMap, attrValue, cssSelector, matchedCallback) || result;
      }
    }
    return result;
  }

  _matchTerminal(map: Map<string, List<string>>, name, cssSelector: CssSelector,
                 matchedCallback /*: (CssSelector, any) => void*/): boolean {
    if (isBlank(map) || isBlank(name)) {
      return false;
    }

    var selectables = MapWrapper.get(map, name);
    var starSelectables = MapWrapper.get(map, "*");
    if (isPresent(starSelectables)) {
      selectables = ListWrapper.concat(selectables, starSelectables);
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

  _matchPartial(map: Map<string, SelectorMatcher>, name, cssSelector: CssSelector,
                matchedCallback /*: (CssSelector, any) => void*/): boolean {
    if (isBlank(map) || isBlank(name)) {
      return false;
    }
    var nestedSelector = MapWrapper.get(map, name);
    if (isBlank(nestedSelector)) {
      return false;
    }
    // TODO(perf): get rid of recursion and measure again
    // TODO(perf): don't pass the whole selector into the recursion,
    // but only the not processed parts
    return nestedSelector.match(cssSelector, matchedCallback);
  }
}


class SelectorListContext {
  alreadyMatched: boolean = false;

  constructor(public selectors: List<CssSelector>) {}
}

// Store context to pass back selector and context when a selector is matched
class SelectorContext {
  notSelectors: List<CssSelector>;

  constructor(public selector: CssSelector, public cbContext: any,
              public listContext: SelectorListContext) {
    this.notSelectors = selector.notSelectors;
  }

  finalize(cssSelector: CssSelector, callback /*: (CssSelector, any) => void*/) {
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
