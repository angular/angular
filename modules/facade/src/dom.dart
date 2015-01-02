library angular.core.facade.dom;

import 'dart:html';
import 'dart:js' show JsObject;

export 'dart:html' show DocumentFragment, Node, Element, TemplateElement, Text, document, location;

// TODO(tbosch): Is there a builtin one? Why is Dart
// removing unknown elements by default?
class IdentitySanitizer implements NodeTreeSanitizer {
  void sanitizeTree(Node node) {}
}

final identitySanitizer = new IdentitySanitizer();

class DOM {
  static query(selector) {
    return document.querySelector(selector);
  }
  static Element querySelector(el, String selector) {
    return el.querySelector(selector);
  }
  static ElementList querySelectorAll(el, String selector) {
    return el.querySelectorAll(selector);
  }
  static on(element, event, callback) {
    element.addEventListener(event, callback);
  }
  static getInnerHTML(el) {
    return el.innerHtml;
  }
  static getOuterHTML(el) {
    return el.outerHtml;
  }
  static setInnerHTML(el, value) {
    el.innerHtml = value;
  }
  static Node firstChild(el) {
    return el.firstChild;
  }
  static Node nextSibling(el) {
    return el.nextNode;
  }
  static Element parentElement(el) {
    return el.parent;
  }
  static List<Node> childNodes(el) {
    return el.childNodes;
  }
  static childNodesAsList(el) {
    return childNodes(el).toList();
  }
  static clearNodes(el) {
    el.nodes = [];
  }
  static appendChild(el, node) {
    el.append(node);
  }
  static removeChild(el, node) {
    node.remove();
  }
  static insertBefore(el, node) {
    el.parentNode.insertBefore(node, el);
  }
  static insertAllBefore(el, nodes) {
    el.parentNode.insertAllBefore(nodes, el);
  }
  static insertAfter(el, node) {
    el.parentNode.insertBefore(node, el.nextNode);
  }
  static getText(Element el) {
    return el.text;
  }
  static setText(Text text, String value) {
    text.text = value;
  }
  static createTemplate(html) {
    var t = new TemplateElement();
    t.setInnerHtml(html, treeSanitizer:identitySanitizer);
    return t;
  }
  static createElement(tagName, [doc=null]) {
    if (doc == null) doc = document;
    return doc.createElement(tagName);
  }
  static createScriptTag(String attrName, String attrValue, [doc=null]) {
    if (doc == null) doc = document;
    var el = doc.createElement("SCRIPT");
    el.setAttribute(attrName, attrValue);
    return el;
  }
  static clone(Node node) {
    return node.clone(true);
  }
  static hasProperty(Element element, String name) {
    return new JsObject.fromBrowserObject(element).hasProperty(name);
  }
  static getElementsByClassName(Element element, String name) {
    return element.getElementsByClassName(name);
  }
  static getElementsByTagName(Element element, String name) {
    return element.querySelectorAll(name);
  }
  static List classList(Element element) {
    return element.classes.toList();
  }
  static addClass(Element element, classname) {
    element.classes.add(classname);
  }
  static hasClass(Element element, classname) {
    return element.classes.contains(classname);
  }
  static String tagName(Element element) {
    return element.tagName;
  }
  static attributeMap(Element element) {
    return element.attributes;
  }
  static getAttribute(Element element, String attribute) {
    return element.getAttribute(attribute);
  }
  static Node templateAwareRoot(Element el) {
    return el is TemplateElement ? el.content : el;
  }
  static HtmlDocument createHtmlDocument() {
    return document.implementation.createHtmlDocument('fakeTitle');
  }
  static HtmlDocument defaultDoc() {
    return document;
  }
  static bool elementMatches(n, String selector) {
    return n is Element && n.matches(selector);
  }
}
