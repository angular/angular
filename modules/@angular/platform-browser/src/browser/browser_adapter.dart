library angular.core.facade.dom;

import 'dart:html';
import 'package:angular2/platform/common_dom.dart' show setRootDomAdapter;
import 'generic_browser_adapter.dart' show GenericBrowserDomAdapter;
import 'package:angular2/src/facade/browser.dart';
import 'package:angular2/src/facade/lang.dart' show isBlank, isPresent;
import 'dart:js' as js;

// WARNING: Do not expose outside this class. Parsing HTML using this
// sanitizer is a security risk.
class _IdentitySanitizer implements NodeTreeSanitizer {
  void sanitizeTree(Node node) {}
}

final _identitySanitizer = new _IdentitySanitizer();

final _keyCodeToKeyMap = const {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
  91: 'OS',
  93: 'ContextMenu',
  96: '0',
  97: '1',
  98: '2',
  99: '3',
  100: '4',
  101: '5',
  102: '6',
  103: '7',
  104: '8',
  105: '9',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock'
};

final bool _supportsTemplateElement = () {
  try {
    return new TemplateElement().content != null;
  } catch (_) {
    return false;
  }
}();

class BrowserDomAdapter extends GenericBrowserDomAdapter {
  js.JsFunction _setProperty;
  js.JsFunction _getProperty;
  js.JsFunction _hasProperty;
  Map<String, bool> _hasPropertyCache;
  BrowserDomAdapter() {
    _hasPropertyCache = new Map();
    _setProperty = js.context.callMethod(
        'eval', ['(function(el, prop, value) { el[prop] = value; })']);
    _getProperty = js.context
        .callMethod('eval', ['(function(el, prop) { return el[prop]; })']);
    _hasProperty = js.context
        .callMethod('eval', ['(function(el, prop) { return prop in el; })']);
  }
  static void makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }

  bool hasProperty(Element element, String name) {
    // Always return true as the serverside version html_adapter.dart does so.
    // TODO: change this once we have schema support.
    // Note: This nees to kept in sync with html_adapter.dart!
    return true;
  }

  void setProperty(Element element, String name, Object value) {
    var cacheKey = "${element.tagName}.${name}";
    var hasProperty = this._hasPropertyCache[cacheKey];
    if (hasProperty == null) {
      hasProperty = this._hasProperty.apply([element, name]);
      this._hasPropertyCache[cacheKey] = hasProperty;
    }
    if (hasProperty) {
      _setProperty.apply([element, name, value]);
    }
  }

  getProperty(Element element, String name) =>
      _getProperty.apply([element, name]);

  invoke(Element element, String methodName, List args) =>
      this.getProperty(element, methodName).apply(args, thisArg: element);

  // TODO(tbosch): move this into a separate environment class once we have it
  logError(error) {
    window.console.error(error);
  }

  log(error) {
    window.console.log(error);
  }

  logGroup(error) {
    window.console.group(error);
    this.logError(error);
  }

  logGroupEnd() {
    window.console.groupEnd();
  }

  @override
  Map<String, String> get attrToPropMap => const <String, String>{
        'class': 'className',
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex',
      };

  Element query(String selector) => document.querySelector(selector);

  Element querySelector(el, String selector) => el.querySelector(selector);

  ElementList querySelectorAll(el, String selector) =>
      el.querySelectorAll(selector);

  void on(EventTarget element, String event, callback(arg)) {
    // due to https://code.google.com/p/dart/issues/detail?id=17406
    // addEventListener misses zones so we use element.on.
    element.on[event].listen(callback);
  }

  Function onAndCancel(EventTarget element, String event, callback(arg)) {
    // due to https://code.google.com/p/dart/issues/detail?id=17406
    // addEventListener misses zones so we use element.on.
    var subscription = element.on[event].listen(callback);
    return subscription.cancel;
  }

  void dispatchEvent(EventTarget el, Event evt) {
    el.dispatchEvent(evt);
  }

  MouseEvent createMouseEvent(String eventType) =>
      new MouseEvent(eventType, canBubble: true);
  Event createEvent(String eventType) => new Event(eventType, canBubble: true);
  void preventDefault(Event evt) {
    evt.preventDefault();
  }

  bool isPrevented(Event evt) {
    return evt.defaultPrevented;
  }

  String getInnerHTML(Element el) => el.innerHtml;
  String getOuterHTML(Element el) => el.outerHtml;
  void setInnerHTML(Element el, String value) {
    el.innerHtml = value;
  }

  String nodeName(Node el) => el.nodeName;
  String nodeValue(Node el) => el.nodeValue;
  String type(InputElement el) => el.type;
  Node content(TemplateElement el) =>
      _supportsTemplateElement ? el.content : el;
  Node firstChild(el) => el.firstChild;
  Node nextSibling(Node el) => el.nextNode;
  Element parentElement(Node el) => el.parentNode;
  List<Node> childNodes(Node el) => el.childNodes;
  List childNodesAsList(Node el) => childNodes(el).toList();
  void clearNodes(Node el) {
    el.nodes = const [];
  }

  void appendChild(Node el, Node node) {
    el.append(node);
  }

  void removeChild(el, Node node) {
    node.remove();
  }

  void replaceChild(Node el, Node newNode, Node oldNode) {
    oldNode.replaceWith(newNode);
  }

  ChildNode remove(ChildNode el) {
    return el..remove();
  }

  void insertBefore(Node el, node) {
    el.parentNode.insertBefore(node, el);
  }

  void insertAllBefore(Node el, Iterable<Node> nodes) {
    el.parentNode.insertAllBefore(nodes, el);
  }

  void insertAfter(Node el, Node node) {
    el.parentNode.insertBefore(node, el.nextNode);
  }

  String getText(Node el) => el.text;
  void setText(Node el, String value) {
    el.text = value;
  }

  String getValue(el) => el.value;
  void setValue(el, String value) {
    el.value = value;
  }

  bool getChecked(InputElement el) => el.checked;
  void setChecked(InputElement el, bool isChecked) {
    el.checked = isChecked;
  }

  Comment createComment(String text) {
    return new Comment(text);
  }

  TemplateElement createTemplate(String html) {
    var t = new TemplateElement();
    // We do not sanitize because templates are part of the application code
    // not user code.
    t.setInnerHtml(html, treeSanitizer: _identitySanitizer);
    return t;
  }

  Element createElement(String tagName, [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    return doc.createElement(tagName);
  }

  Element createElementNS(String ns, String tagName, [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    return doc.createElementNS(ns, tagName);
  }

  Text createTextNode(String text, [HtmlDocument doc = null]) {
    return new Text(text);
  }

  createScriptTag(String attrName, String attrValue,
      [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    var el = doc.createElement('SCRIPT');
    el.setAttribute(attrName, attrValue);
    return el;
  }

  StyleElement createStyleElement(String css, [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    var el = doc.createElement('STYLE');
    el.text = css;
    return el;
  }

  ShadowRoot createShadowRoot(Element el) => el.createShadowRoot();
  ShadowRoot getShadowRoot(Element el) => el.shadowRoot;
  Element getHost(Element el) => (el as ShadowRoot).host;
  clone(Node node) => node.clone(true);
  List<Node> getElementsByClassName(Element element, String name) =>
      element.getElementsByClassName(name);
  List<Node> getElementsByTagName(Element element, String name) =>
      element.querySelectorAll(name);
  List<String> classList(Element element) => element.classes.toList();
  void addClass(Element element, String className) {
    element.classes.add(className);
  }

  void removeClass(Element element, String className) {
    element.classes.remove(className);
  }

  bool hasClass(Element element, String className) =>
      element.classes.contains(className);

  void setStyle(Element element, String styleName, String styleValue) {
    element.style.setProperty(styleName, styleValue);
  }

  bool hasStyle(Element element, String styleName, [String styleValue]) {
    var value = this.getStyle(element, styleName);
    return isPresent(styleValue) ? value == styleValue : value.length > 0;
  }

  void removeStyle(Element element, String styleName) {
    element.style.removeProperty(styleName);
  }

  String getStyle(Element element, String styleName) {
    return element.style.getPropertyValue(styleName);
  }

  String tagName(Element element) => element.tagName;

  Map<String, String> attributeMap(Element element) {
    var result = {};
    result.addAll(element.attributes);
    // TODO(tbosch): element.getNamespacedAttributes() somehow does not return the attribute value
    var xlinkHref = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (xlinkHref != null) {
      result['xlink:href'] = xlinkHref;
    }
    return result;
  }

  bool hasAttribute(Element element, String attribute) =>
      element.attributes.containsKey(attribute);

  bool hasAttributeNS(Element element, String ns, String attribute) =>
      element.getAttributeNS(ns, attribute) != null;

  String getAttribute(Element element, String attribute) =>
      element.getAttribute(attribute);

  String getAttributeNS(Element element, String ns, String attribute) =>
      element.getAttributeNS(ns, attribute);

  void setAttribute(Element element, String name, String value) {
    element.setAttribute(name, value);
  }

  void setAttributeNS(Element element, String ns, String name, String value) {
    element.setAttributeNS(ns, name, value);
  }

  void removeAttribute(Element element, String name) {
    //there is no removeAttribute method as of now in Dart:
    //https://code.google.com/p/dart/issues/detail?id=19934
    element.attributes.remove(name);
  }

  void removeAttributeNS(Element element, String ns, String name) {
    element.getNamespacedAttributes(ns).remove(name);
  }

  Node templateAwareRoot(Element el) => el is TemplateElement ? el.content : el;

  HtmlDocument createHtmlDocument() =>
      document.implementation.createHtmlDocument('fakeTitle');

  HtmlDocument defaultDoc() => document;
  Rectangle getBoundingClientRect(el) => el.getBoundingClientRect();
  String getTitle() => document.title;
  void setTitle(String newTitle) {
    document.title = newTitle;
  }

  bool elementMatches(n, String selector) =>
      n is Element && n.matches(selector);
  bool isTemplateElement(Element el) => el is TemplateElement;
  bool isTextNode(Node node) => node.nodeType == Node.TEXT_NODE;
  bool isCommentNode(Node node) => node.nodeType == Node.COMMENT_NODE;
  bool isElementNode(Node node) => node.nodeType == Node.ELEMENT_NODE;
  bool hasShadowRoot(Node node) {
    return node is Element && node.shadowRoot != null;
  }

  bool isShadowRoot(Node node) {
    return node is ShadowRoot;
  }

  Node importIntoDoc(Node node) {
    return document.importNode(node, true);
  }

  Node adoptNode(Node node) {
    return document.adoptNode(node);
  }

  String getHref(AnchorElement element) {
    return element.href;
  }

  String getEventKey(KeyboardEvent event) {
    int keyCode = event.keyCode;
    return _keyCodeToKeyMap.containsKey(keyCode)
        ? _keyCodeToKeyMap[keyCode]
        : 'Unidentified';
  }

  getGlobalEventTarget(String target) {
    if (target == "window") {
      return window;
    } else if (target == "document") {
      return document;
    } else if (target == "body") {
      return document.body;
    }
  }

  getHistory() {
    return window.history;
  }

  getLocation() {
    return window.location;
  }

  String getBaseHref() {
    var href = getBaseElementHref();
    if (href == null) {
      return null;
    }
    return _relativePath(href);
  }

  resetBaseElement() {
    baseElement = null;
  }

  String getUserAgent() {
    return window.navigator.userAgent;
  }

  void setData(Element element, String name, String value) {
    element.dataset[name] = value;
  }

  String getData(Element element, String name) {
    return element.dataset[name];
  }

  getComputedStyle(elem) => elem.getComputedStyle();

  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(String path, value) {
    var parts = path.split('.');
    var obj = js.context;
    while (parts.length > 1) {
      var name = parts.removeAt(0);
      if (obj.hasProperty(name)) {
        obj = obj[name];
      } else {
        obj = obj[name] = new js.JsObject(js.context['Object']);
      }
    }
    obj[parts.removeAt(0)] = value;
  }

  requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback);
  }

  cancelAnimationFrame(id) {
    window.cancelAnimationFrame(id);
  }

  num performanceNow() {
    return window.performance.now();
  }

  parse(s) {
    throw 'not implemented';
  }
}

var baseElement = null;
String getBaseElementHref() {
  if (baseElement == null) {
    baseElement = document.querySelector('base');
    if (baseElement == null) {
      return null;
    }
  }
  return baseElement.getAttribute('href');
}

// based on urlUtils.js in AngularJS 1
AnchorElement _urlParsingNode = null;
String _relativePath(String url) {
  if (_urlParsingNode == null) {
    _urlParsingNode = new AnchorElement();
  }
  _urlParsingNode.href = url;
  var pathname = _urlParsingNode.pathname;
  return (pathname[0] == '/') ? pathname : '/${pathname}';
}
