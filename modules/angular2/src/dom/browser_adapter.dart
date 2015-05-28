library angular.core.facade.dom;

import 'dart:html';
import 'dart:js' show JsObject;
import 'dom_adapter.dart' show setRootDomAdapter;
import 'generic_browser_adapter.dart' show GenericBrowserDomAdapter;
import '../facade/browser.dart';
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

class BrowserDomAdapter extends GenericBrowserDomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }

  // TODO(tbosch): move this into a separate environment class once we have it
  logError(error) {
    window.console.error(error);
  }

  @override
  Map<String, String> get attrToPropMap => const <String, String>{
    'innerHtml': 'innerHtml',
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
  String getInnerHTML(Element el) => el.innerHtml;
  String getOuterHTML(Element el) => el.outerHtml;
  void setInnerHTML(Element el, String value) {
    el.innerHtml = value;
  }
  String nodeName(Node el) => el.nodeName;
  String nodeValue(Node el) => el.nodeValue;
  String type(InputElement el) => el.type;
  Node content(TemplateElement el) => el.content;
  Node firstChild(el) => el.firstChild;
  Node nextSibling(Node el) => el.nextNode;
  Element parentElement(Node el) => el.parent;
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
  bool hasProperty(Element element, String name) =>
      new JsObject.fromBrowserObject(element).hasProperty(name);
  List<Node> getElementsByClassName(Element element, String name) =>
      element.getElementsByClassName(name);
  List<Node> getElementsByTagName(Element element, String name) =>
      element.querySelectorAll(name);
  List<String> classList(Element element) => element.classes.toList();
  void addClass(Element element, String classname) {
    element.classes.add(classname);
  }
  void removeClass(Element element, String classname) {
    element.classes.remove(classname);
  }
  bool hasClass(Element element, String classname) =>
      element.classes.contains(classname);

  void setStyle(Element element, String stylename, String stylevalue) {
    element.style.setProperty(stylename, stylevalue);
  }
  void removeStyle(Element element, String stylename) {
    element.style.removeProperty(stylename);
  }
  String getStyle(Element element, String stylename) {
    return element.style.getPropertyValue(stylename);
  }

  String tagName(Element element) => element.tagName;

  Map<String, String> attributeMap(Element element) {
    return new Map.from(element.attributes);
  }

  bool hasAttribute(Element element, String attribute) =>
      element.attributes.containsKey(attribute);

  String getAttribute(Element element, String attribute) =>
      element.getAttribute(attribute);

  void setAttribute(Element element, String name, String value) {
    element.setAttribute(name, value);
  }

  void removeAttribute(Element element, String name) {
    //there is no removeAttribute method as of now in Dart:
    //https://code.google.com/p/dart/issues/detail?id=19934
    element.attributes.remove(name);
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
  bool isPageRule(CssRule rule) => rule is CssPageRule;
  bool isStyleRule(CssRule rule) => rule is CssStyleRule;
  bool isMediaRule(CssRule rule) => rule is CssMediaRule;
  bool isKeyframesRule(CssRule rule) => rule is CssKeyframesRule;
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
  getBaseHref() {
    var uri = document.baseUri;
    var baseUri = Uri.parse(uri);
    return baseUri.path;
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
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(String name, value) {
    js.context[name] = value;
  }
}
