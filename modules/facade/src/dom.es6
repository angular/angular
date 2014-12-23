export var DocumentFragment = window.DocumentFragment;
export var Node = window.Node;
export var NodeList = window.NodeList;
export var Text = window.Text;
export var Element = window.HTMLElement;
export var TemplateElement = window.HTMLTemplateElement;
export var document = window.document;
export var location = window.location;

import {List, MapWrapper} from 'facade/collection';

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
  static clearNodes(el) {
    el.innerHTML = "";
  }
  static appendChild(el, node) {
    el.appendChild(node);
  }
  static removeChild(el, node) {
    el.removeChild(node);
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
  static attributeMap(element:Element) {
    var res = MapWrapper.create();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
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
}
