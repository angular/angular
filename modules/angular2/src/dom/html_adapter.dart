library angular2.dom.htmlAdapter;

import 'dom_adapter.dart';
import 'package:html/parser.dart' as parser;
import 'package:html/dom.dart';
import 'dart:io';

class Html5LibDomAdapter implements DomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new Html5LibDomAdapter());
  }

  hasProperty(element, String name) {
    // This is needed for serverside compile to generate the right getters/setters.
    // TODO: change this once we have property schema support.
    // Attention: Keep this in sync with browser_adapter.dart!
    return true;
  }

  void setProperty(Element element, String name, Object value) =>
      throw 'not implemented';

  getProperty(Element element, String name) => throw 'not implemented';

  invoke(Element element, String methodName, List args) =>
      throw 'not implemented';

  logError(error) {
    stderr.writeln('${error}');
  }

  log(error) {
    stdout.writeln('${error}');
  }

  logGroup(error) {
    stdout.writeln('${error}');
  }

  logGroupEnd() {}

  @override
  final attrToPropMap = const {
    'innerHtml': 'innerHTML',
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
    return el.querySelector(selector);
  }

  List querySelectorAll(el, String selector) {
    return el.querySelectorAll(selector);
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

  preventDefault(evt) {
    throw 'not implemented';
  }

  isPrevented(evt) {
    throw 'not implemented';
  }

  getInnerHTML(el) {
    return el.innerHtml;
  }

  getOuterHTML(el) {
    return el.outerHtml;
  }

  String nodeName(node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return (node as Element).localName;
      case Node.TEXT_NODE:
        return '#text';
      default:
        throw 'not implemented for type ${node.nodeType}. '
            'See http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247'
            ' for node types definitions.';
    }
  }

  String nodeValue(node) => node.data;
  String type(node) {
    throw 'not implemented';
  }

  content(node) {
    return node;
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
    return el.parent;
  }

  List childNodes(el) => el.nodes;
  List childNodesAsList(el) => el.nodes;
  clearNodes(el) {
    el.nodes.forEach((e) => e.remove());
  }

  appendChild(el, node) => el.append(node.remove());
  removeChild(el, node) {
    throw 'not implemented';
  }

  remove(el) => el.remove();
  insertBefore(el, node) {
    if (el.parent == null) throw '$el must have a parent';
    el.parent.insertBefore(node, el);
  }

  insertAllBefore(el, nodes) {
    throw 'not implemented';
  }

  insertAfter(el, node) {
    throw 'not implemented';
  }

  setInnerHTML(el, value) {
    el.innerHtml = value;
  }

  getText(el) {
    return el.text;
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

  createComment(String text) => new Comment(text);
  createTemplate(String html) => createElement('template')..innerHtml = html;
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

  clone(node) => node.clone(true);
  getElementsByClassName(element, String name) {
    throw 'not implemented';
  }

  getElementsByTagName(element, String name) {
    throw 'not implemented';
  }

  List classList(element) => element.classes.toList();

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

  hasAttribute(element, String attribute) {
    // `attributes` keys can be {@link AttributeName}s.
    return element.attributes.keys.any((key) => '$key' == attribute);
  }

  getAttribute(element, String attribute) {
    // `attributes` keys can be {@link AttributeName}s.
    var key = element.attributes.keys.firstWhere((key) => '$key' == attribute,
        orElse: () {});
    return element.attributes[key];
  }

  setAttribute(element, String name, String value) {
    element.attributes[name] = value;
  }

  removeAttribute(element, String attribute) {
    element.attributes.remove(attribute);
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

  adoptNode(node) {
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
    return false;
  }

  bool supportsNativeShadowDOM() {
    return false;
  }

  getHistory() {
    throw 'not implemented';
  }

  getLocation() {
    throw 'not implemented';
  }

  getBaseHref() {
    throw 'not implemented';
  }

  resetBaseElement() {
    throw 'not implemented';
  }

  String getUserAgent() {
    throw 'not implemented';
  }

  void setData(Element element, String name, String value) {
    this.setAttribute(element, 'data-${name}', value);
  }

  String getData(Element element, String name) {
    return this.getAttribute(element, 'data-${name}');
  }

  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(String name, value) {
    // noop on the server
  }
}
