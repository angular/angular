import {List, ListWrapper, StringMapWrapper} from 'facade/collection';
import {RegExpWrapper, RegExpMatcherWrapper, CONST, isPresent, isBlank} from 'facade/lang';

const _EMPTY_ATTR_VALUE = '';

export class SelectorMatcher {
  /* TODO: Add these fields when the transpiler supports fields
  _elementMap:Map<String, List>;
  _elementPartialMap:Map<String, Selector>;

  _classMap:Map<String, List>;
  _classPartialMap:Map<String, Selector>;

  _attrValueMap:Map<String, Map<String, List>>;
  _attrValuePartialMap:Map<String, Map<String, Selector>>;
  */
  constructor() {
    this._selectables = ListWrapper.create();

    this._elementMap = StringMapWrapper.create();
    this._elementPartialMap = StringMapWrapper.create();

    this._classMap = StringMapWrapper.create();
    this._classPartialMap = StringMapWrapper.create();

    this._attrValueMap = StringMapWrapper.create();
    this._attrValuePartialMap = StringMapWrapper.create();
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
      for (var index = 0; index<attrs.length; index++) {
        var isTerminal = index === attrs.length - 1;
        var attr = attrs[index];
        var attrName = attr.name;
        var attrValue = isPresent(attr.value) ? attr.value : _EMPTY_ATTR_VALUE;
        var map = isTerminal ? matcher._attrValueMap : matcher._attrValuePartialMap;
        var valuesMap = StringMapWrapper.get(map, attrName)
        if (isBlank(valuesMap)) {
          valuesMap = StringMapWrapper.create();
          StringMapWrapper.set(map, attrName, valuesMap);
        }
        if (isTerminal) {
          this._addTerminal(valuesMap, attrValue, selectable);
        } else {
          matcher = this._addPartial(valuesMap, attrValue);
        }
      }
    }
  }
  // TODO: map:StringMap when we have a StringMap type...
  _addTerminal(map, name:string, selectable) {
    var terminalList = StringMapWrapper.get(map, name)
    if (isBlank(terminalList)) {
      terminalList = ListWrapper.create();
      StringMapWrapper.set(map, name, terminalList);
    }
    ListWrapper.push(terminalList, selectable);
  }
  // TODO: map:StringMap when we have a StringMap type...
  _addPartial(map, name:string) {
    var matcher = StringMapWrapper.get(map, name)
    if (isBlank(matcher)) {
      matcher = new SelectorMatcher();
      StringMapWrapper.set(map, name, matcher);
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
      for (var index = 0; index<attrs.length; index++) {
        var attr = attrs[index];
        var attrName = attr.name;
        var attrValue = isPresent(attr.value) ? attr.value : _EMPTY_ATTR_VALUE;

        var valuesMap = StringMapWrapper.get(this._attrValueMap, attrName)
        this._matchTerminal(valuesMap, attrValue, matchedCallback);

        valuesMap = StringMapWrapper.get(this._attrValuePartialMap, attrName)
        this._matchPartial(valuesMap, attrValue, cssSelector, matchedCallback);
      }
    }
  }
  // TODO: map:StringMap when we have a StringMap type...
  _matchTerminal(map, name, matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return;
    }
    var selectables = StringMapWrapper.get(map, name)
    if (isBlank(selectables)) {
      return;
    }
    for (var index=0; index<selectables.length; index++) {
      matchedCallback(selectables[index]);
    }
  }
  // TODO: map:StringMap when we have a StringMap type...
  _matchPartial(map, name, cssSelector, matchedCallback) {
    if (isBlank(map) || isBlank(name)) {
      return;
    }
    var nestedSelector = StringMapWrapper.get(map, name)
    if (isBlank(nestedSelector)) {
      return;
    }
    // TODO(perf): get rid of recursion and measure again
    // TODO(perf): don't pass the whole selector into the recursion,
    // but only the not processed parts
    nestedSelector.match(cssSelector, matchedCallback);
  }
}

export class Attr {
  @CONST()
  constructor(name:string, value:string = null) {
    this.name = name;
    this.value = value;
  }
}

// TODO: Can't use `const` here as
// in Dart this is not transpiled into `final` yet...
var _SELECTOR_REGEXP =
    RegExpWrapper.create('^([-\\w]+)|' +    // "tag"
    '(?:\\.([-\\w]+))|' +                   // ".class"
    '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])'); // "[name]", "[name=value]" or "[name*=value]"

export class CssSelector {
  static parse(selector:string):CssSelector {
    var element = null;
    var classNames = ListWrapper.create();
    var attrs = ListWrapper.create();
    selector = selector.toLowerCase();
    var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
    var match;
    while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
      if (isPresent(match[1])) {
        element = match[1];
      }
      if (isPresent(match[2])) {
        ListWrapper.push(classNames, match[2]);
      }
      if (isPresent(match[3])) {
        ListWrapper.push(attrs, new Attr(match[3], match[4]));
      }
    }
    return new CssSelector(element, classNames, attrs);
  }
  // TODO: do a toLowerCase() for all arguments
  @CONST()
  constructor(element:string, classNames:List<string>, attrs:List<Attr>) {
    this.element = element;
    this.classNames = classNames;
    this.attrs = attrs;
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
      for (var i=0; i<this.attrs.length; i++) {
        var attr = this.attrs[i];
        res += '[' + attr.name;
        if (isPresent(attr.value)) {
          res += '=' + attr.value;
        }
        res += ']';
      }
    }
    return res;
  }
}