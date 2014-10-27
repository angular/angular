export var DocumentFragment = window.DocumentFragment;
export var Node = window.Node;
export var NodeList = window.NodeList;
export var Text = window.Text;
export var Element = window.HTMLElement;
export var TemplateElement = window.HTMLTemplateElement;
import {List} from 'facade/collection';

export class DOM {
  static query(selector) {
    return document.querySelector(selector);
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
  static firstChild(el):Node {
    return el.firstChild;
  }
  static childNodes(el):NodeList {
    return el.childNodes;
  }
  static setInnerHTML(el, value) {
    el.innerHTML = value;
  }
  static setText(text:Text, value:string) {
    text.nodeValue = value;
  }
  static createTemplate(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  static clone(node:Node) {
    return node.cloneNode(true);
  }
  static setProperty(element:Element, name:string, value) {
    element[name] = value;
  }
  static getElementsByClassName(element:Element, name:string) {
    return element.getElementsByClassName(name);
  }
  static getElementsByTagName(element:Element, name:string) {
    return element.getElementsByTagName(name);
  }
}
