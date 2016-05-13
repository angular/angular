library angular2.dom.webWorkerAdapter;

import 'abstract_html_adapter.dart';
import 'package:angular2/platform/common_dom.dart';

/**
 * This adapter is required to log error messages.
 *
 * Note: other methods all throw as the DOM is not accessible directly
 * in web worker context.
 */
class WebWorkerDomAdapter implements DomAdapter {
  static void makeCurrent() {
    setRootDomAdapter(new WebWorkerDomAdapter());
  }

  logError(error) {
    print('${error}');
  }

  log(error) {
    print('${error}');
  }

  logGroup(error) {
    print('${error}');
  }

  logGroupEnd() {}

  hasProperty(element, String name) {
    throw 'not implemented';
  }

  void setProperty(Element element, String name, Object value) =>
      throw 'not implemented';

  getProperty(Element element, String name) => throw 'not implemented';

  invoke(Element element, String methodName, List args) =>
      throw 'not implemented';

  get attrToPropMap => throw 'not implemented';

  set attrToPropMap(value) {
    throw 'readonly';
  }

  getGlobalEventTarget(String target) {
    throw 'not implemented';
  }

  getTitle() {
    throw 'not implemented';
  }

  setTitle(String newTitle) {
    throw 'not implemented';
  }

  String getEventKey(event) {
    throw 'not implemented';
  }

  void replaceChild(el, newNode, oldNode) {
    throw 'not implemented';
  }

  dynamic getBoundingClientRect(el) {
    throw 'not implemented';
  }

  Type getXHR() => throw 'not implemented';

  Element parse(String templateHtml) => throw 'not implemented';
  query(selector) {
    throw 'not implemented';
  }

  querySelector(el, String selector) {
    throw 'not implemented';
  }

  List querySelectorAll(el, String selector) {
    throw 'not implemented';
  }

  on(el, evt, listener) {
    throw 'not implemented';
  }

  Function onAndCancel(el, evt, listener) {
    throw 'not implemented';
  }

  dispatchEvent(el, evt) {
    throw 'not implemented';
  }

  createMouseEvent(eventType) {
    throw 'not implemented';
  }

  createEvent(eventType) {
    throw 'not implemented';
  }

  preventDefault(evt) {
    throw 'not implemented';
  }

  isPrevented(evt) {
    throw 'not implemented';
  }

  getInnerHTML(el) => throw 'not implemented';

  getOuterHTML(el) => throw 'not implemented';

  String nodeName(node) => throw 'not implemented';

  String nodeValue(node) => throw 'not implemented';

  String type(node) {
    throw 'not implemented';
  }

  content(node) => throw 'not implemented';

  firstChild(el) => throw 'not implemented';

  nextSibling(el) => throw 'not implemented';

  parentElement(el) => throw 'not implemented';

  List childNodes(el) => throw 'not implemented';
  List childNodesAsList(el) => throw 'not implemented';
  clearNodes(el) {
    throw 'not implemented';
  }

  appendChild(el, node) => throw 'not implemented';
  removeChild(el, node) {
    throw 'not implemented';
  }

  remove(el) => throw 'not implemented';
  insertBefore(el, node) {
    throw 'not implemented';
  }

  insertAllBefore(el, nodes) {
    throw 'not implemented';
  }

  insertAfter(el, node) {
    throw 'not implemented';
  }

  setInnerHTML(el, value) {
    throw 'not implemented';
  }

  getText(el) => throw 'not implemented';

  setText(el, String value) => throw 'not implemented';

  getValue(el) {
    throw 'not implemented';
  }

  setValue(el, String value) {
    throw 'not implemented';
  }

  getChecked(el) {
    throw 'not implemented';
  }

  setChecked(el, bool value) {
    throw 'not implemented';
  }

  createComment(String text) => throw 'not implemented';
  createTemplate(String html) => throw 'not implemented';
  createElement(tagName, [doc]) => throw 'not implemented';

  createElementNS(ns, tagName, [doc]) {
    throw 'not implemented';
  }

