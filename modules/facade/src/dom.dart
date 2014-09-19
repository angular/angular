library angular.core.facade.dom;

import 'dart:html';

export 'dart:html' show DocumentFragment, Node, Element, TemplateElement;

class DOM {
  static query(selector) {
    return document.query(selector);
  }
  static on(element, event, callback) {
    element.addEventListener(event, callback);
  }
  static getInnerHTML(el) {
    return el.innerHtml;
  }
  static setInnerHTML(el, value) {
    el.innerHtml = value;
  }
}