import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, global} from 'angular2/src/facade/lang';
import {setRootDomAdapter} from './dom_adapter';
import {GenericBrowserDomAdapter} from './generic_browser_adapter';

var _attrToPropMap = {'innerHtml': 'innerHTML', 'readonly': 'readOnly', 'tabindex': 'tabIndex'};

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

export class BrowserDomAdapter extends GenericBrowserDomAdapter {
  static makeCurrent() { setRootDomAdapter(new BrowserDomAdapter()); }

  // TODO(tbosch): move this into a separate environment class once we have it
  logError(error) { window.console.error(error); }

  get attrToPropMap(): any { return _attrToPropMap; }

  query(selector: string): any { return document.querySelector(selector); }
  querySelector(el, selector: string): Node { return el.querySelector(selector); }
  querySelectorAll(el, selector: string): List<any> { return el.querySelectorAll(selector); }
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
  getInnerHTML(el) { return el.innerHTML; }
  getOuterHTML(el) { return el.outerHTML; }
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
  parentElement(el) { return el.parentElement; }
  childNodes(el): List<Node> { return el.childNodes; }
  childNodesAsList(el): List<any> {
    var childNodes = el.childNodes;
    var res = ListWrapper.createFixedSize(childNodes.length);
    for (var i = 0; i < childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  clearNodes(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      this.remove(el.childNodes[i]);
    }
  }
  appendChild(el, node) { el.appendChild(node); }
  removeChild(el, node) { el.removeChild(node); }
  replaceChild(el: Node, newChild, oldChild) { el.replaceChild(newChild, oldChild); }
  remove(el) {
    var parent = el.parentNode;
    parent.removeChild(el);
    return el;
  }
  insertBefore(el, node) { el.parentNode.insertBefore(node, el); }
  insertAllBefore(el, nodes) {
    ListWrapper.forEach(nodes, (n) => { el.parentNode.insertBefore(n, el); });
  }
  insertAfter(el, node) { el.parentNode.insertBefore(node, el.nextSibling); }
  setInnerHTML(el, value) { el.innerHTML = value; }
  getText(el) { return el.textContent; }
  // TODO(vicb): removed Element type because it does not support StyleElement
  setText(el, value: string) { el.textContent = value; }
  getValue(el) { return el.value; }
  setValue(el, value: string) { el.value = value; }
  getChecked(el) { return el.checked; }
  setChecked(el, value: boolean) { el.checked = value; }
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
  clone(node: Node) { return node.cloneNode(true); }
  hasProperty(element, name: string) { return name in element; }
  getElementsByClassName(element, name: string) { return element.getElementsByClassName(name); }
  getElementsByTagName(element, name: string) { return element.getElementsByTagName(name); }
  classList(element): List<any> {
    return <List<any>>Array.prototype.slice.call(element.classList, 0);
  }
  addClass(element, classname: string) { element.classList.add(classname); }
  removeClass(element, classname: string) { element.classList.remove(classname); }
  hasClass(element, classname: string) { return element.classList.contains(classname); }
  setStyle(element, stylename: string, stylevalue: string) {
    element.style[stylename] = stylevalue;
  }
  removeStyle(element, stylename: string) { element.style[stylename] = null; }
  getStyle(element, stylename: string) { return element.style[stylename]; }
  tagName(element): string { return element.tagName; }
  attributeMap(element) {
    var res = MapWrapper.create();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element, attribute: string) { return element.hasAttribute(attribute); }
  getAttribute(element, attribute: string) { return element.getAttribute(attribute); }
  setAttribute(element, name: string, value: string) { element.setAttribute(name, value); }
  removeAttribute(element, attribute: string) { return element.removeAttribute(attribute); }
  templateAwareRoot(el) { return this.isTemplateElement(el) ? this.content(el) : el; }
  createHtmlDocument() { return document.implementation.createHTMLDocument('fakeTitle'); }
  defaultDoc() { return document; }
  getBoundingClientRect(el) {
    try {
      return el.getBoundingClientRect();
    } catch (e) {
      return {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0};
    }
  }
  getTitle(): string { return document.title; }
  setTitle(newTitle: string) { document.title = newTitle || ''; }
  elementMatches(n, selector: string): boolean {
    return n instanceof HTMLElement && n.matches ? n.matches(selector) :
                                                   n.msMatchesSelector(selector);
  }
  isTemplateElement(el: any): boolean {
    return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
  }
  isTextNode(node: Node): boolean { return node.nodeType === Node.TEXT_NODE; }
  isCommentNode(node: Node): boolean { return node.nodeType === Node.COMMENT_NODE; }
  isElementNode(node: Node): boolean { return node.nodeType === Node.ELEMENT_NODE; }
  hasShadowRoot(node): boolean { return node instanceof HTMLElement && isPresent(node.shadowRoot); }
  isShadowRoot(node): boolean { return node instanceof DocumentFragment; }
  importIntoDoc(node: Node) {
    var toImport = node;
    if (this.isTemplateElement(node)) {
      toImport = this.content(node);
    }
    return document.importNode(toImport, true);
  }
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
  getHistory() { return window.history; }
  getLocation() { return window.location; }
  getBaseHref() { return relativePath(document.baseURI); }
  getUserAgent(): string { return window.navigator.userAgent; }
  setData(element, name: string, value: string) { element.dataset[name] = value; }
  getData(element, name: string): string { return element.dataset[name]; }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(name: string, value: any) { global[name] = value; }
}

// based on urlUtils.js in AngularJS 1
var urlParsingNode = null;
function relativePath(url) {
  if (isBlank(urlParsingNode)) {
    urlParsingNode = document.createElement("a");
  }
  urlParsingNode.setAttribute('href', url);
  return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
                                                       '/' + urlParsingNode.pathname;
}
