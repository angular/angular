library angular2.dom.htmlAdapter;

import 'dom_adapter.dart';
import 'package:html/parser.dart' as parser;
import 'package:html/dom.dart';

class Html5LibDomAdapter implements DomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new Html5LibDomAdapter());
  }

  @override
  final attrToPropMap = const {
    'innerHtml': 'innerHtml',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
  };

  @override
  getGlobalEventTarget(String target) {
    throw 'not implemented';
  }

  @override
  getTitle() {
    throw 'not implemented';
  }

  @override
  setTitle(String newTitle) {
    throw 'not implemented';
  }

  @override
  String getEventKey(event) {
    throw 'not implemented';
  }

  @override
  void replaceChild(el, newNode, oldNode) {
    throw 'not implemented';
  }

  @override
  dynamic getBoundingClientRect(el) {
    throw 'not implemented';
  }

  Element parse(String templateHtml) => parser.parse(templateHtml).firstChild;
  query(selector) {
    throw 'not implemented';
  }
  querySelector(el, String selector) {
    throw 'not implemented';
  }
  List querySelectorAll(el, String selector) {
    throw 'not implemented';
  }
  on(el, evt, listener) {
    throw 'not implemented';
  }
  Function onAndCancel(el, evt, listener) {
    throw 'not implemented';
  }
  dispatchEvent(el, evt) {
    throw 'not implemented';
  }
  createMouseEvent(eventType) {
    throw 'not implemented';
  }
  createEvent(eventType) {
    throw 'not implemented';
  }
  getInnerHTML(el) {
    return el.innerHtml;
  }
  getOuterHTML(el) {
    throw 'not implemented';
  }
  String nodeName(node) {
    throw 'not implemented';
  }
  String nodeValue(node) => node.data;
  String type(node) {
    throw 'not implemented';
  }
  content(node) {
    throw 'not implemented';
  }

  firstChild(el) => el is NodeList ? el.first : el.firstChild;

  nextSibling(el) {
    final parentNode = el.parentNode;
    if (parentNode == null) return null;
    final siblings = parentNode.nodes;
    final index = siblings.indexOf(el);
    if (index < siblings.length - 1) {
      return siblings[index + 1];
    }
    return null;
  }

  parentElement(el) {
    throw 'not implemented';
  }
  List childNodes(el) => el.nodes;
  List childNodesAsList(el) => el.nodes;
  clearNodes(el) {
    throw 'not implemented';
  }
  appendChild(el, node) => null;
  removeChild(el, node) {
    throw 'not implemented';
  }
  remove(el) => null;
  insertBefore(el, node) => null;
  insertAllBefore(el, nodes) {
    throw 'not implemented';
  }
  insertAfter(el, node) {
    throw 'not implemented';
  }
  setInnerHTML(el, value) {
    throw 'not implemented';
  }
  getText(el) {
    throw 'not implemented';
  }
  setText(el, String value) => el.text = value;

  getValue(el) {
    throw 'not implemented';
  }
  setValue(el, String value) {
    throw 'not implemented';
  }
  getChecked(el) {
    throw 'not implemented';
  }
  setChecked(el, bool value) {
    throw 'not implemented';
  }
  createTemplate(html) => createElement('template')..innerHtml = html;
  createElement(tagName, [doc]) {
    return new Element.tag(tagName);
  }
  createTextNode(String text, [doc]) {
    throw 'not implemented';
  }
  createScriptTag(String attrName, String attrValue, [doc]) {
    throw 'not implemented';
  }
  createStyleElement(String css, [doc]) {
    throw 'not implemented';
  }
  createShadowRoot(el) {
    throw 'not implemented';
  }
  getShadowRoot(el) {
    throw 'not implemented';
  }
  getHost(el) {
    throw 'not implemented';
  }
  clone(node) {
    throw 'not implemented';
  }
  hasProperty(element, String name) {
    throw 'not implemented';
  }
  getElementsByClassName(element, String name) {
    throw 'not implemented';
  }
  getElementsByTagName(element, String name) {
    throw 'not implemented';
  }
  List classList(element) {
    throw 'not implemented';
  }
  addClass(element, String classname) {
    element.classes.add(classname);
  }
  removeClass(element, String classname) {
    throw 'not implemented';
  }

  hasClass(element, String classname) => element.classes.contains(classname);

  setStyle(element, String stylename, String stylevalue) {
    throw 'not implemented';
  }
  removeStyle(element, String stylename) {
    throw 'not implemented';
  }
  getStyle(element, String stylename) {
    throw 'not implemented';
  }

  String tagName(element) => element.localName;

  attributeMap(element) {
    // `attributes` keys can be {@link AttributeName}s.
    var map = <String, String>{};
    element.attributes.forEach((key, value) {
      map['$key'] = value;
    });
    return map;
  }
  getAttribute(element, String attribute) {
    throw 'not implemented';
  }
  setAttribute(element, String name, String value) => null;
  removeAttribute(element, String attribute) {
    throw 'not implemented';
  }

  templateAwareRoot(el) => el;

  createHtmlDocument() {
    throw 'not implemented';
  }

  defaultDoc() {
    throw 'not implemented';
  }

  bool elementMatches(n, String selector) {
    throw 'not implemented';
  }

  bool isTemplateElement(Element el) {
    return el != null && el.localName.toLowerCase() == 'template';
  }
  bool isTextNode(node) => node.nodeType == Node.TEXT_NODE;
  bool isCommentNode(node) => node.nodeType == Node.COMMENT_NODE;

  bool isElementNode(node) => node.nodeType == Node.ELEMENT_NODE;

  bool hasShadowRoot(node) {
    throw 'not implemented';
  }
  bool isShadowRoot(node) {
    throw 'not implemented';
  }
  importIntoDoc(node) {
    throw 'not implemented';
  }
  bool isPageRule(rule) {
    throw 'not implemented';
  }
  bool isStyleRule(rule) {
    throw 'not implemented';
  }
  bool isMediaRule(rule) {
    throw 'not implemented';
  }
  bool isKeyframesRule(rule) {
    throw 'not implemented';
  }
  String getHref(element) {
    throw 'not implemented';
  }
  void resolveAndSetHref(element, baseUrl, href) {
    throw 'not implemented';
  }
  List cssToRules(String css) {
    throw 'not implemented';
  }
  List getDistributedNodes(Node) {
    throw 'not implemented';
  }
  bool supportsDOMEvents() {
    throw 'not implemented';
  }
  bool supportsNativeShadowDOM() {
    throw 'not implemented';
  }
}
