import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';

export var window = frames.window;
export var DocumentFragment = window.DocumentFragment;
export var Node = window.Node;
export var NodeList = window.NodeList;
export var Text = window.Text;
export var Element = window.HTMLElement;
export var AnchorElement = window.HTMLAnchorElement;
export var TemplateElement = window.HTMLTemplateElement;
export var StyleElement = window.HTMLStyleElement;
export var ShadowRoot = window.ShadowRoot;
export var document = window.document;
export var location = window.location;
export var gc = window.gc ? () => window.gc() : () => null;
export var CssRule = window.CSSRule;
export var CssKeyframesRule = window.CSSKeyframesRule;

export class DOM {
  static query(selector) {
    return document.querySelector(selector);
  }
  static querySelector(el, selector:string):Node {
    return el.querySelector(selector);
  }
  static querySelectorAll(el, selector:string):NodeList {
    return el.querySelectorAll(selector);
  }
  static on(el, evt, listener) {
    el.addEventListener(evt, listener, false);
  }
  static dispatchEvent(el, evt) {
    el.dispatchEvent(evt);
  }
  static createMouseEvent(eventType) {
    var evt = new MouseEvent(eventType);
    evt.initEvent(eventType, true, true);
    return evt;
  }
  static createEvent(eventType) {
    return new Event(eventType, true);
  }
  static getInnerHTML(el) {
    return el.innerHTML;
  }
  static getOuterHTML(el) {
    return el.outerHTML;
  }
  static nodeName(node:Node):string {
    return node.nodeName;
  }
  static nodeValue(node:Node):string {
    return node.nodeValue;
  }
  static type(node:Element):string {
    return node.type;
  }
  static content(node:TemplateElement):Node {
    return node.content;
  }
  static firstChild(el):Node {
    return el.firstChild;
  }
  static nextSibling(el):Node {
    return el.nextSibling;
  }
  static parentElement(el) {
    return el.parentElement;
  }
  static childNodes(el):NodeList {
    return el.childNodes;
  }
  static childNodesAsList(el):List {
    var childNodes = el.childNodes;
    var res = ListWrapper.createFixedSize(childNodes.length);
    for (var i=0; i<childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  static clearNodes(el) {
    el.innerHTML = "";
  }
  static appendChild(el, node) {
    el.appendChild(node);
  }
  static removeChild(el, node) {
    el.removeChild(node);
  }
  static remove(el: Element): Element {
    var parent = el.parentNode;
    parent.removeChild(el);
    return el;
  }
  static insertBefore(el, node) {
    el.parentNode.insertBefore(node, el);
  }
  static insertAllBefore(el, nodes) {
    ListWrapper.forEach(nodes, (n) => {
      el.parentNode.insertBefore(n, el);
    });
  }
  static insertAfter(el, node) {
    el.parentNode.insertBefore(node, el.nextSibling);
  }
  static setInnerHTML(el, value) {
    el.innerHTML = value;
  }
  static getText(el: Element) {
    return el.textContent;
  }
  // TODO(vicb): removed Element type because it does not support StyleElement
  static setText(el, value:string) {
    el.textContent = value;
  }
  static getValue(el: Element) {
    return el.value;
  }
  static setValue(el: Element, value:string) {
    el.value = value;
  }
  static getChecked(el: Element) {
    return el.checked;
  }
  static setChecked(el: Element, value:boolean) {
    el.checked = value;
  }
  static createTemplate(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  static createElement(tagName, doc=document) {
    return doc.createElement(tagName);
  }
  static createTextNode(text: string, doc=document) {
    return doc.createTextNode(text);
  }
  static createScriptTag(attrName:string, attrValue:string, doc=document) {
    var el = doc.createElement("SCRIPT");
    el.setAttribute(attrName, attrValue);
    return el;
  }
  static createStyleElement(css:string, doc=document):StyleElement {
    var style = doc.createElement('STYLE');
    style.innerText = css;
    return style;
  }
  static createShadowRoot(el: Element): ShadowRoot {
    return el.createShadowRoot();
  }
  static getShadowRoot(el: Element): ShadowRoot {
    return el.shadowRoot;
  }
  static clone(node:Node) {
    return node.cloneNode(true);
  }
  static hasProperty(element:Element, name:string) {
    return name in element;
  }
  static getElementsByClassName(element:Element, name:string) {
    return element.getElementsByClassName(name);
  }
  static getElementsByTagName(element:Element, name:string) {
    return element.getElementsByTagName(name);
  }
  static classList(element:Element):List {
    return Array.prototype.slice.call(element.classList, 0);
  }
  static addClass(element:Element, classname:string) {
    element.classList.add(classname);
  }
  static removeClass(element:Element, classname:string) {
    element.classList.remove(classname);
  }
  static hasClass(element:Element, classname:string) {
    return element.classList.contains(classname);
  }
  static setStyle(element:Element, stylename:string, stylevalue:string) {
    element.style[stylename] = stylevalue;
  }
  static removeStyle(element:Element, stylename:string) {
    element.style[stylename] = null;
  }
  static getStyle(element:Element, stylename:string) {
    return element.style[stylename];
  }
  static tagName(element:Element):string {
    return element.tagName;
  }
  static attributeMap(element:Element) {
    var res = MapWrapper.create();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
  }
  static getAttribute(element:Element, attribute:string) {
    return element.getAttribute(attribute);
  }
  static setAttribute(element:Element, name:string, value:string) {
    element.setAttribute(name, value);
  }
  static removeAttribute(element:Element, attribute:string) {
    return element.removeAttribute(attribute);
  }
  static templateAwareRoot(el:Element):Node {
    return el instanceof TemplateElement ? el.content : el;
  }
  static createHtmlDocument() {
    return document.implementation.createHTMLDocument();
  }
  static defaultDoc() {
    return document;
  }
  static elementMatches(n, selector:string):boolean {
    return n instanceof Element && n.matches(selector);
  }
  static isTemplateElement(el:any):boolean {
    return el instanceof TemplateElement;
  }
  static isTextNode(node:Node):boolean {
    return node.nodeType === Node.TEXT_NODE;
  }
  static isElementNode(node:Node):boolean {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  static importIntoDoc(node:Node) {
    return document.importNode(node, true);
  }
}

export class CSSRuleWrapper {
  static isPageRule(rule) {
    return rule.type === CSSRule.PAGE_RULE;
  }
  static isStyleRule(rule) {
    return rule.type === CSSRule.STYLE_RULE;
  }
  static isMediaRule(rule) {
    return rule.type === CSSRule.MEDIA_RULE;
  }
  static isKeyframesRule(rule) {
    return rule.type === CSSRule.KEYFRAMES_RULE;
  }
}
