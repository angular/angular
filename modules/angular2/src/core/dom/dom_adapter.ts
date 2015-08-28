import {BaseException, isBlank} from 'angular2/src/core/facade/lang';

export var DOM: DomAdapter;

export function setRootDomAdapter(adapter: DomAdapter) {
  if (isBlank(DOM)) {
    DOM = adapter;
  }
}



function _abstract() {
  return new BaseException('This method is abstract');
}

/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 */
export class DomAdapter {
  hasProperty(element, name: string): boolean { throw _abstract(); }
  setProperty(el: Element, name: string, value: any) { throw _abstract(); }
  getProperty(el: Element, name: string): any { throw _abstract(); }
  invoke(el: Element, methodName: string, args: any[]): any { throw _abstract(); }

  logError(error) { throw _abstract(); }
  log(error) { throw _abstract(); }
  logGroup(error) { throw _abstract(); }
  logGroupEnd() { throw _abstract(); }

  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  get attrToPropMap(): StringMap<string, string> { throw _abstract(); }

  parse(templateHtml: string) { throw _abstract(); }
  query(selector: string): any { throw _abstract(); }
  querySelector(el, selector: string): HTMLElement { throw _abstract(); }
  querySelectorAll(el, selector: string): any[] { throw _abstract(); }
  on(el, evt, listener) { throw _abstract(); }
  onAndCancel(el, evt, listener): Function { throw _abstract(); }
  dispatchEvent(el, evt) { throw _abstract(); }
  createMouseEvent(eventType): any { throw _abstract(); }
  createEvent(eventType: string): any { throw _abstract(); }
  preventDefault(evt) { throw _abstract(); }
  isPrevented(evt): boolean { throw _abstract(); }
  getInnerHTML(el): string { throw _abstract(); }
  getOuterHTML(el): string { throw _abstract(); }
  nodeName(node): string { throw _abstract(); }
  nodeValue(node): string { throw _abstract(); }
  type(node): string { throw _abstract(); }
  content(node): any { throw _abstract(); }
  firstChild(el): Node { throw _abstract(); }
  nextSibling(el): Node { throw _abstract(); }
  parentElement(el): Node { throw _abstract(); }
  childNodes(el): Node[] { throw _abstract(); }
  childNodesAsList(el): Node[] { throw _abstract(); }
  clearNodes(el) { throw _abstract(); }
  appendChild(el, node) { throw _abstract(); }
  removeChild(el, node) { throw _abstract(); }
  replaceChild(el, newNode, oldNode) { throw _abstract(); }
  remove(el): Node { throw _abstract(); }
  insertBefore(el, node) { throw _abstract(); }
  insertAllBefore(el, nodes) { throw _abstract(); }
  insertAfter(el, node) { throw _abstract(); }
  setInnerHTML(el, value) { throw _abstract(); }
  getText(el): string { throw _abstract(); }
  setText(el, value: string) { throw _abstract(); }
  getValue(el): string { throw _abstract(); }
  setValue(el, value: string) { throw _abstract(); }
  getChecked(el): boolean { throw _abstract(); }
  setChecked(el, value: boolean) { throw _abstract(); }
  createComment(text: string): any { throw _abstract(); }
  createTemplate(html): HTMLElement { throw _abstract(); }
  createElement(tagName, doc = null): HTMLElement { throw _abstract(); }
  createTextNode(text: string, doc = null): Text { throw _abstract(); }
  createScriptTag(attrName: string, attrValue: string, doc = null): HTMLElement {
    throw _abstract();
  }
  createStyleElement(css: string, doc = null): HTMLStyleElement { throw _abstract(); }
  createShadowRoot(el): any { throw _abstract(); }
  getShadowRoot(el): any { throw _abstract(); }
  getHost(el): any { throw _abstract(); }
  getDistributedNodes(el): Node[] { throw _abstract(); }
  clone /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/ { throw _abstract(); }
  getElementsByClassName(element, name: string): HTMLElement[] { throw _abstract(); }
  getElementsByTagName(element, name: string): HTMLElement[] { throw _abstract(); }
  classList(element): any[] { throw _abstract(); }
  addClass(element, classname: string) { throw _abstract(); }
  removeClass(element, classname: string) { throw _abstract(); }
  hasClass(element, classname: string): boolean { throw _abstract(); }
  setStyle(element, stylename: string, stylevalue: string) { throw _abstract(); }
  removeStyle(element, stylename: string) { throw _abstract(); }
  getStyle(element, stylename: string): string { throw _abstract(); }
  tagName(element): string { throw _abstract(); }
  attributeMap(element): Map<string, string> { throw _abstract(); }
  hasAttribute(element, attribute: string): boolean { throw _abstract(); }
  getAttribute(element, attribute: string): string { throw _abstract(); }
  setAttribute(element, name: string, value: string) { throw _abstract(); }
  removeAttribute(element, attribute: string) { throw _abstract(); }
  templateAwareRoot(el) { throw _abstract(); }
  createHtmlDocument(): HTMLDocument { throw _abstract(); }
  defaultDoc(): HTMLDocument { throw _abstract(); }
  getBoundingClientRect(el) { throw _abstract(); }
  getTitle(): string { throw _abstract(); }
  setTitle(newTitle: string) { throw _abstract(); }
  elementMatches(n, selector: string): boolean { throw _abstract(); }
  isTemplateElement(el: any): boolean { throw _abstract(); }
  isTextNode(node): boolean { throw _abstract(); }
  isCommentNode(node): boolean { throw _abstract(); }
  isElementNode(node): boolean { throw _abstract(); }
  hasShadowRoot(node): boolean { throw _abstract(); }
  isShadowRoot(node): boolean { throw _abstract(); }
  importIntoDoc /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/ { throw _abstract(); }
  adoptNode /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/ { throw _abstract(); }
  isPageRule(rule): boolean { throw _abstract(); }
  isStyleRule(rule): boolean { throw _abstract(); }
  isMediaRule(rule): boolean { throw _abstract(); }
  isKeyframesRule(rule): boolean { throw _abstract(); }
  getHref(element): string { throw _abstract(); }
  getEventKey(event): string { throw _abstract(); }
  resolveAndSetHref(element, baseUrl: string, href: string) { throw _abstract(); }
  cssToRules(css: string): any[] { throw _abstract(); }
  supportsDOMEvents(): boolean { throw _abstract(); }
  supportsNativeShadowDOM(): boolean { throw _abstract(); }
  getGlobalEventTarget(target: string): any { throw _abstract(); }
  getHistory(): History { throw _abstract(); }
  getLocation(): Location { throw _abstract(); }
  getBaseHref(): string { throw _abstract(); }
  resetBaseElement(): void { throw _abstract(); }
  getUserAgent(): string { throw _abstract(); }
  setData(element, name: string, value: string) { throw _abstract(); }
  getData(element, name: string): string { throw _abstract(); }
  setGlobalVar(name: string, value: any) { throw _abstract(); }
}
