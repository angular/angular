export var DocumentFragment = window.DocumentFragment;
export var Node = window.Node;
export var Text = window.Text;
export var Element = window.HTMLElement;
export var TemplateElement = window.HTMLTemplateElement;

export class DOM {
  static query(selector) {
    return document.querySelector(selector);
  }
  static on(el, evt, listener) {
    el.addEventListener(evt, listener, false);
  }
  static getInnerHTML(el) {
    return el.innerHTML;
  }
  static setInnerHTML(el, value) {
    el.innerHTML = value;
  }
  static setText(text:Text, value:String) {
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
