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
}