library angular2.src.testing.utils;

import "package:angular2/core.dart" show Injectable;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isString, RegExpWrapper, StringWrapper, RegExp;

@Injectable()
class Log {
  /** @internal */
  List<dynamic> _result;
  Log() {
    this._result = [];
  }
  void add(value) {
    this._result.add(value);
  }

  fn(value) {
    return ([a1 = null, a2 = null, a3 = null, a4 = null, a5 = null]) {
      this._result.add(value);
    };
  }

  void clear() {
    this._result = [];
  }

  String result() {
    return this._result.join("; ");
  }
}

class BrowserDetection {
  String _ua;
  BrowserDetection(String ua) {
    if (isPresent(ua)) {
      this._ua = ua;
    } else {
      this._ua = isPresent(DOM) ? DOM.getUserAgent() : "";
    }
  }
  bool get isFirefox {
    return this._ua.indexOf("Firefox") > -1;
  }

  bool get isAndroid {
    return this._ua.indexOf("Mozilla/5.0") > -1 &&
        this._ua.indexOf("Android") > -1 &&
        this._ua.indexOf("AppleWebKit") > -1 &&
        this._ua.indexOf("Chrome") == -1;
  }

  bool get isEdge {
    return this._ua.indexOf("Edge") > -1;
  }

  bool get isIE {
    return this._ua.indexOf("Trident") > -1;
  }

  bool get isWebkit {
    return this._ua.indexOf("AppleWebKit") > -1 &&
        this._ua.indexOf("Edge") == -1;
  }

  bool get isIOS7 {
    return this._ua.indexOf("iPhone OS 7") > -1 ||
        this._ua.indexOf("iPad OS 7") > -1;
  }

  bool get isSlow {
    return this.isAndroid || this.isIE || this.isIOS7;
  }
  // The Intl API is only properly supported in recent Chrome and Opera.

  // Note: Edge is disguised as Chrome 42, so checking the "Edge" part is needed,

  // see https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
  bool get supportsIntlApi {
    return this._ua.indexOf("Chrome/4") > -1 && this._ua.indexOf("Edge") == -1;
  }
}

BrowserDetection browserDetection = new BrowserDetection(null);
void dispatchEvent(element, eventType) {
  DOM.dispatchEvent(element, DOM.createEvent(eventType));
}

dynamic el(String html) {
  return (DOM.firstChild(DOM.content(DOM.createTemplate(html))) as dynamic);
}

var _RE_SPECIAL_CHARS = [
  "-",
  "[",
  "]",
  "/",
  "{",
  "}",
  "\\",
  "(",
  ")",
  "*",
  "+",
  "?",
  ".",
  "^",
  "\$",
  "|"
];
var _ESCAPE_RE =
    RegExpWrapper.create('''[\\${ _RE_SPECIAL_CHARS . join ( "\\" )}]''');
RegExp containsRegexp(String input) {
  return RegExpWrapper.create(StringWrapper.replaceAllMapped(
      input, _ESCAPE_RE, (match) => '''\\${ match [ 0 ]}'''));
}

String normalizeCSS(String css) {
  css = StringWrapper.replaceAll(css, new RegExp(r'\s+'), " ");
  css = StringWrapper.replaceAll(css, new RegExp(r':\s'), ":");
  css = StringWrapper.replaceAll(css, new RegExp(r'' + "'" + r''), "\"");
  css = StringWrapper.replaceAll(css, new RegExp(r' }'), "}");
  css = StringWrapper.replaceAllMapped(
      css,
      new RegExp(r'url\((\"|\s)(.+)(\"|\s)\)(\s*)'),
      (match) => '''url("${ match [ 2 ]}")''');
  css = StringWrapper.replaceAllMapped(css, new RegExp(r'\[(.+)=([^"\]]+)\]'),
      (match) => '''[${ match [ 1 ]}="${ match [ 2 ]}"]''');
  return css;
}

var _singleTagWhitelist = ["br", "hr", "input"];
String stringifyElement(el) {
  var result = "";
  if (DOM.isElementNode(el)) {
    var tagName = DOM.tagName(el).toLowerCase();
    // Opening tag
    result += '''<${ tagName}''';
    // Attributes in an ordered way
    var attributeMap = DOM.attributeMap(el);
    var keys = [];
    attributeMap.forEach((k, v) => keys.add(k));
    ListWrapper.sort(keys);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var attValue = attributeMap[key];
      if (!isString(attValue)) {
        result += ''' ${ key}''';
      } else {
        result += ''' ${ key}="${ attValue}"''';
      }
    }
    result += ">";
    // Children
    var childrenRoot = DOM.templateAwareRoot(el);
    var children = isPresent(childrenRoot) ? DOM.childNodes(childrenRoot) : [];
    for (var j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }
    // Closing tag
    if (!ListWrapper.contains(_singleTagWhitelist, tagName)) {
      result += '''</${ tagName}>''';
    }
  } else if (DOM.isCommentNode(el)) {
    result += '''<!--${ DOM . nodeValue ( el )}-->''';
  } else {
    result += DOM.getText(el);
  }
  return result;
}
