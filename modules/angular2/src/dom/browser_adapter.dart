library angular.core.facade.dom;

import 'dart:html';
import 'dart:js' show JsObject;
import 'dom_adapter.dart' show setRootDomAdapter, DomAdapter;
import '../facade/browser.dart';

// WARNING: Do not expose outside this class. Parsing HTML using this
// sanitizer is a security risk.
class _IdentitySanitizer implements NodeTreeSanitizer {
  void sanitizeTree(Node node) {}
}

final _identitySanitizer = new _IdentitySanitizer();

class BrowserDomAdapter extends DomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }

  @override
  final attrToPropMap = const {
    'inner-html': 'innerHtml',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
  };

  query(String selector) => document.querySelector(selector);

  Element querySelector(el, String selector) =>
      el.querySelector(selector);

  ElementList querySelectorAll(el, String selector) =>
      el.querySelectorAll(selector);

  void on(EventTarget element, String event, callback(arg)) {
    // due to https://code.google.com/p/dart/issues/detail?id=17406
    // addEventListener misses zones so we use element.on.
    element.on[event].listen(callback);
  }
  void dispatchEvent(EventTarget el, Event evt) {
    el.dispatchEvent(evt);
  }
  MouseEvent createMouseEvent(String eventType) =>
      new MouseEvent(eventType, canBubble: true);
  createEvent(eventType) =>
    new Event(eventType, canBubble: true);
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
  void removeChild(Element el, Node node) {
    node.remove();
  }
  Element remove(Element el) {
    return el..remove();
  }
  insertBefore(Node el, node) {
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
  String getValue(InputElement el) => el.value;
  void setValue(InputElement el, String value) {
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
  createTextNode(String text, [HtmlDocument doc = null]) {
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

  setStyle(Element element, String stylename, String stylevalue) {
      element.style.setProperty(stylename, stylevalue);
  }
  removeStyle(Element element, String stylename) {
      element.style.removeProperty(stylename);
  }
  getStyle(Element element, String stylename) {
      return element.style.getPropertyValue(stylename);
  }

  String tagName(Element element) => element.tagName;

  Map<String, String> attributeMap(Element element) =>
      element.attributes;

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

  Node templateAwareRoot(Element el) =>
      el is TemplateElement ? el.content : el;

  HtmlDocument createHtmlDocument() =>
      document.implementation.createHtmlDocument('fakeTitle');

  HtmlDocument defaultDoc() => document;
  bool elementMatches(n, String selector) =>
      n is Element && n.matches(selector);
  bool isTemplateElement(Element el) =>
      el is TemplateElement;
  bool isTextNode(Node node) =>
      node.nodeType == Node.TEXT_NODE;
  bool isCommentNode(Node node) => node.nodeType == Node.COMMENT_NODE;
  bool isElementNode(Node node) =>
      node.nodeType == Node.ELEMENT_NODE;
  bool hasShadowRoot(Node node) {
    return node is Element && node.shadowRoot != null;
  }
  Node importIntoDoc(Node node) {
    return document.importNode(node, true);
  }
  bool isPageRule(CssRule rule) => rule is CssPageRule;
  bool isStyleRule(CssRule rule) => rule is CssStyleRule;
  bool isMediaRule(CssRule rule) => rule is CssMediaRule;
  bool isKeyframesRule(CssRule rule) => rule is CssKeyframesRule;
}
