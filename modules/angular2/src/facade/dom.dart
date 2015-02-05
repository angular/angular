library angular.core.facade.dom;

import 'dart:html';
import 'dart:js' show JsObject, context;

export 'dart:html' show DocumentFragment, Node, Element, TemplateElement, Text, document, location, window;

// TODO(tbosch): Is there a builtin one? Why is Dart
// removing unknown elements by default?
class IdentitySanitizer implements NodeTreeSanitizer {
  void sanitizeTree(Node node) {}
}

final _window = context['window'];
final _gc = context['gc'];

void gc() {
  if (_gc != null) {
    _gc.apply(const []);
  }
}

final identitySanitizer = new IdentitySanitizer();

class DOM {
  static query(String selector) => document.querySelector(selector);

  static Element querySelector(el, String selector) =>
      el.querySelector(selector);

  static ElementList querySelectorAll(el, String selector) =>
      el.querySelectorAll(selector);

  static void on(EventTarget element, String event, callback(arg)) {
    // due to https://code.google.com/p/dart/issues/detail?id=17406
    // addEventListener misses zones so we use element.on.
    element.on[event].listen(callback);
  }
  static void dispatchEvent(EventTarget el, Event evt) {
    el.dispatchEvent(evt);
  }
  static MouseEvent createMouseEvent(String eventType) =>
      new MouseEvent(eventType, canBubble: true);
  static createEvent(eventType) =>
    new Event(eventType, canBubble: true);
  static String getInnerHTML(Element el) => el.innerHtml;
  static String getOuterHTML(Element el) => el.outerHtml;
  static void setInnerHTML(Element el, String value) {
    el.innerHtml = value;
  }
  static Node firstChild(el) => el.firstChild;
  static Node nextSibling(Node el) => el.nextNode;
  static Element parentElement(Node el) => el.parent;
  static List<Node> childNodes(Node el) => el.childNodes;
  static List childNodesAsList(Node el) => childNodes(el).toList();
  static void clearNodes(Node el) {
    el.nodes = const [];
  }
  static void appendChild(Node el, Node node) {
    el.append(node);
  }
  static void removeChild(Element el, Node node) {
    node.remove();
  }
  static void insertBefore(Node el, Node node) {
    el.parentNode.insertBefore(node, el);
  }
  static void insertAllBefore(Node el, Iterable<Node> nodes) {
    el.parentNode.insertAllBefore(nodes, el);
  }
  static void insertAfter(Node el, Node node) {
    el.parentNode.insertBefore(node, el.nextNode);
  }
  static String getText(Node el) => el.text;
  static void setText(Text text, String value) {
    text.text = value;
  }
  static TemplateElement createTemplate(String html) {
    var t = new TemplateElement();
    t.setInnerHtml(html, treeSanitizer: identitySanitizer);
    return t;
  }
  static Element createElement(String tagName, [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    return doc.createElement(tagName);
  }
  static createScriptTag(String attrName, String attrValue,
      [HtmlDocument doc = null]) {
    if (doc == null) doc = document;
    var el = doc.createElement("SCRIPT");
    el.setAttribute(attrName, attrValue);
    return el;
  }
  static clone(Node node) => node.clone(true);
  static bool hasProperty(Element element, String name) =>
      new JsObject.fromBrowserObject(element).hasProperty(name);
  static List<Node> getElementsByClassName(Element element, String name) =>
      element.getElementsByClassName(name);
  static List<Node> getElementsByTagName(Element element, String name) =>
      element.querySelectorAll(name);
  static List<String> classList(Element element) => element.classes.toList();
  static void addClass(Element element, String classname) {
    element.classes.add(classname);
  }
  static void removeClass(Element element, String classname) {
      element.classes.remove(classname);
  }
  static bool hasClass(Element element, String classname) =>
      element.classes.contains(classname);

  static String tagName(Element element) => element.tagName;

  static Map<String, String> attributeMap(Element element) =>
      element.attributes;

  static String getAttribute(Element element, String attribute) =>
      element.getAttribute(attribute);

  static Node templateAwareRoot(Element el) =>
      el is TemplateElement ? el.content : el;

  static HtmlDocument createHtmlDocument() =>
      document.implementation.createHtmlDocument('fakeTitle');

  static HtmlDocument defaultDoc() => document;
  static bool elementMatches(n, String selector) =>
      n is Element && n.matches(selector);
}
