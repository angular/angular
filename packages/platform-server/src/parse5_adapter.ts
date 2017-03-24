/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const parse5 = require('parse5');

import {ɵglobal as global} from '@angular/core';
import {ɵDomAdapter as DomAdapter, ɵsetRootDomAdapter as setRootDomAdapter, ɵsetValueOnPath as setValueOnPath} from '@angular/platform-browser';
import {SelectorMatcher, CssSelector} from '@angular/compiler';

let treeAdapter: any;

const _attrToPropMap: {[key: string]: string} = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

const mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];

function _notImplemented(methodName: string) {
  return new Error('This method is not implemented in Parse5DomAdapter: ' + methodName);
}

function _getElement(el: any, name: string) {
  for (let i = 0; i < el.childNodes.length; i++) {
    let node = el.childNodes[i];
    if (node.name === name) {
      return node;
    }
  }
  return null;
}

/**
 * Parses a document string to a Document object.
 */
export function parseDocument(html: string) {
  let doc = parse5.parse(html, {treeAdapter: parse5.treeAdapters.htmlparser2});
  let docElement = _getElement(doc, 'html');
  doc['head'] = _getElement(docElement, 'head');
  doc['body'] = _getElement(docElement, 'body');
  doc['_window'] = {};
  return doc;
}


