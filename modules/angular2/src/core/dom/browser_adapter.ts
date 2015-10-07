import {MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  isBlank,
  isPresent,
  global,
  setValueOnPath,
  DateWrapper
} from 'angular2/src/core/facade/lang';
import {setRootDomAdapter} from './dom_adapter';
import {GenericBrowserDomAdapter} from './generic_browser_adapter';

var _attrToPropMap = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex'
};

const DOM_KEY_LOCATION_NUMPAD = 3;

// Map to convert some key or keyIdentifier values to what will be returned by getEventKey
var _keyMap = {
  // The following values are here for cross-browser compatibility and to match the W3C standard
  // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
  '\b': 'Backspace',
  '\t': 'Tab',
  '\x7F': 'Delete',
  '\x1B': 'Escape',
  'Del': 'Delete',
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Menu': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'Win': 'OS'
};

// There is a bug in Chrome for numeric keypad keys:
// https://code.google.com/p/chromium/issues/detail?id=155654
// 1, 2, 3 ... are reported as A, B, C ...
var _chromeNumKeyPadMap = {
  'A': '1',
  'B': '2',
  'C': '3',
  'D': '4',
  'E': '5',
  'F': '6',
  'G': '7',
  'H': '8',
  'I': '9',
  'J': '*',
  'K': '+',
  'M': '-',
  'N': '.',
  'O': '/',
  '\x60': '0',
  '\x90': 'NumLock'
};

/* tslint:disable:requireParameterType */
export class BrowserDomAdapter extends GenericBrowserDomAdapter {
  parse(templateHtml: string) { throw new Error("parse not implemented"); }
  static makeCurrent() { setRootDomAdapter(new BrowserDomAdapter()); }
  hasProperty(element, name: string): boolean { return name in element; }
  setProperty(el: /*element*/ any, name: string, value: any) { el[name] = value; }
  getProperty(el: /*element*/ any, name: string): any { return el[name]; }
  invoke(el: /*element*/ any, methodName: string, args: any[]): any {
    el[methodName].apply(el, args);
  }

  // TODO(tbosch): move this into a separate environment class once we have it
  logError(error) {
    if (window.console.error) {
      window.console.error(error);
    } else {
      window.console.log(error);
    }
  }

  log(error) { window.console.log(error); }

  logGroup(error) {
    if (window.console.group) {
      window.console.group(error);
      this.logError(error);
    } else {
      window.console.log(error);
    }
  }

  logGroupEnd() {
    if (window.console.groupEnd) {
      window.console.groupEnd();
    }
  }

  get attrToPropMap(): any { return _attrToPropMap; }

