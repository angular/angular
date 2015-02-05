import {List, Map, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, RegExpWrapper, RegExpMatcherWrapper, StringWrapper} from 'angular2/src/facade/lang';

const _EMPTY_ATTR_VALUE = '';

// TODO: Can't use `const` here as
// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP =
    RegExpWrapper.create('^([-\\w]+)|' +    // "tag"
    '(?:\\.([-\\w]+))|' +                   // ".class"
    '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])'); // "[name]", "[name=value]" or "[name*=value]"

/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export class CssSelector {
  element:string;
  classNames:List;
  attrs:List;
  static parse(selector:string):CssSelector {
    var cssSelector = new CssSelector();
    var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
    var match;
    while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
      if (isPresent(match[1])) {
        cssSelector.setElement(match[1]);
      }
      if (isPresent(match[2])) {
        cssSelector.addClassName(match[2]);
      }
      if (isPresent(match[3])) {
        cssSelector.addAttribute(match[3], match[4]);
      }
    }
    return cssSelector;
  }

  constructor() {
    this.element = null;
    this.classNames = ListWrapper.create();
    this.attrs = ListWrapper.create();
  }

  setElement(element:string = null) {
    if (isPresent(element)) {
      element = element.toLowerCase();
    }
    this.element = element;
  }

  addAttribute(name:string, value:string = _EMPTY_ATTR_VALUE) {
    ListWrapper.push(this.attrs, name.toLowerCase());
    if (isPresent(value)) {
      value = value.toLowerCase();
    } else {
      value = _EMPTY_ATTR_VALUE;
    }
    ListWrapper.push(this.attrs, value);
  }

  addClassName(name:string) {
    ListWrapper.push(this.classNames, name.toLowerCase());
  }

  toString():string {
    var res = '';
    if (isPresent(this.element)) {
      res += this.element;
    }
    if (isPresent(this.classNames)) {
      for (var i=0; i<this.classNames.length; i++) {
        res += '.' + this.classNames[i];
      }
    }
    if (isPresent(this.attrs)) {
      for (var i=0; i<this.attrs.length;) {
        var attrName = this.attrs[i++];
        var attrValue = this.attrs[i++]
        res += '[' + attrName;
        if (attrValue.length > 0) {
          res += '=' + attrValue;
        }
        res += ']';
      }
    }
    return res;
  }
}

/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export class SelectorMatcher {
  _elementMap:Map;
  _elementPartialMap:Map;
  _classMap:Map;
  _classPartialMap:Map;
  _attrValueMap:Map;
  _attrValuePartialMap:Map;
  constructor() {
    this._elementMap = MapWrapper.create();
    this._elementPartialMap = MapWrapper.create();

    this._classMap = MapWrapper.create();
    this._classPartialMap = MapWrapper.create();

    this._attrValueMap = MapWrapper.create();
    this._attrValuePartialMap = MapWrapper.create();
  }

  /**
   * Add an object that can be found later on by calling `match`.
   * @param cssSelector A css selector
   * @param selectable An opaque object that will be given to the callback of the `match` function
   */
  addSelectable(cssSelector:CssSelector, selectable) {
    var matcher = this;
    var element = cssSelector.element;
    var classNames = cssSelector.classNames;
    var attrs = cssSelector.attrs;

    if (isPresent(element)) {
      var isTerminal = attrs.length === 0 && classNames.length === 0;
      if (isTerminal) {
        this._addTerminal(matcher._elementMap, element, selectable);
      } else {
        matcher = this._addPartial(matcher._elementPartialMap, element);
      }
    }

    if (isPresent(classNames)) {
      for (var index = 0; index<classNames.length; index++) {
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
      for (var index = 0; index<attrs.length; ) {
        var isTerminal = index === attrs.length - 2;
        var attrName = attrs[index++];
        var attrValue = attrs[index++];
        var map = isTerminal ? matcher._attrValueMap : matcher._attrValuePartialMap;
        var valuesMap = MapWrapper.get(map, attrName)
        if (isBlank(valuesMap)) {
          valuesMap = MapWrapper.create();
          MapWrapper.set(map, attrName, valuesMap);
        }
        if (isTerminal) {
          this._addTerminal(valuesMap, attrValue, selectable);
        } else {
          matcher = this._addPartial(valuesMap, attrValue);
        }
      }
    }
  }

  _addTerminal(map:Map<string,string>, name:string, selectable) {
    var terminalList = MapWrapper.get(map, name)
    if (isBlank(terminalList)) {
      terminalList = ListWrapper.create();
      MapWrapper.set(map, name, terminalList);
    }
    ListWrapper.push(terminalList, selectable);
  }

  _addPartial(map:Map<string,string>, name:string) {
    var matcher = MapWrapper.get(map, name)
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
  */
  match(cssSelector:CssSelector, matchedCallback:Function) {
    var element = cssSelector.element;
    var classNames = cssSelector.classNames;
    var attrs = cssSelector.attrs;

    this._matchTerminal(this._elementMap, element, matchedCallback);
    this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback);

    if (isPresent(classNames)) {
      for (var index = 0; index<classNames.length; index++) {
        var className = classNames[index];
        this._matchTerminal(this._classMap, className, matchedCallback);
        this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback);
      }
    }

    if (isPresent(attrs)) {
      for (var index = 0; index<attrs.length;) {
        var attrName = attrs[index++];
        var attrValue = attrs[index++];

        var valuesMap = MapWrapper.get(this._attrValueMap, attrName);
        if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
          this._matchTerminal(valuesMap, _EMPTY_ATTR_VALUE, matchedCallback);
        }
        this._matchTerminal(valuesMap, attrValue, matchedCallback);

        valuesMap = MapWrapper.get(this._attrValuePartialMap, attrName)
        this._matchPartial(valuesMap, attrValue, cssSelector, matchedCallback);
      }
    }
  }

  _matchTerminal(map:Map<string,string> = null, name, matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return;
    }
    var selectables = MapWrapper.get(map, name)
    if (isBlank(selectables)) {
      return;
    }
    for (var index=0; index<selectables.length; index++) {
      matchedCallback(selectables[index]);
    }
  }

  _matchPartial(map:Map<string,string> = null, name, cssSelector, matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return;
    }
    var nestedSelector = MapWrapper.get(map, name)
    if (isBlank(nestedSelector)) {
      return;
    }
    // TODO(perf): get rid of recursion and measure again
    // TODO(perf): don't pass the whole selector into the recursion,
    // but only the not processed parts
    nestedSelector.match(cssSelector, matchedCallback);
  }
}