  createTextNode(String text, [doc]) => throw 'not implemented';

  createScriptTag(String attrName, String attrValue, [doc]) {
    throw 'not implemented';
  }

  createStyleElement(String css, [doc]) {
    throw 'not implemented';
  }

  createShadowRoot(el) {
    throw 'not implemented';
  }

  getShadowRoot(el) {
    throw 'not implemented';
  }

  getHost(el) {
    throw 'not implemented';
  }

  clone(node) => throw 'not implemented';
  getElementsByClassName(element, String name) {
    throw 'not implemented';
  }

  getElementsByTagName(element, String name) {
    throw 'not implemented';
  }

  List classList(element) => throw 'not implemented';

  addClass(element, String className) {
    throw 'not implemented';
  }

  removeClass(element, String className) {
    throw 'not implemented';
  }

  hasClass(element, String className) => throw 'not implemented';

  setStyle(element, String styleName, String styleValue) {
    throw 'not implemented';
  }

  bool hasStyle(Element element, String styleName, [String styleValue]) {
    throw 'not implemented';
  }

  removeStyle(element, String styleName) {
    throw 'not implemented';
  }

  getStyle(element, String styleName) {
    throw 'not implemented';
  }

  String tagName(element) => throw 'not implemented';

  attributeMap(element) => throw 'not implemented';

  hasAttribute(element, String attribute) => throw 'not implemented';

  hasAttributeNS(element, String ns, String attribute) {
    throw 'not implemented';
  }

  getAttribute(element, String attribute) => throw 'not implemented';

  getAttributeNS(element, String ns, String attribute) {
    throw 'not implemented';
  }

  setAttribute(element, String name, String value) {
    throw 'not implemented';
  }

  setAttributeNS(element, String ns, String name, String value) {
    throw 'not implemented';
  }

  removeAttribute(element, String attribute) {
    throw 'not implemented';
  }

  removeAttributeNS(element, String ns, String attribute) {
    throw 'not implemented';
  }

  templateAwareRoot(el) => throw 'not implemented';

  createHtmlDocument() {
    throw 'not implemented';
  }

  defaultDoc() {
    throw 'not implemented';
  }

  bool elementMatches(n, String selector) {
    throw 'not implemented';
  }

  bool isTemplateElement(Element el) => throw 'not implemented';

  bool isTextNode(node) => throw 'not implemented';
  bool isCommentNode(node) => throw 'not implemented';

  bool isElementNode(node) => throw 'not implemented';

  bool hasShadowRoot(node) {
    throw 'not implemented';
  }

  bool isShadowRoot(node) {
    throw 'not implemented';
  }

  importIntoDoc(node) {
    throw 'not implemented';
  }

  adoptNode(node) {
    throw 'not implemented';
  }

  String getHref(element) {
    throw 'not implemented';
  }

  void resolveAndSetHref(element, baseUrl, href) {
    throw 'not implemented';
  }

  List getDistributedNodes(Node) {
    throw 'not implemented';
  }

  bool supportsDOMEvents() => throw 'not implemented';

  bool supportsNativeShadowDOM() => throw 'not implemented';

  getHistory() => throw 'not implemented';

  getLocation() {
    throw 'not implemented';
  }

  getBaseHref() {
    throw 'not implemented';
  }

  resetBaseElement() {
    throw 'not implemented';
  }

  String getUserAgent() => throw 'not implemented';

  void setData(Element element, String name, String value) {
    throw 'not implemented';
  }

  getComputedStyle(element) {
    throw 'not implemented';
  }

  String getData(Element element, String name) => throw 'not implemented';

  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(String name, value) {
    throw 'not implemented';
  }

  requestAnimationFrame(callback) {
    throw 'not implemented';
  }

  cancelAnimationFrame(id) {
    throw 'not implemented';
  }

  performanceNow() {
    throw 'not implemented';
  }

  getAnimationPrefix() {
    throw 'not implemented';
  }

  getTransitionEnd() {
    throw 'not implemented';
  }

  supportsAnimation() {
    throw 'not implemented';
  }
}
