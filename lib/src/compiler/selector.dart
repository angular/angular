library angular2.src.compiler.selector;

import "package:angular2/src/facade/collection.dart"
    show Map, ListWrapper, MapWrapper;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, RegExpWrapper, RegExpMatcherWrapper, StringWrapper;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;

const _EMPTY_ATTR_VALUE = "";
// TODO: Can't use `const` here as

// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP = RegExpWrapper.create("(\\:not\\()|" +
    "([-\\w]+)|" +
    "(?:\\.([-\\w]+))|" +
    "(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|" +
    "(\\))|" +
    "(\\s*,\\s*)");

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
class CssSelector {
  String element = null;
  List<String> classNames = [];
  List<String> attrs = [];
  List<CssSelector> notSelectors = [];
  static List<CssSelector> parse(String selector) {
    List<CssSelector> results = [];
    var _addResult = (List<CssSelector> res, cssSel) {
      if (cssSel.notSelectors.length > 0 &&
          isBlank(cssSel.element) &&
          ListWrapper.isEmpty(cssSel.classNames) &&
          ListWrapper.isEmpty(cssSel.attrs)) {
        cssSel.element = "*";
      }
      res.add(cssSel);
    };
    var cssSelector = new CssSelector();
    var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
    var match;
    var current = cssSelector;
    var inNot = false;
    while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
      if (isPresent(match[1])) {
        if (inNot) {
          throw new BaseException("Nesting :not is not allowed in a selector");
        }
        inNot = true;
        current = new CssSelector();
        cssSelector.notSelectors.add(current);
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
          throw new BaseException(
              "Multiple selectors in :not are not supported");
        }
        _addResult(results, cssSelector);
        cssSelector = current = new CssSelector();
      }
    }
    _addResult(results, cssSelector);
    return results;
  }

  bool isElementSelector() {
    return isPresent(this.element) &&
        ListWrapper.isEmpty(this.classNames) &&
        ListWrapper.isEmpty(this.attrs) &&
        identical(this.notSelectors.length, 0);
  }

  setElement([String element = null]) {
    if (isPresent(element)) {
      element = element.toLowerCase();
    }
    this.element = element;
  }

  /** Gets a template string for an element that matches the selector. */
  String getMatchingElementTemplate() {
    var tagName = isPresent(this.element) ? this.element : "div";
    var classAttr = this.classNames.length > 0
        ? ''' class="${ this . classNames . join ( " " )}"'''
        : "";
    var attrs = "";
    for (var i = 0; i < this.attrs.length; i += 2) {
      var attrName = this.attrs[i];
      var attrValue = !identical(this.attrs[i + 1], "")
          ? '''="${ this . attrs [ i + 1 ]}"'''
          : "";
      attrs += ''' ${ attrName}${ attrValue}''';
    }
    return '''<${ tagName}${ classAttr}${ attrs}></${ tagName}>''';
  }

  addAttribute(String name, [String value = _EMPTY_ATTR_VALUE]) {
    this.attrs.add(name.toLowerCase());
    if (isPresent(value)) {
      value = value.toLowerCase();
    } else {
      value = _EMPTY_ATTR_VALUE;
    }
    this.attrs.add(value);
  }

  addClassName(String name) {
    this.classNames.add(name.toLowerCase());
  }

  String toString() {
    var res = "";
    if (isPresent(this.element)) {
      res += this.element;
    }
    if (isPresent(this.classNames)) {
      for (var i = 0; i < this.classNames.length; i++) {
        res += "." + this.classNames[i];
      }
    }
    if (isPresent(this.attrs)) {
      for (var i = 0; i < this.attrs.length;) {
        var attrName = this.attrs[i++];
        var attrValue = this.attrs[i++];
        res += "[" + attrName;
        if (attrValue.length > 0) {
          res += "=" + attrValue;
        }
        res += "]";
      }
    }
    this
        .notSelectors
        .forEach((notSelector) => res += ''':not(${ notSelector})''');
    return res;
  }
}

/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
class SelectorMatcher {
  static SelectorMatcher createNotMatcher(List<CssSelector> notSelectors) {
    var notMatcher = new SelectorMatcher();
    notMatcher.addSelectables(notSelectors, null);
    return notMatcher;
  }

