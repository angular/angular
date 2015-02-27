library angular2.dom.html5adapter;

import 'dom_adapter.dart';
import 'package:html5lib/parser.dart' as parser;
import 'package:html5lib/dom.dart';

class Html5LibDomAdapter implements DomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new Html5LibDomAdapter());
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
  String nodeValue(node) {
    throw 'not implemented';
  }
  String type(node) {
    throw 'not implemented';
  }
  content(TemplateElement node) {
    throw 'not implemented';
  }
  
  firstChild(el) => el is NodeList
    ? el.first
    : el.firstChild;

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
  List childNodes(el) {
    throw 'not implemented';
  }
  List childNodesAsList(el) {
    throw 'not implemented';
  }
  clearNodes(el) {
    throw 'not implemented';
  }
  appendChild(el, node) {
    throw 'not implemented';
  }
  removeChild(el, node) {
    throw 'not implemented';
  }
  remove(el) {
    throw 'not implemented';
  }
  insertBefore(el, node) {
    throw 'not implemented';
  }
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
  setText(el, String value) {
    throw 'not implemented';
  }
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
  createTemplate(html) {
    return createElement('template')
      ..innerHtml = html;
  }
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
    throw 'not implemented';
  }
  removeClass(element, String classname) {
    throw 'not implemented';
  }

  hasClass(element, String classname) =>
    element.classes.contains(classname);

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

  attributeMap(element) => element.attributes;
  getAttribute(element, String attribute) {
    throw 'not implemented';
  }
  setAttribute(element, String name, String value) {
    throw 'not implemented';
  }
  removeAttribute(element, String attribute) {
    throw 'not implemented';
  }

  templateAwareRoot(el) => isTemplateElement(el)
    ? el.nodes
    : el;

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
  bool isTextNode(node) {
    throw 'not implemented';
  }
  bool isCommentNode(node) {
    throw 'not implemented';
  }
  
  bool isElementNode(node) => node is Element;

  bool hasShadowRoot(node) {
    throw 'not implemented';
  }
  importIntoDoc(node) {
    throw 'not implemented';
  }
  isPageRule(rule) {
    throw 'not implemented';
  }
  isStyleRule(rule) {
    throw 'not implemented';
  }
  isMediaRule(rule) {
    throw 'not implemented';
  }
  isKeyframesRule(rule) {
    throw 'not implemented';
  }
}
