import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import {setRootDomAdapter} from './dom_adapter';
import {GenericBrowserDomAdapter} from './generic_browser_adapter';

var _attrToPropMap = {
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex'
};

export class BrowserDomAdapter extends GenericBrowserDomAdapter {
  static makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }

  get attrToPropMap() {
    return _attrToPropMap;
  }

  query(selector:string) {
    return document.querySelector(selector);
  }
  querySelector(el, selector:string):Node {
    return el.querySelector(selector);
  }
  querySelectorAll(el, selector:string):NodeList {
    return el.querySelectorAll(selector);
  }
  on(el, evt, listener) {
    el.addEventListener(evt, listener, false);
  }
  dispatchEvent(el, evt) {
    el.dispatchEvent(evt);
  }
  createMouseEvent(eventType) {
    var evt = new MouseEvent(eventType);
    evt.initEvent(eventType, true, true);
    return evt;
  }
  createEvent(eventType) {
    return new Event(eventType, true);
  }
  getInnerHTML(el) {
    return el.innerHTML;
  }
  getOuterHTML(el) {
    return el.outerHTML;
  }
  nodeName(node:Node):string {
    return node.nodeName;
  }
  nodeValue(node:Node):string {
    return node.nodeValue;
  }
  type(node:string) {
    return node.type;
  }
  content(node:HTMLTemplateElement):Node {
    return node.content;
  }
  firstChild(el):Node {
    return el.firstChild;
  }
  nextSibling(el):Node {
    return el.nextSibling;
  }
  parentElement(el) {
    return el.parentElement;
  }
  childNodes(el):NodeList {
    return el.childNodes;
  }
  childNodesAsList(el):List {
    var childNodes = el.childNodes;
    var res = ListWrapper.createFixedSize(childNodes.length);
    for (var i=0; i<childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  clearNodes(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      this.remove(el.childNodes[i]);
    }
  }
  appendChild(el, node) {
    el.appendChild(node);
  }
  removeChild(el, node) {
    el.removeChild(node);
  }
  replaceChild(el: Node, newChild, oldChild) {
    el.replaceChild(newChild, oldChild);
  }
  remove(el) {
    var parent = el.parentNode;
    parent.removeChild(el);
    return el;
  }
  insertBefore(el, node) {
    el.parentNode.insertBefore(node, el);
  }
  insertAllBefore(el, nodes) {
    ListWrapper.forEach(nodes, (n) => {
      el.parentNode.insertBefore(n, el);
    });
  }
  insertAfter(el, node) {
    el.parentNode.insertBefore(node, el.nextSibling);
  }
  setInnerHTML(el, value) {
    el.innerHTML = value;
  }
  getText(el) {
    return el.textContent;
  }
  // TODO(vicb): removed Element type because it does not support StyleElement
  setText(el, value:string) {
    el.textContent = value;
  }
  getValue(el) {
    return el.value;
  }
  setValue(el, value:string) {
    el.value = value;
  }
  getChecked(el) {
    return el.checked;
  }
  setChecked(el, value:boolean) {
    el.checked = value;
  }
  createTemplate(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  createElement(tagName, doc=document) {
    return doc.createElement(tagName);
  }
  createTextNode(text: string, doc=document) {
    return doc.createTextNode(text);
  }
  createScriptTag(attrName:string, attrValue:string, doc=document) {
    var el = doc.createElement('SCRIPT');
    el.setAttribute(attrName, attrValue);
    return el;
  }
  createStyleElement(css:string, doc=document):HTMLStyleElement {
    var style = doc.createElement('STYLE');
    style.innerText = css;
    return style;
  }
  createShadowRoot(el:HTMLElement): ShadowRoot {
    return el.createShadowRoot();
  }
  getShadowRoot(el:HTMLElement): ShadowRoot {
    return el.shadowRoot;
  }
  clone(node:Node) {
    return node.cloneNode(true);
  }
  hasProperty(element, name:string) {
    return name in element;
  }
  getElementsByClassName(element, name:string) {
    return element.getElementsByClassName(name);
  }
  getElementsByTagName(element, name:string) {
    return element.getElementsByTagName(name);
  }
  classList(element):List {
    return Array.prototype.slice.call(element.classList, 0);
  }
  addClass(element, classname:string) {
    element.classList.add(classname);
  }
  removeClass(element, classname:string) {
    element.classList.remove(classname);
  }
  hasClass(element, classname:string) {
    return element.classList.contains(classname);
  }
  setStyle(element, stylename:string, stylevalue:string) {
    element.style[stylename] = stylevalue;
  }
  removeStyle(element, stylename:string) {
    element.style[stylename] = null;
  }
  getStyle(element, stylename:string) {
    return element.style[stylename];
  }
  tagName(element):string {
    return element.tagName;
  }
  attributeMap(element) {
    var res = MapWrapper.create();
    var elAttrs = element.attributes;
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
  }
  getAttribute(element, attribute:string) {
    return element.getAttribute(attribute);
  }
  setAttribute(element, name:string, value:string) {
    element.setAttribute(name, value);
  }
  removeAttribute(element, attribute:string) {
    return element.removeAttribute(attribute);
  }
  templateAwareRoot(el) {
    return el instanceof HTMLTemplateElement ? el.content : el;
  }
  createHtmlDocument() {
    return document.implementation.createHTMLDocument();
  }
  defaultDoc() {
    return document;
  }
  getTitle() {
    return document.title;
  }
  setTitle(newTitle:string) {
    document.title = newTitle;
  }
  elementMatches(n, selector:string):boolean {
    return n instanceof HTMLElement && n.matches(selector);
  }
  isTemplateElement(el:any):boolean {
    return el instanceof HTMLTemplateElement;
  }
  isTextNode(node:Node):boolean {
    return node.nodeType === Node.TEXT_NODE;
  }
  isCommentNode(node:Node):boolean {
    return node.nodeType === Node.COMMENT_NODE;
  }
  isElementNode(node:Node):boolean {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  hasShadowRoot(node):boolean {
    return node instanceof HTMLElement && isPresent(node.shadowRoot);
  }
  importIntoDoc(node:Node) {
    var result = document.importNode(node, true);
    // Workaround WebKit https://bugs.webkit.org/show_bug.cgi?id=137619
    if (this.isTemplateElement(result) &&
        !result.content.childNodes.length && node.content.childNodes.length) {
      var childNodes = node.content.childNodes;
      for (var i = 0; i < childNodes.length; ++i) {
        result.content.appendChild(
            this.importIntoDoc(childNodes[i]));
      }
    }
    return result;
  }
  isPageRule(rule): boolean {
    return rule.type === CSSRule.PAGE_RULE;
  }
  isStyleRule(rule): boolean {
    return rule.type === CSSRule.STYLE_RULE;
  }
  isMediaRule(rule): boolean {
    return rule.type === CSSRule.MEDIA_RULE;
  }
  isKeyframesRule(rule): boolean {
    return rule.type === CSSRule.KEYFRAMES_RULE;
  }
  getHref(el:Element): string {
    return el.href;
  }
}