  var _elementMap = new Map<String, List<SelectorContext>>();
  var _elementPartialMap = new Map<String, SelectorMatcher>();
  var _classMap = new Map<String, List<SelectorContext>>();
  var _classPartialMap = new Map<String, SelectorMatcher>();
  var _attrValueMap = new Map<String, Map<String, List<SelectorContext>>>();
  var _attrValuePartialMap = new Map<String, Map<String, SelectorMatcher>>();
  List<SelectorListContext> _listContexts = [];
  addSelectables(List<CssSelector> cssSelectors, [dynamic callbackCtxt]) {
    var listContext = null;
    if (cssSelectors.length > 1) {
      listContext = new SelectorListContext(cssSelectors);
      this._listContexts.add(listContext);
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
  _addSelectable(CssSelector cssSelector, dynamic callbackCtxt,
      SelectorListContext listContext) {
    SelectorMatcher matcher = this;
    var element = cssSelector.element;
    var classNames = cssSelector.classNames;
    var attrs = cssSelector.attrs;
    var selectable =
        new SelectorContext(cssSelector, callbackCtxt, listContext);
    if (isPresent(element)) {
      var isTerminal =
          identical(attrs.length, 0) && identical(classNames.length, 0);
      if (isTerminal) {
        this._addTerminal(matcher._elementMap, element, selectable);
      } else {
        matcher = this._addPartial(matcher._elementPartialMap, element);
      }
    }
    if (isPresent(classNames)) {
      for (var index = 0; index < classNames.length; index++) {
        var isTerminal = identical(attrs.length, 0) &&
            identical(index, classNames.length - 1);
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
        var isTerminal = identical(index, attrs.length - 2);
        var attrName = attrs[index++];
        var attrValue = attrs[index++];
        if (isTerminal) {
          var terminalMap = matcher._attrValueMap;
          var terminalValuesMap = terminalMap[attrName];
          if (isBlank(terminalValuesMap)) {
            terminalValuesMap = new Map<String, List<SelectorContext>>();
            terminalMap[attrName] = terminalValuesMap;
          }
          this._addTerminal(terminalValuesMap, attrValue, selectable);
        } else {
          var parttialMap = matcher._attrValuePartialMap;
          var partialValuesMap = parttialMap[attrName];
          if (isBlank(partialValuesMap)) {
            partialValuesMap = new Map<String, SelectorMatcher>();
            parttialMap[attrName] = partialValuesMap;
          }
          matcher = this._addPartial(partialValuesMap, attrValue);
        }
      }
    }
  }

  _addTerminal(Map<String, List<SelectorContext>> map, String name,
      SelectorContext selectable) {
    var terminalList = map[name];
    if (isBlank(terminalList)) {
      terminalList = [];
      map[name] = terminalList;
    }
    terminalList.add(selectable);
  }

  SelectorMatcher _addPartial(Map<String, SelectorMatcher> map, String name) {
    var matcher = map[name];
    if (isBlank(matcher)) {
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
  bool match(CssSelector cssSelector,
      dynamic /* (c: CssSelector, a: any) => void */ matchedCallback) {
    var result = false;
    var element = cssSelector.element;
    var classNames = cssSelector.classNames;
    var attrs = cssSelector.attrs;
    for (var i = 0; i < this._listContexts.length; i++) {
      this._listContexts[i].alreadyMatched = false;
    }
    result = this._matchTerminal(
            this._elementMap, element, cssSelector, matchedCallback) ||
        result;
    result = this._matchPartial(
            this._elementPartialMap, element, cssSelector, matchedCallback) ||
        result;
    if (isPresent(classNames)) {
      for (var index = 0; index < classNames.length; index++) {
        var className = classNames[index];
        result = this._matchTerminal(
                this._classMap, className, cssSelector, matchedCallback) ||
            result;
        result = this._matchPartial(this._classPartialMap, className,
                cssSelector, matchedCallback) ||
            result;
      }
    }
    if (isPresent(attrs)) {
      for (var index = 0; index < attrs.length;) {
        var attrName = attrs[index++];
        var attrValue = attrs[index++];
        var terminalValuesMap = this._attrValueMap[attrName];
        if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
          result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE,
                  cssSelector, matchedCallback) ||
              result;
        }
        result = this._matchTerminal(
                terminalValuesMap, attrValue, cssSelector, matchedCallback) ||
            result;
        var partialValuesMap = this._attrValuePartialMap[attrName];
        if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
          result = this._matchPartial(partialValuesMap, _EMPTY_ATTR_VALUE,
                  cssSelector, matchedCallback) ||
              result;
        }
        result = this._matchPartial(
                partialValuesMap, attrValue, cssSelector, matchedCallback) ||
            result;
      }
    }
    return result;
  }

  /** @internal */
  bool _matchTerminal(
      Map<String, List<SelectorContext>> map,
      name,
      CssSelector cssSelector,
      dynamic /* (c: CssSelector, a: any) => void */ matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return false;
    }
    var selectables = map[name];
    var starSelectables = map["*"];
    if (isPresent(starSelectables)) {
      selectables = (new List.from(selectables)..addAll(starSelectables));
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
  bool _matchPartial(Map<String, SelectorMatcher> map, name,
      CssSelector cssSelector, matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return false;
    }
    var nestedSelector = map[name];
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
  List<CssSelector> selectors;
  bool alreadyMatched = false;
  SelectorListContext(this.selectors) {}
}

// Store context to pass back selector and context when a selector is matched
class SelectorContext {
  CssSelector selector;
  dynamic cbContext;
  SelectorListContext listContext;
  List<CssSelector> notSelectors;
  SelectorContext(this.selector, this.cbContext, this.listContext) {
    this.notSelectors = selector.notSelectors;
  }
  bool finalize(CssSelector cssSelector,
      dynamic /* (c: CssSelector, a: any) => void */ callback) {
    var result = true;
    if (this.notSelectors.length > 0 &&
        (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
      var notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
      result = !notMatcher.match(cssSelector, null);
    }
    if (result &&
        isPresent(callback) &&
        (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
      if (isPresent(this.listContext)) {
        this.listContext.alreadyMatched = true;
      }
      callback(this.selector, this.cbContext);
    }
    return result;
  }
}