/* tslint:disable:requireParameterType */
/**
 * A `DomAdapter` powered by the `parse5` NodeJS module.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export class Parse5DomAdapter extends DomAdapter {
  static makeCurrent() {
    treeAdapter = parse5.treeAdapters.htmlparser2;
    setRootDomAdapter(new Parse5DomAdapter());
  }

  contains(nodeA: any, nodeB: any): boolean {
    let inner = nodeB;
    while (inner) {
      if (inner === nodeA) return true;
      inner = inner.parent;
    }
    return false;
  }

  hasProperty(element: any, name: string): boolean {
    return _HTMLElementPropertyList.indexOf(name) > -1;
  }
  // TODO(tbosch): don't even call this method when we run the tests on server side
  // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
  setProperty(el: any, name: string, value: any) {
    if (name === 'innerHTML') {
      this.setInnerHTML(el, value);
    } else if (name === 'innerText') {
      this.setText(el, value);
    } else if (name === 'className') {
      el.attribs['class'] = el.className = value;
    } else {
      el[name] = value;
    }
  }
  // TODO(tbosch): don't even call this method when we run the tests on server side
  // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
  getProperty(el: any, name: string): any { return el[name]; }

  logError(error: string) { console.error(error); }

  // tslint:disable-next-line:no-console
  log(error: string) { console.log(error); }

  logGroup(error: string) { console.error(error); }

  logGroupEnd() {}

  get attrToPropMap() { return _attrToPropMap; }

  querySelector(el: any, selector: string): any {
    return this.querySelectorAll(el, selector)[0] || null;
  }

  querySelectorAll(el: any, selector: string): any[] {
    const res: any[] = [];
    const _recursive = (result: any, node: any, selector: any, matcher: any) => {
      const cNodes = node.childNodes;
      if (cNodes && cNodes.length > 0) {
        for (let i = 0; i < cNodes.length; i++) {
          const childNode = cNodes[i];
          if (this.elementMatches(childNode, selector, matcher)) {
            result.push(childNode);
          }
          _recursive(result, childNode, selector, matcher);
        }
      }
    };
    const matcher = new SelectorMatcher();
    matcher.addSelectables(CssSelector.parse(selector));
    _recursive(res, el, selector, matcher);
    return res;
  }
  elementMatches(node: any, selector: string, matcher: any = null): boolean {
    if (this.isElementNode(node) && selector === '*') {
      return true;
    }
    let result = false;
    if (selector && selector.charAt(0) == '#') {
      result = this.getAttribute(node, 'id') == selector.substring(1);
    } else if (selector) {
      if (!matcher) {
        matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(selector));
      }

      const cssSelector = new CssSelector();
      cssSelector.setElement(this.tagName(node));
      if (node.attribs) {
        for (const attrName in node.attribs) {
          cssSelector.addAttribute(attrName, node.attribs[attrName]);
        }
      }
      const classList = this.classList(node);
      for (let i = 0; i < classList.length; i++) {
        cssSelector.addClassName(classList[i]);
      }

      matcher.match(cssSelector, function(selector: any, cb: any) { result = true; });
    }
    return result;
  }
  on(el: any, evt: any, listener: any) {
    let listenersMap: {[k: string]: any} = el._eventListenersMap;
    if (!listenersMap) {
      listenersMap = {};
      el._eventListenersMap = listenersMap;
    }
    const listeners = listenersMap[evt] || [];
    listenersMap[evt] = [...listeners, listener];
  }
  onAndCancel(el: any, evt: any, listener: any): Function {
    this.on(el, evt, listener);
    return () => { remove(<any[]>(el._eventListenersMap[evt]), listener); };
  }
  dispatchEvent(el: any, evt: any) {
    if (!evt.target) {
      evt.target = el;
    }
    if (el._eventListenersMap) {
      const listeners: any = el._eventListenersMap[evt.type];
      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i](evt);
        }
      }
    }
    if (el.parent) {
      this.dispatchEvent(el.parent, evt);
    }
    if (el._window) {
      this.dispatchEvent(el._window, evt);
    }
  }
  createMouseEvent(eventType: any): Event { return this.createEvent(eventType); }
  createEvent(eventType: string): Event {
    const event = <Event>{
      type: eventType,
      defaultPrevented: false,
      preventDefault: () => { (<any>event).defaultPrevented = true; }
    };
    return event;
  }
  preventDefault(event: any) { event.returnValue = false; }
  isPrevented(event: any): boolean { return event.returnValue != null && !event.returnValue; }
  getInnerHTML(el: any): string {
    return parse5.serialize(this.templateAwareRoot(el), {treeAdapter});
  }
  getTemplateContent(el: any): Node|null { return null; }
  getOuterHTML(el: any): string {
    const fragment = treeAdapter.createDocumentFragment();
    this.appendChild(fragment, el);
    return parse5.serialize(fragment, {treeAdapter});
  }
  nodeName(node: any): string { return node.tagName; }
  nodeValue(node: any): string { return node.nodeValue; }
  type(node: any): string { throw _notImplemented('type'); }
  content(node: any): string { return node.childNodes[0]; }
  firstChild(el: any): Node { return el.firstChild; }
  nextSibling(el: any): Node { return el.nextSibling; }
  parentElement(el: any): Node { return el.parent; }
  childNodes(el: any): Node[] { return el.childNodes; }
  childNodesAsList(el: any): any[] {
    const childNodes = el.childNodes;
    const res = new Array(childNodes.length);
    for (let i = 0; i < childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  clearNodes(el: any) {
    while (el.childNodes.length > 0) {
      this.remove(el.childNodes[0]);
    }
  }
  appendChild(el: any, node: any) {
    this.remove(node);
    treeAdapter.appendChild(this.templateAwareRoot(el), node);
  }
  removeChild(el: any, node: any) {
    if (el.childNodes.indexOf(node) > -1) {
      this.remove(node);
    }
  }
  remove(el: any): HTMLElement {
    const parent = el.parent;
    if (parent) {
      const index = parent.childNodes.indexOf(el);
      parent.childNodes.splice(index, 1);
    }
    const prev = el.previousSibling;
    const next = el.nextSibling;
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
    el.prev = null;
    el.next = null;
    el.parent = null;
    return el;
  }
  insertBefore(parent: any, ref: any, newNode: any) {
    this.remove(newNode);
    if (ref) {
      treeAdapter.insertBefore(parent, newNode, ref);
    } else {
      this.appendChild(parent, newNode);
    }
  }
  insertAllBefore(parent: any, ref: any, nodes: any) {
    nodes.forEach((n: any) => this.insertBefore(parent, ref, n));
  }
  insertAfter(parent: any, ref: any, node: any) {
    if (ref.nextSibling) {
      this.insertBefore(parent, ref.nextSibling, node);
    } else {
      this.appendChild(parent, node);
    }
  }
  setInnerHTML(el: any, value: any) {
    this.clearNodes(el);
    const content = parse5.parseFragment(value, {treeAdapter});
    for (let i = 0; i < content.childNodes.length; i++) {
      treeAdapter.appendChild(el, content.childNodes[i]);
    }
  }
  getText(el: any, isRecursive?: boolean): string {
    if (this.isTextNode(el)) {
      return el.data;
    }

    if (this.isCommentNode(el)) {
      // In the DOM, comments within an element return an empty string for textContent
      // However, comment node instances return the comment content for textContent getter
      return isRecursive ? '' : el.data;
    }

    if (!el.childNodes || el.childNodes.length == 0) {
      return '';
    }

    let textContent = '';
    for (let i = 0; i < el.childNodes.length; i++) {
      textContent += this.getText(el.childNodes[i], true);
    }
    return textContent;
  }

  setText(el: any, value: string) {
    if (this.isTextNode(el) || this.isCommentNode(el)) {
      el.data = value;
    } else {
      this.clearNodes(el);
      if (value !== '') treeAdapter.insertText(el, value);
    }
  }
  getValue(el: any): string { return el.value; }
  setValue(el: any, value: string) { el.value = value; }
  getChecked(el: any): boolean { return el.checked; }
  setChecked(el: any, value: boolean) { el.checked = value; }
  createComment(text: string): Comment { return treeAdapter.createCommentNode(text); }
  createTemplate(html: any): HTMLElement {
    const template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
    const content = parse5.parseFragment(html, {treeAdapter});
    treeAdapter.setTemplateContent(template, content);
    return template;
  }
  createElement(tagName: any): HTMLElement {
    return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
  }
  createElementNS(ns: any, tagName: any): HTMLElement {
    return treeAdapter.createElement(tagName, ns, []);
  }
  createTextNode(text: string): Text {
    const t = <any>this.createComment(text);
    t.type = 'text';
    return t;
  }
  createScriptTag(attrName: string, attrValue: string): HTMLElement {
    return treeAdapter.createElement(
        'script', 'http://www.w3.org/1999/xhtml', [{name: attrName, value: attrValue}]);
  }
  createStyleElement(css: string): HTMLStyleElement {
    const style = this.createElement('style');
    this.setText(style, css);
    return <HTMLStyleElement>style;
  }
  createShadowRoot(el: any): HTMLElement {
    el.shadowRoot = treeAdapter.createDocumentFragment();
    el.shadowRoot.parent = el;
    return el.shadowRoot;
  }
  getShadowRoot(el: any): Element { return el.shadowRoot; }
  getHost(el: any): string { return el.host; }
  getDistributedNodes(el: any): Node[] { throw _notImplemented('getDistributedNodes'); }
  clone(node: Node): Node {
    const _recursive = (node: any) => {
      const nodeClone = Object.create(Object.getPrototypeOf(node));
      for (const prop in node) {
        const desc = Object.getOwnPropertyDescriptor(node, prop);
        if (desc && 'value' in desc && typeof desc.value !== 'object') {
          nodeClone[prop] = node[prop];
        }
      }
      nodeClone.parent = null;
      nodeClone.prev = null;
      nodeClone.next = null;
      nodeClone.children = null;

      mapProps.forEach(mapName => {
        if (node[mapName] != null) {
          nodeClone[mapName] = {};
          for (const prop in node[mapName]) {
            nodeClone[mapName][prop] = node[mapName][prop];
          }
        }
      });
      const cNodes = node.children;
      if (cNodes) {
        const cNodesClone = new Array(cNodes.length);
        for (let i = 0; i < cNodes.length; i++) {
          const childNode = cNodes[i];
          const childNodeClone = _recursive(childNode);
          cNodesClone[i] = childNodeClone;
          if (i > 0) {
            childNodeClone.prev = cNodesClone[i - 1];
            cNodesClone[i - 1].next = childNodeClone;
          }
          childNodeClone.parent = nodeClone;
        }
        nodeClone.children = cNodesClone;
      }
      return nodeClone;
    };
    return _recursive(node);
  }
  getElementsByClassName(element: any, name: string): HTMLElement[] {
    return this.querySelectorAll(element, '.' + name);
  }
  getElementsByTagName(element: any, name: string): HTMLElement[] {
    return this.querySelectorAll(element, name);
  }
  classList(element: any): string[] {
    let classAttrValue: any = null;
    const attributes = element.attribs;

    if (attributes && attributes['class'] != null) {
      classAttrValue = attributes['class'];
    }
    return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
  }
  addClass(element: any, className: string) {
    const classList = this.classList(element);
    const index = classList.indexOf(className);
    if (index == -1) {
      classList.push(className);
      element.attribs['class'] = element.className = classList.join(' ');
    }
  }
  removeClass(element: any, className: string) {
    const classList = this.classList(element);
    const index = classList.indexOf(className);
    if (index > -1) {
      classList.splice(index, 1);
      element.attribs['class'] = element.className = classList.join(' ');
    }
  }
  hasClass(element: any, className: string): boolean {
    return this.classList(element).indexOf(className) > -1;
  }
  hasStyle(element: any, styleName: string, styleValue?: string): boolean {
    const value = this.getStyle(element, styleName) || '';
    return styleValue ? value == styleValue : value.length > 0;
  }
  /** @internal */
  _readStyleAttribute(element: any) {
    const styleMap = {};
    const attributes = element.attribs;
    if (attributes && attributes['style'] != null) {
      const styleAttrValue = attributes['style'];
      const styleList = styleAttrValue.split(/;+/g);
      for (let i = 0; i < styleList.length; i++) {
        if (styleList[i].length > 0) {
          const style = styleList[i] as string;
          const colon = style.indexOf(':');
          if (colon === -1) {
            throw new Error(`Invalid CSS style: ${style}`);
          }
          (styleMap as any)[style.substr(0, colon).trim()] = style.substr(colon + 1).trim();
        }
      }
    }
    return styleMap;
  }
  /** @internal */
  _writeStyleAttribute(element: any, styleMap: any) {
    let styleAttrValue = '';
    for (const key in styleMap) {
      const newValue = styleMap[key];
      if (newValue) {
        styleAttrValue += key + ':' + styleMap[key] + ';';
      }
    }
    element.attribs['style'] = styleAttrValue;
  }
  setStyle(element: any, styleName: string, styleValue?: string|null) {
    const styleMap = this._readStyleAttribute(element);
    (styleMap as any)[styleName] = styleValue;
    this._writeStyleAttribute(element, styleMap);
  }
  removeStyle(element: any, styleName: string) { this.setStyle(element, styleName, null); }
  getStyle(element: any, styleName: string): string {
    const styleMap = this._readStyleAttribute(element);
    return styleMap.hasOwnProperty(styleName) ? (styleMap as any)[styleName] : '';
  }
  tagName(element: any): string { return element.tagName == 'style' ? 'STYLE' : element.tagName; }
  attributeMap(element: any): Map<string, string> {
    const res = new Map<string, string>();
    const elAttrs = treeAdapter.getAttrList(element);
    for (let i = 0; i < elAttrs.length; i++) {
      const attrib = elAttrs[i];
      res.set(attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element: any, attribute: string): boolean {
    return element.attribs && element.attribs[attribute] != null;
  }
  hasAttributeNS(element: any, ns: string, attribute: string): boolean {
    return this.hasAttribute(element, attribute);
  }
  getAttribute(element: any, attribute: string): string {
    return this.hasAttribute(element, attribute) ? element.attribs[attribute] : null;
  }
  getAttributeNS(element: any, ns: string, attribute: string): string {
    return this.getAttribute(element, attribute);
  }
  setAttribute(element: any, attribute: string, value: string) {
    if (attribute) {
      element.attribs[attribute] = value;
      if (attribute === 'class') {
        element.className = value;
      }
    }
  }
  setAttributeNS(element: any, ns: string, attribute: string, value: string) {
    this.setAttribute(element, attribute, value);
  }
  removeAttribute(element: any, attribute: string) {
    if (attribute) {
      delete element.attribs[attribute];
    }
  }
  removeAttributeNS(element: any, ns: string, name: string) { throw 'not implemented'; }
  templateAwareRoot(el: any): any {
    return this.isTemplateElement(el) ? treeAdapter.getTemplateContent(el) : el;
  }
  createHtmlDocument(): Document {
    const newDoc = treeAdapter.createDocument();
    newDoc.title = 'fakeTitle';
    const head = treeAdapter.createElement('head', null, []);
    const body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
    this.appendChild(newDoc, head);
    this.appendChild(newDoc, body);
    newDoc['head'] = head;
    newDoc['body'] = body;
    newDoc['_window'] = {};
    return newDoc;
  }
  getBoundingClientRect(el: any): any { return {left: 0, top: 0, width: 0, height: 0}; }
  getTitle(doc: Document): string { return this.getText(this.getTitleNode(doc)) || ''; }
  setTitle(doc: Document, newTitle: string) {
    this.setText(this.getTitleNode(doc), newTitle || '');
  }
  isTemplateElement(el: any): boolean {
    return this.isElementNode(el) && this.tagName(el) === 'template';
  }
  isTextNode(node: any): boolean { return treeAdapter.isTextNode(node); }
  isCommentNode(node: any): boolean { return treeAdapter.isCommentNode(node); }
  isElementNode(node: any): boolean { return node ? treeAdapter.isElementNode(node) : false; }
  hasShadowRoot(node: any): boolean { return node.shadowRoot != null; }
  isShadowRoot(node: any): boolean { return this.getShadowRoot(node) == node; }
  importIntoDoc(node: any): any { return this.clone(node); }
  adoptNode(node: any): any { return node; }
  getHref(el: any): string { return this.getAttribute(el, 'href'); }
  resolveAndSetHref(el: any, baseUrl: string, href: string) {
    if (href == null) {
      el.href = baseUrl;
    } else {
      el.href = baseUrl + '/../' + href;
    }
  }
  /** @internal */
  _buildRules(parsedRules: any, css?: any) {
    const rules: any[] = [];
    for (let i = 0; i < parsedRules.length; i++) {
      const parsedRule = parsedRules[i];
      const rule: {[key: string]: any} = {};
      rule['cssText'] = css;
      rule['style'] = {content: '', cssText: ''};
      if (parsedRule.type == 'rule') {
        rule['type'] = 1;

        rule['selectorText'] =
            parsedRule.selectors.join(', '.replace(/\s{2,}/g, ' ')
                                          .replace(/\s*~\s*/g, ' ~ ')
                                          .replace(/\s*\+\s*/g, ' + ')
                                          .replace(/\s*>\s*/g, ' > ')
                                          .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
        if (parsedRule.declarations == null) {
          continue;
        }
        for (let j = 0; j < parsedRule.declarations.length; j++) {
          const declaration = parsedRule.declarations[j];
          rule['style'] = declaration.property[declaration.value];
          rule['style'].cssText += declaration.property + ': ' + declaration.value + ';';
        }
      } else if (parsedRule.type == 'media') {
        rule['type'] = 4;
        rule['media'] = {mediaText: parsedRule.media};
        if (parsedRule.rules) {
          rule['cssRules'] = this._buildRules(parsedRule.rules);
        }
      }
      rules.push(rule);
    }
    return rules;
  }
  supportsDOMEvents(): boolean { return false; }
  supportsNativeShadowDOM(): boolean { return false; }
  getGlobalEventTarget(doc: Document, target: string): any {
    if (target == 'window') {
      return (<any>doc)._window;
    } else if (target == 'document') {
      return doc;
    } else if (target == 'body') {
      return doc.body;
    }
  }
  getBaseHref(doc: Document): string|null {
    const base = this.querySelector(doc, 'base');
    let href = '';
    if (base) {
      href = this.getHref(base);
    }
    // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
    return href == null ? null : href;
  }
  resetBaseElement(): void { throw 'not implemented'; }
  getHistory(): History { throw 'not implemented'; }
  getLocation(): Location { throw 'not implemented'; }
  getUserAgent(): string { return 'Fake user agent'; }
  getData(el: any, name: string): string { return this.getAttribute(el, 'data-' + name); }
  getComputedStyle(el: any): any { throw 'not implemented'; }
  setData(el: any, name: string, value: string) { this.setAttribute(el, 'data-' + name, value); }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(path: string, value: any) { setValueOnPath(global, path, value); }
  supportsWebAnimation(): boolean { return false; }
  performanceNow(): number { return Date.now(); }
  getAnimationPrefix(): string { return ''; }
  getTransitionEnd(): string { return 'transitionend'; }
  supportsAnimation(): boolean { return true; }

  replaceChild(el: any, newNode: any, oldNode: any) { throw new Error('not implemented'); }
  parse(templateHtml: string) { throw new Error('not implemented'); }
  invoke(el: Element, methodName: string, args: any[]): any { throw new Error('not implemented'); }
  getEventKey(event: any): string { throw new Error('not implemented'); }

  supportsCookies(): boolean { return false; }
  getCookie(name: string): string { throw new Error('not implemented'); }
  setCookie(name: string, value: string) { throw new Error('not implemented'); }
  animate(element: any, keyframes: any[], options: any): any { throw new Error('not implemented'); }
  private getTitleNode(doc: Document) {
    let title = this.querySelector(doc, 'title');

    if (!title) {
      title = <HTMLTitleElement>this.createElement('title');
      this.appendChild(this.querySelector(doc, 'head'), title);
    }

    return title;
  }
}

// TODO: build a proper list, this one is all the keys of a HTMLInputElement
const _HTMLElementPropertyList = [
  'webkitEntries',
  'incremental',
  'webkitdirectory',
  'selectionDirection',
  'selectionEnd',
  'selectionStart',
  'labels',
  'validationMessage',
  'validity',
  'willValidate',
  'width',
  'valueAsNumber',
  'valueAsDate',
  'value',
  'useMap',
  'defaultValue',
  'type',
  'step',
  'src',
  'size',
  'required',
  'readOnly',
  'placeholder',
  'pattern',
  'name',
  'multiple',
  'min',
  'minLength',
  'maxLength',
  'max',
  'list',
  'indeterminate',
  'height',
  'formTarget',
  'formNoValidate',
  'formMethod',
  'formEnctype',
  'formAction',
  'files',
  'form',
  'disabled',
  'dirName',
  'checked',
  'defaultChecked',
  'autofocus',
  'autocomplete',
  'alt',
  'align',
  'accept',
  'onautocompleteerror',
  'onautocomplete',
  'onwaiting',
  'onvolumechange',
  'ontoggle',
  'ontimeupdate',
  'onsuspend',
  'onsubmit',
  'onstalled',
  'onshow',
  'onselect',
  'onseeking',
  'onseeked',
  'onscroll',
  'onresize',
  'onreset',
  'onratechange',
  'onprogress',
  'onplaying',
  'onplay',
  'onpause',
  'onmousewheel',
  'onmouseup',
  'onmouseover',
  'onmouseout',
  'onmousemove',
  'onmouseleave',
  'onmouseenter',
  'onmousedown',
  'onloadstart',
  'onloadedmetadata',
  'onloadeddata',
  'onload',
  'onkeyup',
  'onkeypress',
  'onkeydown',
  'oninvalid',
  'oninput',
  'onfocus',
  'onerror',
  'onended',
  'onemptied',
  'ondurationchange',
  'ondrop',
  'ondragstart',
  'ondragover',
  'ondragleave',
  'ondragenter',
  'ondragend',
  'ondrag',
  'ondblclick',
  'oncuechange',
  'oncontextmenu',
  'onclose',
  'onclick',
  'onchange',
  'oncanplaythrough',
  'oncanplay',
  'oncancel',
  'onblur',
  'onabort',
  'spellcheck',
  'isContentEditable',
  'contentEditable',
  'outerText',
  'innerText',
  'accessKey',
  'hidden',
  'webkitdropzone',
  'draggable',
  'tabIndex',
  'dir',
  'translate',
  'lang',
  'title',
  'childElementCount',
  'lastElementChild',
  'firstElementChild',
  'children',
  'onwebkitfullscreenerror',
  'onwebkitfullscreenchange',
  'nextElementSibling',
  'previousElementSibling',
  'onwheel',
  'onselectstart',
  'onsearch',
  'onpaste',
  'oncut',
  'oncopy',
  'onbeforepaste',
  'onbeforecut',
  'onbeforecopy',
  'shadowRoot',
  'dataset',
  'classList',
  'className',
  'outerHTML',
  'innerHTML',
  'scrollHeight',
  'scrollWidth',
  'scrollTop',
  'scrollLeft',
  'clientHeight',
  'clientWidth',
  'clientTop',
  'clientLeft',
  'offsetParent',
  'offsetHeight',
  'offsetWidth',
  'offsetTop',
  'offsetLeft',
  'localName',
  'prefix',
  'namespaceURI',
  'id',
  'style',
  'attributes',
  'tagName',
  'parentElement',
  'textContent',
  'baseURI',
  'ownerDocument',
  'nextSibling',
  'previousSibling',
  'lastChild',
  'firstChild',
  'childNodes',
  'parentNode',
  'nodeType',
  'nodeValue',
  'nodeName',
  'closure_lm_714617',
  '__jsaction',
];

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
