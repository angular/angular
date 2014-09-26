library angular.core.facade.dom;

import 'dart:html';

export 'dart:html' show DocumentFragment, Node, Element, TemplateElement, Text;

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
  static setInnerHTML(el:, value) {
    el.innerHtml = value;
  }
  static setText(Text text, String value) {
    text.text = value;
  }
}
