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
}