  query(selector: string): any { return document.querySelector(selector); }
  querySelector(el, selector: string): HTMLElement { return el.querySelector(selector); }
  querySelectorAll(el, selector: string): any[] { return el.querySelectorAll(selector); }
  on(el, evt, listener) { el.addEventListener(evt, listener, false); }
  onAndCancel(el, evt, listener): Function {
    el.addEventListener(evt, listener, false);
    // Needed to follow Dart's subscription semantic, until fix of
    // https://code.google.com/p/dart/issues/detail?id=17406
    return () => { el.removeEventListener(evt, listener, false); };
  }
  dispatchEvent(el, evt) { el.dispatchEvent(evt); }
  createMouseEvent(eventType: string): MouseEvent {
    var evt: MouseEvent = document.createEvent('MouseEvent');
    evt.initEvent(eventType, true, true);
    return evt;
  }
  createEvent(eventType): Event {
    var evt: Event = document.createEvent('Event');
    evt.initEvent(eventType, true, true);
    return evt;
  }
  preventDefault(evt: Event) {
    evt.preventDefault();
    evt.returnValue = false;
  }
  isPrevented(evt: Event): boolean {
    return evt.defaultPrevented || isPresent(evt.returnValue) && !evt.returnValue;
  }
  getInnerHTML(el): string { return el.innerHTML; }
  getOuterHTML(el): string { return el.outerHTML; }
  nodeName(node: Node): string { return node.nodeName; }
  nodeValue(node: Node): string { return node.nodeValue; }
  type(node: HTMLInputElement): string { return node.type; }
  content(node: Node): Node {
    if (this.hasProperty(node, "content")) {
      return (<any>node).content;
    } else {
      return node;
    }
  }
  firstChild(el): Node { return el.firstChild; }
  nextSibling(el): Node { return el.nextSibling; }
  parentElement(el): Node { return el.parentNode; }
  childNodes(el): Node[] { return el.childNodes; }
  childNodesAsList(el): any[] {
    var childNodes = el.childNodes;
    var res = ListWrapper.createFixedSize(childNodes.length);
    for (var i = 0; i < childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  clearNodes(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
  appendChild(el, node) { el.appendChild(node); }
  removeChild(el, node) { el.removeChild(node); }
  replaceChild(el: Node, newChild, oldChild) { el.replaceChild(newChild, oldChild); }
  remove(node): Node {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return node;
  }
  insertBefore(el, node) { el.parentNode.insertBefore(node, el); }
  insertAllBefore(el, nodes) { nodes.forEach(n => el.parentNode.insertBefore(n, el)); }
  insertAfter(el, node) { el.parentNode.insertBefore(node, el.nextSibling); }
  setInnerHTML(el, value) { el.innerHTML = value; }
  getText(el): string { return el.textContent; }
  // TODO(vicb): removed Element type because it does not support StyleElement
  setText(el, value: string) { el.textContent = value; }
  getValue(el): string { return el.value; }
  setValue(el, value: string) { el.value = value; }
  getChecked(el): boolean { return el.checked; }
  setChecked(el, value: boolean) { el.checked = value; }
  createComment(text: string): Comment { return document.createComment(text); }
  createTemplate(html): HTMLElement {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  createElement(tagName, doc = document): HTMLElement { return doc.createElement(tagName); }
  createTextNode(text: string, doc = document): Text { return doc.createTextNode(text); }
  createScriptTag(attrName: string, attrValue: string, doc = document): HTMLScriptElement {
    var el = <HTMLScriptElement>doc.createElement('SCRIPT');
    el.setAttribute(attrName, attrValue);
    return el;
  }
  createStyleElement(css: string, doc = document): HTMLStyleElement {
    var style = <HTMLStyleElement>doc.createElement('style');
    this.appendChild(style, this.createTextNode(css));
    return style;
  }
  createShadowRoot(el: HTMLElement): DocumentFragment { return (<any>el).createShadowRoot(); }
  getShadowRoot(el: HTMLElement): DocumentFragment { return (<any>el).shadowRoot; }
  getHost(el: HTMLElement): HTMLElement { return (<any>el).host; }
  clone(node: Node): Node { return node.cloneNode(true); }
  getElementsByClassName(element, name: string): HTMLElement[] {
    return element.getElementsByClassName(name);
  }
  getElementsByTagName(element, name: string): HTMLElement[] {
    return element.getElementsByTagName(name);
  }
  classList(element): any[] { return <any[]>Array.prototype.slice.call(element.classList, 0); }
  addClass(element, classname: string) { element.classList.add(classname); }
  removeClass(element, classname: string) { element.classList.remove(classname); }
  hasClass(element, classname: string): boolean { return element.classList.contains(classname); }
  setStyle(element, stylename: string, stylevalue: string) {
    element.style[stylename] = stylevalue;
  }
  removeStyle(element, stylename: string) { element.style[stylename] = null; }
  getStyle(element, stylename: string): string { return element.style[stylename]; }
  tagName(element): string { return element.tagName; }
  attributeMap(element): Map<string, string> {
    var res = new Map<string, string>();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      res.set(attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element, attribute: string): boolean { return element.hasAttribute(attribute); }
  getAttribute(element, attribute: string): string { return element.getAttribute(attribute); }
  setAttribute(element, name: string, value: string) { element.setAttribute(name, value); }
  removeAttribute(element, attribute: string) { element.removeAttribute(attribute); }
  templateAwareRoot(el): any { return this.isTemplateElement(el) ? this.content(el) : el; }
  createHtmlDocument(): HTMLDocument {
    return document.implementation.createHTMLDocument('fakeTitle');
  }
  defaultDoc(): HTMLDocument { return document; }
  getBoundingClientRect(el): any {
    try {
      return el.getBoundingClientRect();
    } catch (e) {
      return {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0};
    }
  }
  getTitle(): string { return document.title; }
  setTitle(newTitle: string) { document.title = newTitle || ''; }
  elementMatches(n, selector: string): boolean {
    var matches = false;
    if (n instanceof HTMLElement) {
      if (n.matches) {
        matches = n.matches(selector);
      } else if (n.msMatchesSelector) {
        matches = n.msMatchesSelector(selector);
      } else if (n.webkitMatchesSelector) {
        matches = n.webkitMatchesSelector(selector);
      }
    }
    return matches;
  }
  isTemplateElement(el: any): boolean {
    return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
  }
  isTextNode(node: Node): boolean { return node.nodeType === Node.TEXT_NODE; }
  isCommentNode(node: Node): boolean { return node.nodeType === Node.COMMENT_NODE; }
  isElementNode(node: Node): boolean { return node.nodeType === Node.ELEMENT_NODE; }
  hasShadowRoot(node): boolean { return node instanceof HTMLElement && isPresent(node.shadowRoot); }
  isShadowRoot(node): boolean { return node instanceof DocumentFragment; }
  importIntoDoc(node: Node): any {
    var toImport = node;
    if (this.isTemplateElement(node)) {
      toImport = this.content(node);
    }
    return document.importNode(toImport, true);
  }
  adoptNode(node: Node): any { return document.adoptNode(node); }
  isPageRule(rule): boolean { return rule.type === CSSRule.PAGE_RULE; }
  isStyleRule(rule): boolean { return rule.type === CSSRule.STYLE_RULE; }
  isMediaRule(rule): boolean { return rule.type === CSSRule.MEDIA_RULE; }
  isKeyframesRule(rule): boolean { return rule.type === CSSRule.KEYFRAMES_RULE; }
  getHref(el: Element): string { return (<any>el).href; }
  getEventKey(event): string {
    var key = event.key;
    if (isBlank(key)) {
      key = event.keyIdentifier;
      // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
      // Safari
      // cf
      // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
      if (isBlank(key)) {
        return 'Unidentified';
      }
      if (key.startsWith('U+')) {
        key = String.fromCharCode(parseInt(key.substring(2), 16));
        if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
          // There is a bug in Chrome for numeric keypad keys:
          // https://code.google.com/p/chromium/issues/detail?id=155654
          // 1, 2, 3 ... are reported as A, B, C ...
          key = _chromeNumKeyPadMap[key];
        }
      }
    }
    if (_keyMap.hasOwnProperty(key)) {
      key = _keyMap[key];
    }
    return key;
  }
  getGlobalEventTarget(target: string): EventTarget {
    if (target == "window") {
      return window;
    } else if (target == "document") {
      return document;
    } else if (target == "body") {
      return document.body;
    }
  }
  getHistory(): History { return window.history; }
  getLocation(): Location { return window.location; }
  getBaseHref(): string {
    var href = getBaseElementHref();
    if (isBlank(href)) {
      return null;
    }
    return relativePath(href);
  }
  resetBaseElement(): void { baseElement = null; }
  getUserAgent(): string { return window.navigator.userAgent; }
  setData(element, name: string, value: string) {
    this.setAttribute(element, 'data-' + name, value);
  }
  getData(element, name: string): string { return this.getAttribute(element, 'data-' + name); }
  getComputedStyle(element): any { return getComputedStyle(element); }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(path: string, value: any) { setValueOnPath(global, path, value); }
  requestAnimationFrame(callback): number { return window.requestAnimationFrame(callback); }
  cancelAnimationFrame(id: number) { window.cancelAnimationFrame(id); }
  performanceNow(): number {
    // performance.now() is not available in all browsers, see
    // http://caniuse.com/#search=performance.now
    if (isPresent(window.performance) && isPresent(window.performance.now)) {
      return window.performance.now();
    } else {
      return DateWrapper.toMillis(DateWrapper.now());
    }
  }
}


var baseElement = null;
function getBaseElementHref(): string {
  if (isBlank(baseElement)) {
    baseElement = document.querySelector('base');
    if (isBlank(baseElement)) {
      return null;
    }
  }
  return baseElement.getAttribute('href');
}

// based on urlUtils.js in AngularJS 1
var urlParsingNode = null;
function relativePath(url): string {
  if (isBlank(urlParsingNode)) {
    urlParsingNode = document.createElement("a");
  }
  urlParsingNode.setAttribute('href', url);
  return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
                                                       '/' + urlParsingNode.pathname;
}
