import {Type} from '../../facade/lang';
import {DomAdapter, setRootDomAdapter} from '../../dom/dom_adapter';

/**
 * This adapter is required to log error messages.
 *
 * Note: other methods all throw as the DOM is not accessible directly in web worker context.
 */
export class WorkerDomAdapter extends DomAdapter {
  static makeCurrent() { setRootDomAdapter(new WorkerDomAdapter()); }

  logError(error) {
    if (console.error) {
      console.error(error);
    } else {
      console.log(error);
    }
  }

  log(error) { console.log(error); }

  logGroup(error) {
    if (console.group) {
      console.group(error);
      this.logError(error);
    } else {
      console.log(error);
    }
  }

  logGroupEnd() {
    if (console.groupEnd) {
      console.groupEnd();
    }
  }

  hasProperty(element, name: string): boolean { throw "not implemented"; }
  setProperty(el: Element, name: string, value: any) { throw "not implemented"; }
  getProperty(el: Element, name: string): any { throw "not implemented"; }
  invoke(el: Element, methodName: string, args: any[]): any { throw "not implemented"; }

  getXHR(): Type { throw "not implemented"; }

  get attrToPropMap(): {[key: string]: string} { throw "not implemented"; }
  set attrToPropMap(value: {[key: string]: string}) { throw "not implemented"; }

