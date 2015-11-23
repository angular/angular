library angular2.src.platform.dom.dom_adapter;

import "package:angular2/src/facade/lang.dart" show isBlank, Type;

DomAdapter DOM = null;
setRootDomAdapter(DomAdapter adapter) {
  if (isBlank(DOM)) {
    DOM = adapter;
  }
}
/* tslint:disable:requireParameterType */

/**
 * Provides DOM operations in an environment-agnostic way.
 */
abstract class DomAdapter {
  bool hasProperty(element, String name);
  setProperty(dynamic el, String name, dynamic value);
  dynamic getProperty(dynamic el, String name);
  dynamic invoke(dynamic el, String methodName, List<dynamic> args);
  logError(error);
  log(error);
  logGroup(error);
  logGroupEnd();
  Type getXHR();
  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  Map<String, String> attrToPropMap;
  parse(String templateHtml);
  dynamic query(String selector);
  dynamic querySelector(el, String selector);
  List<dynamic> querySelectorAll(el, String selector);
  on(el, evt, listener);
  Function onAndCancel(el, evt, listener);
  dispatchEvent(el, evt);
  dynamic createMouseEvent(eventType);
  dynamic createEvent(String eventType);
  preventDefault(evt);
  bool isPrevented(evt);
  String getInnerHTML(el);
  String getOuterHTML(el);
  String nodeName(node);
  String nodeValue(node);
  String type(node);
  dynamic content(node);
  dynamic firstChild(el);
  dynamic nextSibling(el);
  dynamic parentElement(el);
  List<dynamic> childNodes(el);
  List<dynamic> childNodesAsList(el);
  clearNodes(el);
  appendChild(el, node);
  removeChild(el, node);
  replaceChild(el, newNode, oldNode);
  dynamic remove(el);
  insertBefore(el, node);
  insertAllBefore(el, nodes);
  insertAfter(el, node);
  setInnerHTML(el, value);
  String getText(el);
  setText(el, String value);
  String getValue(el);
  setValue(el, String value);
  bool getChecked(el);
  setChecked(el, bool value);
  dynamic createComment(String text);
  dynamic createTemplate(html);
  dynamic createElement(tagName, [doc]);
  dynamic createElementNS(String ns, String tagName, [doc]);
  dynamic createTextNode(String text, [doc]);
  dynamic createScriptTag(String attrName, String attrValue, [doc]);
  dynamic createStyleElement(String css, [doc]);
  dynamic createShadowRoot(el);
  dynamic getShadowRoot(el);
  dynamic getHost(el);
  List<dynamic> getDistributedNodes(el);
  dynamic clone(dynamic node);
  List<dynamic> getElementsByClassName(element, String name);
  List<dynamic> getElementsByTagName(element, String name);
  List<dynamic> classList(element);
  addClass(element, String className);
  removeClass(element, String className);
  bool hasClass(element, String className);
  setStyle(element, String styleName, String styleValue);
  removeStyle(element, String styleName);
  String getStyle(element, String styleName);
  bool hasStyle(element, String styleName, [String styleValue]);
  String tagName(element);
  Map<String, String> attributeMap(element);
  bool hasAttribute(element, String attribute);
  String getAttribute(element, String attribute);
  setAttribute(element, String name, String value);
  setAttributeNS(element, String ns, String name, String value);
  removeAttribute(element, String attribute);
  templateAwareRoot(el);
  dynamic createHtmlDocument();
  dynamic defaultDoc();
  getBoundingClientRect(el);
  String getTitle();
  setTitle(String newTitle);
  bool elementMatches(n, String selector);
  bool isTemplateElement(dynamic el);
  bool isTextNode(node);
  bool isCommentNode(node);
  bool isElementNode(node);
  bool hasShadowRoot(node);
  bool isShadowRoot(node);
  dynamic importIntoDoc(dynamic node);
  dynamic adoptNode(dynamic node);
  String getHref(element);
  String getEventKey(event);
  resolveAndSetHref(element, String baseUrl, String href);
  bool supportsDOMEvents();
  bool supportsNativeShadowDOM();
  dynamic getGlobalEventTarget(String target);
  dynamic getHistory();
  dynamic getLocation();
  String getBaseHref();
  void resetBaseElement();
  String getUserAgent();
  setData(element, String name, String value);
  dynamic getComputedStyle(element);
  String getData(element, String name);
  setGlobalVar(String name, dynamic value);
  num requestAnimationFrame(callback);
  cancelAnimationFrame(id);
  num performanceNow();
  String getAnimationPrefix();
  String getTransitionEnd();
  bool supportsAnimation();
}
