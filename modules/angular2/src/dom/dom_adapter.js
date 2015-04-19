import {ABSTRACT, BaseException} from 'angular2/src/facade/lang';

export var DOM:DomAdapter;

export function setRootDomAdapter(adapter:DomAdapter) {
  DOM = adapter;
}

function _abstract() {
  return new BaseException('This method is abstract');
}

/**
 * Provides DOM operations in an environment-agnostic way.
 */
@ABSTRACT()
export class DomAdapter {

  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  get attrToPropMap() {
    throw _abstract();
  }

  parse(templateHtml:string) {
    throw _abstract();
  }
  query(selector:string) {
    throw _abstract();
  }
  querySelector(el, selector:string) {
    throw _abstract();
  }
  querySelectorAll(el, selector:string):List {
    throw _abstract();
  }
  on(el, evt, listener) {
    throw _abstract();
  }
  onAndCancel(el, evt, listener): Function {
    throw _abstract();
  }
  dispatchEvent(el, evt) {
    throw _abstract();
  }
  createMouseEvent(eventType) {
    throw _abstract();
  }
  createEvent(eventType) {
    throw _abstract();
  }
  getInnerHTML(el) {
    throw _abstract();
  }
  getOuterHTML(el) {
    throw _abstract();
  }
  nodeName(node):string {
    throw _abstract();
  }
  nodeValue(node):string {
    throw _abstract();
  }
  type(node):string {
    throw _abstract();
  }
  content(node) {
    throw _abstract();
  }
  firstChild(el) {
    throw _abstract();
  }
  nextSibling(el) {
    throw _abstract();
  }
  parentElement(el) {
    throw _abstract();
  }
  childNodes(el):List {
    throw _abstract();
  }
  childNodesAsList(el):List {
    throw _abstract();
  }
  clearNodes(el) {
    throw _abstract();
  }
  appendChild(el, node) {
    throw _abstract();
  }
  removeChild(el, node) {
    throw _abstract();
  }
  replaceChild(el, newNode, oldNode) {
    throw _abstract();
  }
  remove(el) {
    throw _abstract();
  }
  insertBefore(el, node) {
    throw _abstract();
  }
  insertAllBefore(el, nodes) {
    throw _abstract();
  }
  insertAfter(el, node) {
    throw _abstract();
  }
  setInnerHTML(el, value) {
    throw _abstract();
  }
  getText(el) {
    throw _abstract();
  }
  setText(el, value:string) {
    throw _abstract();
  }
  getValue(el) {
    throw _abstract();
  }
  setValue(el, value:string) {
    throw _abstract();
  }
  getChecked(el) {
    throw _abstract();
  }
  setChecked(el, value:boolean) {
    throw _abstract();
  }
  createTemplate(html) {
    throw _abstract();
  }
  createElement(tagName, doc = null) {
    throw _abstract();
  }
  createTextNode(text: string, doc = null) {
    throw _abstract();
  }
  createScriptTag(attrName:string, attrValue:string, doc = null) {
    throw _abstract();
  }
  createStyleElement(css:string, doc = null) {
    throw _abstract();
  }
  createShadowRoot(el) {
    throw _abstract();
  }
  getShadowRoot(el) {
    throw _abstract();
  }
  getHost(el) {
    throw _abstract();
  }
  getDistributedNodes(el) {
    throw _abstract();
  }
  clone(node) {
    throw _abstract();
  }
  hasProperty(element, name:string) {
    throw _abstract();
  }
  getElementsByClassName(element, name:string) {
    throw _abstract();
  }
  getElementsByTagName(element, name:string) {
    throw _abstract();
  }
  classList(element):List {
    throw _abstract();
  }
  addClass(element, classname:string) {
    throw _abstract();
  }
  removeClass(element, classname:string) {
    throw _abstract();
  }
  hasClass(element, classname:string) {
    throw _abstract();
  }
  setStyle(element, stylename:string, stylevalue:string) {
    throw _abstract();
  }
  removeStyle(element, stylename:string) {
    throw _abstract();
  }
  getStyle(element, stylename:string) {
    throw _abstract();
  }
  tagName(element):string {
    throw _abstract();
  }
  attributeMap(element) {
    throw _abstract();
  }
  getAttribute(element, attribute:string):string {
    throw _abstract();
  }
  setAttribute(element, name:string, value:string) {
    throw _abstract();
  }
  removeAttribute(element, attribute:string) {
    throw _abstract();
  }
  templateAwareRoot(el) {
    throw _abstract();
  }
  createHtmlDocument() {
    throw _abstract();
  }
  defaultDoc() {
    throw _abstract();
  }
  getBoundingClientRect(el) {
    throw _abstract();
  }
  getTitle() {
    throw _abstract();
  }
  setTitle(newTitle:string) {
    throw _abstract();
  }
  elementMatches(n, selector:string):boolean {
    throw _abstract();
  }
  isTemplateElement(el:any):boolean {
    throw _abstract();
  }
  isTextNode(node):boolean {
    throw _abstract();
  }
  isCommentNode(node):boolean {
    throw _abstract();
  }
  isElementNode(node):boolean {
    throw _abstract();
  }
  hasShadowRoot(node):boolean {
    throw _abstract();
  }
  isShadowRoot(node):boolean {
    throw _abstract();
  }
  importIntoDoc(node) {
    throw _abstract();
  }
  isPageRule(rule): boolean {
    throw _abstract();
  }
  isStyleRule(rule): boolean {
    throw _abstract();
  }
  isMediaRule(rule): boolean {
    throw _abstract();
  }
  isKeyframesRule(rule): boolean {
    throw _abstract();
  }
  getHref(element): string {
    throw _abstract();
  }
  getEventKey(event): string {
    throw _abstract();
  }
  resolveAndSetHref(element, baseUrl:string, href:string) {
    throw _abstract();
  }
  cssToRules(css:string): List {
    throw _abstract();
  }
  supportsDOMEvents(): boolean {
    throw _abstract();
  }
  supportsNativeShadowDOM(): boolean {
    throw _abstract();
  }
  getGlobalEventTarget(target:string) {
    throw _abstract();
  }
}