  parse(templateHtml: string) { throw "not implemented"; }
  query(selector: string): any { throw "not implemented"; }
  querySelector(el, selector: string): HTMLElement { throw "not implemented"; }
  querySelectorAll(el, selector: string): any[] { throw "not implemented"; }
  on(el, evt, listener) { throw "not implemented"; }
  onAndCancel(el, evt, listener): Function { throw "not implemented"; }
  dispatchEvent(el, evt) { throw "not implemented"; }
  createMouseEvent(eventType): any { throw "not implemented"; }
  createEvent(eventType: string): any { throw "not implemented"; }
  preventDefault(evt) { throw "not implemented"; }
  isPrevented(evt): boolean { throw "not implemented"; }
  getInnerHTML(el): string { throw "not implemented"; }
  getTemplateContent(el): any { throw "not implemented"; }
  getOuterHTML(el): string { throw "not implemented"; }
  nodeName(node): string { throw "not implemented"; }
  nodeValue(node): string { throw "not implemented"; }
  type(node): string { throw "not implemented"; }
  content(node): any { throw "not implemented"; }
  firstChild(el): Node { throw "not implemented"; }
  nextSibling(el): Node { throw "not implemented"; }
  parentElement(el): Node { throw "not implemented"; }
  childNodes(el): Node[] { throw "not implemented"; }
  childNodesAsList(el): Node[] { throw "not implemented"; }
  clearNodes(el) { throw "not implemented"; }
  appendChild(el, node) { throw "not implemented"; }
  removeChild(el, node) { throw "not implemented"; }
  replaceChild(el, newNode, oldNode) { throw "not implemented"; }
  remove(el): Node { throw "not implemented"; }
  insertBefore(el, node) { throw "not implemented"; }
  insertAllBefore(el, nodes) { throw "not implemented"; }
  insertAfter(el, node) { throw "not implemented"; }
  setInnerHTML(el, value) { throw "not implemented"; }
  getText(el): string { throw "not implemented"; }
  setText(el, value: string) { throw "not implemented"; }
  getValue(el): string { throw "not implemented"; }
  setValue(el, value: string) { throw "not implemented"; }
  getChecked(el): boolean { throw "not implemented"; }
  setChecked(el, value: boolean) { throw "not implemented"; }
  createComment(text: string): any { throw "not implemented"; }
  createTemplate(html): HTMLElement { throw "not implemented"; }
  createElement(tagName, doc?): HTMLElement { throw "not implemented"; }
  createElementNS(ns: string, tagName: string, doc?): Element { throw "not implemented"; }
  createTextNode(text: string, doc?): Text { throw "not implemented"; }
  createScriptTag(attrName: string, attrValue: string, doc?): HTMLElement {
    throw "not implemented";
  }
  createStyleElement(css: string, doc?): HTMLStyleElement { throw "not implemented"; }
  createShadowRoot(el): any { throw "not implemented"; }
  getShadowRoot(el): any { throw "not implemented"; }
  getHost(el): any { throw "not implemented"; }
  getDistributedNodes(el): Node[] { throw "not implemented"; }
  clone(node: Node): Node { throw "not implemented"; }
  getElementsByClassName(element, name: string): HTMLElement[] { throw "not implemented"; }
  getElementsByTagName(element, name: string): HTMLElement[] { throw "not implemented"; }
  classList(element): any[] { throw "not implemented"; }
  addClass(element, className: string) { throw "not implemented"; }
  removeClass(element, className: string) { throw "not implemented"; }
  hasClass(element, className: string): boolean { throw "not implemented"; }
  setStyle(element, styleName: string, styleValue: string) { throw "not implemented"; }
  removeStyle(element, styleName: string) { throw "not implemented"; }
  getStyle(element, styleName: string): string { throw "not implemented"; }
  hasStyle(element, styleName: string, styleValue?: string): boolean { throw "not implemented"; }
  tagName(element): string { throw "not implemented"; }
  attributeMap(element): Map<string, string> { throw "not implemented"; }
  hasAttribute(element, attribute: string): boolean { throw "not implemented"; }
  hasAttributeNS(element, ns: string, attribute: string): boolean { throw "not implemented"; }
  getAttribute(element, attribute: string): string { throw "not implemented"; }
  getAttributeNS(element, ns: string, attribute: string): string { throw "not implemented"; }
  setAttribute(element, name: string, value: string) { throw "not implemented"; }
  setAttributeNS(element, ns: string, name: string, value: string) { throw "not implemented"; }
  removeAttribute(element, attribute: string) { throw "not implemented"; }
  removeAttributeNS(element, ns: string, attribute: string) { throw "not implemented"; }
  templateAwareRoot(el) { throw "not implemented"; }
  createHtmlDocument(): HTMLDocument { throw "not implemented"; }
  defaultDoc(): HTMLDocument { throw "not implemented"; }
  getBoundingClientRect(el) { throw "not implemented"; }
  getTitle(): string { throw "not implemented"; }
  setTitle(newTitle: string) { throw "not implemented"; }
  elementMatches(n, selector: string): boolean { throw "not implemented"; }
  isTemplateElement(el: any): boolean { throw "not implemented"; }
  isTextNode(node): boolean { throw "not implemented"; }
  isCommentNode(node): boolean { throw "not implemented"; }
  isElementNode(node): boolean { throw "not implemented"; }
  hasShadowRoot(node): boolean { throw "not implemented"; }
  isShadowRoot(node): boolean { throw "not implemented"; }
  importIntoDoc(node: Node): Node { throw "not implemented"; }
  adoptNode(node: Node): Node { throw "not implemented"; }
  getHref(element): string { throw "not implemented"; }
  getEventKey(event): string { throw "not implemented"; }
  resolveAndSetHref(element, baseUrl: string, href: string) { throw "not implemented"; }
  supportsDOMEvents(): boolean { throw "not implemented"; }
  supportsNativeShadowDOM(): boolean { throw "not implemented"; }
  getGlobalEventTarget(target: string): any { throw "not implemented"; }
  getHistory(): History { throw "not implemented"; }
  getLocation(): Location { throw "not implemented"; }
  getBaseHref(): string { throw "not implemented"; }
  resetBaseElement(): void { throw "not implemented"; }
  getUserAgent(): string { throw "not implemented"; }
  setData(element, name: string, value: string) { throw "not implemented"; }
  getComputedStyle(element): any { throw "not implemented"; }
  getData(element, name: string): string { throw "not implemented"; }
  setGlobalVar(name: string, value: any) { throw "not implemented"; }
  requestAnimationFrame(callback): number { throw "not implemented"; }
  cancelAnimationFrame(id) { throw "not implemented"; }
  performanceNow(): number { throw "not implemented"; }
  getAnimationPrefix(): string { throw "not implemented"; }
  getTransitionEnd(): string { throw "not implemented"; }
  supportsAnimation(): boolean { throw "not implemented"; }
  supportsWebAnimation(): boolean { throw "not implemented"; }

  supportsCookies(): boolean { return false; }
  getCookie(name: string): string { throw "not implemented"; }
  setCookie(name: string, value: string) { throw "not implemented"; }
}
