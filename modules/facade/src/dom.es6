export var window = frames.window;
export var DocumentFragment = window.DocumentFragment;
export var Node = window.Node;
export var NodeList = window.NodeList;
export var Text = window.Text;
export var Element = window.HTMLElement;
export var TemplateElement = window.HTMLTemplateElement;
export var document = window.document;
export var location = window.location;
export var gc = window.gc ? () => window.gc() : () => null;

import {List, MapWrapper, ListWrapper} from 'facade/src/collection';

export class DOM {
  static query(selector) {
    return document.querySelector(selector);
  }
  static querySelector(el, selector:string):Node {
    return el.querySelector(selector);
  }
  static querySelectorAll(el, selector:string):NodeList {
    return el.querySelectorAll(selector);
  }
  static on(el, evt, listener) {
    el.addEventListener(evt, listener, false);
  }
  static dispatchEvent(el, evt) {
    el.dispatchEvent(evt);
  }
  static createMouseEvent(eventType) {
    var evt = new MouseEvent(eventType);
    evt.initEvent(eventType, true, true);
    return evt;
  }
  static createEvent(eventType) {
    return new Event(eventType, true);
  }
  static getInnerHTML(el) {
    return el.innerHTML;
  }
  static getOuterHTML(el) {
    return el.outerHTML;
  }
  static firstChild(el):Node {
    return el.firstChild;
  }
  static nextSibling(el):Node {
    return el.nextSibling;
  }
  static parentElement(el) {
    return el.parentElement;
  }
  static childNodes(el):NodeList {
    return el.childNodes;
  }
  static childNodesAsList(el):List {
    var childNodes = el.childNodes;
    var res = ListWrapper.createFixedSize(childNodes.length);
    for (var i=0; i<childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  static clearNodes(el) {
    el.innerHTML = "";
  }
  static appendChild(el, node) {
    el.appendChild(node);
  }
  static removeChild(el, node) {
    el.removeChild(node);
  }
  static insertBefore(el, node) {
    el.parentNode.insertBefore(node, el);
  }
  static insertAllBefore(el, nodes) {
    ListWrapper.forEach(nodes, (n) => {
      el.parentNode.insertBefore(n, el);
    });
  }
  static insertAfter(el, node) {
    el.parentNode.insertBefore(node, el.nextSibling);
  }
  static setInnerHTML(el, value) {
    el.innerHTML = value;
  }
  static getText(el: Element) {
    return el.textContent;
  }
  static setText(text:Text, value:string) {
    text.nodeValue = value;
  }
  static createTemplate(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  static createElement(tagName, doc=document) {
    return doc.createElement(tagName);
  }
  static createScriptTag(attrName:string, attrValue:string, doc=document) {
    var el = doc.createElement("SCRIPT");
    el.setAttribute(attrName, attrValue);
    return el;
  }
  static clone(node:Node) {
    return node.cloneNode(true);
  }
  static hasProperty(element:Element, name:string) {
    return name in element;
  }
  static getElementsByClassName(element:Element, name:string) {
    return element.getElementsByClassName(name);
  }
  static getElementsByTagName(element:Element, name:string) {
    return element.getElementsByTagName(name);
  }
  static classList(element:Element):List {
    return Array.prototype.slice.call(element.classList, 0);
  }
  static addClass(element:Element, classname:string) {
    element.classList.add(classname);
  }
  static hasClass(element:Element, classname:string) {
    return element.classList.contains(classname);
  }
  static tagName(element:Element):string {
    return element.tagName;
  }
  static attributeMap(element:Element) {
    var res = MapWrapper.create();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
  }
  static getAttribute(element:Element, attribute:string) {
    return element.getAttribute(attribute);
  }
  static templateAwareRoot(el:Element):Node {
    return el instanceof TemplateElement ? el.content : el;
  }
  static createHtmlDocument() {
    return document.implementation.createHTMLDocument();
  }
  static defaultDoc() {
    return document;
  }
  static elementMatches(n, selector:string):boolean {
    return n instanceof Element && n.matches(selector);
  }
}
