var parse5 = require('parse5/index');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;

import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DomAdapter, setRootDomAdapter} from 'angular2/platform/common_dom';
import {
  isPresent,
  isBlank,
  global,
  Type,
  setValueOnPath,
  DateWrapper
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {SelectorMatcher, CssSelector} from 'angular2/src/compiler/selector';
import {XHR} from 'angular2/src/compiler/xhr';

var _attrToPropMap: {[key: string]: string} = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};
var defDoc = null;

var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];

function _notImplemented(methodName) {
  return new BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}

/* tslint:disable:requireParameterType */
export class Parse5DomAdapter extends DomAdapter {
  static makeCurrent() { setRootDomAdapter(new Parse5DomAdapter()); }

  hasProperty(element, name: string): boolean {
    return _HTMLElementPropertyList.indexOf(name) > -1;
  }
  // TODO(tbosch): don't even call this method when we run the tests on server side
  // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
  setProperty(el: /*element*/ any, name: string, value: any) {
    if (name === 'innerHTML') {
      this.setInnerHTML(el, value);
    } else if (name === 'className') {
      el.attribs["class"] = el.className = value;
    } else {
      el[name] = value;
    }
  }
  // TODO(tbosch): don't even call this method when we run the tests on server side
  // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
  getProperty(el: /*element*/ any, name: string): any { return el[name]; }

  logError(error) { console.error(error); }

  log(error) { console.log(error); }

  logGroup(error) { console.error(error); }

  logGroupEnd() {}

  getXHR(): Type { return XHR; }

  get attrToPropMap() { return _attrToPropMap; }

  query(selector) { throw _notImplemented('query'); }
  querySelector(el, selector: string): any { return this.querySelectorAll(el, selector)[0]; }
  querySelectorAll(el, selector: string): any[] {
    var res = [];
    var _recursive = (result, node, selector, matcher) => {
      var cNodes = node.childNodes;
      if (cNodes && cNodes.length > 0) {
        for (var i = 0; i < cNodes.length; i++) {
          var childNode = cNodes[i];
          if (this.elementMatches(childNode, selector, matcher)) {
            result.push(childNode);
          }
          _recursive(result, childNode, selector, matcher);
        }
      }
    };
    var matcher = new SelectorMatcher();
    matcher.addSelectables(CssSelector.parse(selector));
    _recursive(res, el, selector, matcher);
    return res;
  }
  elementMatches(node, selector: string, matcher = null): boolean {
    if (this.isElementNode(node) && selector === '*') {
      return true;
    }
    var result = false;
    if (selector && selector.charAt(0) == "#") {
      result = this.getAttribute(node, 'id') == selector.substring(1);
    } else if (selector) {
      var result = false;
      if (matcher == null) {
        matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(selector));
      }

      var cssSelector = new CssSelector();
      cssSelector.setElement(this.tagName(node));
      if (node.attribs) {
        for (var attrName in node.attribs) {
          cssSelector.addAttribute(attrName, node.attribs[attrName]);
        }
      }
      var classList = this.classList(node);
      for (var i = 0; i < classList.length; i++) {
        cssSelector.addClassName(classList[i]);
      }

      matcher.match(cssSelector, function(selector, cb) { result = true; });
    }
    return result;
  }
  on(el, evt, listener) {
    var listenersMap: {[k: /*any*/ string]: any} = el._eventListenersMap;
    if (isBlank(listenersMap)) {
      var listenersMap: {[k: /*any*/ string]: any} = StringMapWrapper.create();
      el._eventListenersMap = listenersMap;
    }
    var listeners = StringMapWrapper.get(listenersMap, evt);
    if (isBlank(listeners)) {
      listeners = [];
    }
    listeners.push(listener);
    StringMapWrapper.set(listenersMap, evt, listeners);
  }
  onAndCancel(el, evt, listener): Function {
    this.on(el, evt, listener);
    return () => {
      ListWrapper.remove(StringMapWrapper.get<any[]>(el._eventListenersMap, evt), listener);
    };
  }
  dispatchEvent(el, evt) {
    if (isBlank(evt.target)) {
      evt.target = el;
    }
    if (isPresent(el._eventListenersMap)) {
      var listeners: any = StringMapWrapper.get(el._eventListenersMap, evt.type);
      if (isPresent(listeners)) {
        for (var i = 0; i < listeners.length; i++) {
          listeners[i](evt);
        }
      }
    }
    if (isPresent(el.parent)) {
      this.dispatchEvent(el.parent, evt);
    }
    if (isPresent(el._window)) {
      this.dispatchEvent(el._window, evt);
    }
  }
  createMouseEvent(eventType): Event { return this.createEvent(eventType); }
  createEvent(eventType: string): Event {
    var evt = <Event>{
      type: eventType,
      defaultPrevented: false,
      preventDefault: () => { (<any>evt).defaultPrevented = true; }
    };
    return evt;
  }
  preventDefault(evt) { evt.returnValue = false; }
  isPrevented(evt): boolean { return isPresent(evt.returnValue) && !evt.returnValue; }
  getInnerHTML(el): string { return serializer.serialize(this.templateAwareRoot(el)); }
  getOuterHTML(el): string {
    serializer.html = '';
    serializer._serializeElement(el);
    return serializer.html;
  }
  nodeName(node): string { return node.tagName; }
  nodeValue(node): string { return node.nodeValue; }
  type(node: any): string { throw _notImplemented('type'); }
  content(node): string { return node.childNodes[0]; }
  firstChild(el): Node { return el.firstChild; }
  nextSibling(el): Node { return el.nextSibling; }
  parentElement(el): Node { return el.parent; }
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
    while (el.childNodes.length > 0) {
      this.remove(el.childNodes[0]);
    }
  }
  appendChild(el, node) {
    this.remove(node);
    treeAdapter.appendChild(this.templateAwareRoot(el), node);
  }
  removeChild(el, node) {
    if (ListWrapper.contains(el.childNodes, node)) {
      this.remove(node);
    }
  }
  remove(el): HTMLElement {
    var parent = el.parent;
    if (parent) {
      var index = parent.childNodes.indexOf(el);
      parent.childNodes.splice(index, 1);
    }
    var prev = el.previousSibling;
    var next = el.nextSibling;
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
  insertBefore(el, node) {
    this.remove(node);
    treeAdapter.insertBefore(el.parent, node, el);
  }
  insertAllBefore(el, nodes) { nodes.forEach(n => this.insertBefore(el, n)); }
  insertAfter(el, node) {
    if (el.nextSibling) {
      this.insertBefore(el.nextSibling, node);
    } else {
      this.appendChild(el.parent, node);
    }
  }
  setInnerHTML(el, value) {
    this.clearNodes(el);
    var content = parser.parseFragment(value);
    for (var i = 0; i < content.childNodes.length; i++) {
      treeAdapter.appendChild(el, content.childNodes[i]);
    }
  }
  getText(el, isRecursive?: boolean): string {
    if (this.isTextNode(el)) {
      return el.data;
    } else if (this.isCommentNode(el)) {
      // In the DOM, comments within an element return an empty string for textContent
      // However, comment node instances return the comment content for textContent getter
      return isRecursive ? '' : el.data;
    } else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
      return "";
    } else {
      var textContent = "";
      for (var i = 0; i < el.childNodes.length; i++) {
        textContent += this.getText(el.childNodes[i], true);
      }
      return textContent;
    }
  }
  setText(el, value: string) {
    if (this.isTextNode(el) || this.isCommentNode(el)) {
      el.data = value;
    } else {
      this.clearNodes(el);
      if (value !== '') treeAdapter.insertText(el, value);
    }
  }
  getValue(el): string { return el.value; }
  setValue(el, value: string) { el.value = value; }
  getChecked(el): boolean { return el.checked; }
  setChecked(el, value: boolean) { el.checked = value; }
  createComment(text: string): Comment { return treeAdapter.createCommentNode(text); }
  createTemplate(html): HTMLElement {
    var template = treeAdapter.createElement("template", 'http://www.w3.org/1999/xhtml', []);
    var content = parser.parseFragment(html);
    treeAdapter.appendChild(template, content);
    return template;
  }
  createElement(tagName): HTMLElement {
    return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
  }
  createElementNS(ns, tagName): HTMLElement { return treeAdapter.createElement(tagName, ns, []); }
  createTextNode(text: string): Text {
    var t = <any>this.createComment(text);
    t.type = 'text';
    return t;
  }
  createScriptTag(attrName: string, attrValue: string): HTMLElement {
    return treeAdapter.createElement("script", 'http://www.w3.org/1999/xhtml',
                                     [{name: attrName, value: attrValue}]);
  }
  createStyleElement(css: string): HTMLStyleElement {
    var style = this.createElement('style');
    this.setText(style, css);
    return <HTMLStyleElement>style;
  }
  createShadowRoot(el): HTMLElement {
    el.shadowRoot = treeAdapter.createDocumentFragment();
    el.shadowRoot.parent = el;
    return el.shadowRoot;
  }
  getShadowRoot(el): Element { return el.shadowRoot; }
  getHost(el): string { return el.host; }
  getDistributedNodes(el: any): Node[] { throw _notImplemented('getDistributedNodes'); }
  clone(node: Node): Node {
    var _recursive = (node) => {
      var nodeClone = Object.create(Object.getPrototypeOf(node));
      for (var prop in node) {
        var desc = Object.getOwnPropertyDescriptor(node, prop);
        if (desc && 'value' in desc && typeof desc.value !== 'object') {
          nodeClone[prop] = node[prop];
        }
      }
      nodeClone.parent = null;
      nodeClone.prev = null;
      nodeClone.next = null;
      nodeClone.children = null;

      mapProps.forEach(mapName => {
        if (isPresent(node[mapName])) {
          nodeClone[mapName] = {};
          for (var prop in node[mapName]) {
            nodeClone[mapName][prop] = node[mapName][prop];
          }
        }
      });
      var cNodes = node.children;
      if (cNodes) {
        var cNodesClone = new Array(cNodes.length);
        for (var i = 0; i < cNodes.length; i++) {
          var childNode = cNodes[i];
          var childNodeClone = _recursive(childNode);
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
  getElementsByClassName(element, name: string): HTMLElement[] {
    return this.querySelectorAll(element, "." + name);
  }
  getElementsByTagName(element: any, name: string): HTMLElement[] {
    throw _notImplemented('getElementsByTagName');
  }
  classList(element): string[] {
    var classAttrValue = null;
    var attributes = element.attribs;
    if (attributes && attributes.hasOwnProperty("class")) {
      classAttrValue = attributes["class"];
    }
    return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
  }
  addClass(element, className: string) {
    var classList = this.classList(element);
    var index = classList.indexOf(className);
    if (index == -1) {
      classList.push(className);
      element.attribs["class"] = element.className = classList.join(" ");
    }
  }
  removeClass(element, className: string) {
    var classList = this.classList(element);
    var index = classList.indexOf(className);
    if (index > -1) {
      classList.splice(index, 1);
      element.attribs["class"] = element.className = classList.join(" ");
    }
  }
  hasClass(element, className: string): boolean {
    return ListWrapper.contains(this.classList(element), className);
  }
  hasStyle(element, styleName: string, styleValue: string = null): boolean {
    var value = this.getStyle(element, styleName) || '';
    return styleValue ? value == styleValue : value.length > 0;
  }
  /** @internal */
  _readStyleAttribute(element) {
    var styleMap = {};
    var attributes = element.attribs;
    if (attributes && attributes.hasOwnProperty("style")) {
      var styleAttrValue = attributes["style"];
      var styleList = styleAttrValue.split(/;+/g);
      for (var i = 0; i < styleList.length; i++) {
        if (styleList[i].length > 0) {
          var elems = styleList[i].split(/:+/g);
          styleMap[elems[0].trim()] = elems[1].trim();
        }
      }
    }
    return styleMap;
  }
  /** @internal */
  _writeStyleAttribute(element, styleMap) {
    var styleAttrValue = "";
    for (var key in styleMap) {
      var newValue = styleMap[key];
      if (newValue && newValue.length > 0) {
        styleAttrValue += key + ":" + styleMap[key] + ";";
      }
    }
    element.attribs["style"] = styleAttrValue;
  }
  setStyle(element, styleName: string, styleValue: string) {
    var styleMap = this._readStyleAttribute(element);
    styleMap[styleName] = styleValue;
    this._writeStyleAttribute(element, styleMap);
  }
  removeStyle(element, styleName: string) { this.setStyle(element, styleName, null); }
  getStyle(element, styleName: string): string {
    var styleMap = this._readStyleAttribute(element);
    return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : "";
  }
  tagName(element): string { return element.tagName == "style" ? "STYLE" : element.tagName; }
  attributeMap(element): Map<string, string> {
    var res = new Map<string, string>();
    var elAttrs = treeAdapter.getAttrList(element);
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      res.set(attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element, attribute: string): boolean {
    return element.attribs && element.attribs.hasOwnProperty(attribute);
  }
  hasAttributeNS(element, ns: string, attribute: string): boolean { throw 'not implemented'; }
  getAttribute(element, attribute: string): string {
    return element.attribs && element.attribs.hasOwnProperty(attribute) ?
               element.attribs[attribute] :
               null;
  }
  getAttributeNS(element, ns: string, attribute: string): string { throw 'not implemented'; }
  setAttribute(element, attribute: string, value: string) {
    if (attribute) {
      element.attribs[attribute] = value;
      if (attribute === 'class') {
        element.className = value;
      }
    }
  }
  setAttributeNS(element, ns: string, attribute: string, value: string) { throw 'not implemented'; }
  removeAttribute(element, attribute: string) {
    if (attribute) {
      StringMapWrapper.delete(element.attribs, attribute);
    }
  }
  removeAttributeNS(element, ns: string, name: string) { throw 'not implemented'; }
  templateAwareRoot(el): any { return this.isTemplateElement(el) ? this.content(el) : el; }
  createHtmlDocument(): Document {
    var newDoc = treeAdapter.createDocument();
    newDoc.title = "fake title";
    var head = treeAdapter.createElement("head", null, []);
    var body = treeAdapter.createElement("body", 'http://www.w3.org/1999/xhtml', []);
    this.appendChild(newDoc, head);
    this.appendChild(newDoc, body);
    StringMapWrapper.set(newDoc, "head", head);
    StringMapWrapper.set(newDoc, "body", body);
    StringMapWrapper.set(newDoc, "_window", StringMapWrapper.create());
    return newDoc;
  }
  defaultDoc(): Document {
    if (defDoc === null) {
      defDoc = this.createHtmlDocument();
    }
    return defDoc;
  }
  getBoundingClientRect(el): any { return {left: 0, top: 0, width: 0, height: 0}; }
  getTitle(): string { return this.defaultDoc().title || ""; }
  setTitle(newTitle: string) { this.defaultDoc().title = newTitle; }
  isTemplateElement(el: any): boolean {
    return this.isElementNode(el) && this.tagName(el) === "template";
  }
  isTextNode(node): boolean { return treeAdapter.isTextNode(node); }
  isCommentNode(node): boolean { return treeAdapter.isCommentNode(node); }
  isElementNode(node): boolean { return node ? treeAdapter.isElementNode(node) : false; }
  hasShadowRoot(node): boolean { return isPresent(node.shadowRoot); }
  isShadowRoot(node): boolean { return this.getShadowRoot(node) == node; }
  importIntoDoc(node): any { return this.clone(node); }
  adoptNode(node): any { return node; }
  getHref(el): string { return el.href; }
  resolveAndSetHref(el, baseUrl: string, href: string) {
    if (href == null) {
      el.href = baseUrl;
    } else {
      el.href = baseUrl + '/../' + href;
    }
  }
  /** @internal */
  _buildRules(parsedRules, css?) {
    var rules = [];
    for (var i = 0; i < parsedRules.length; i++) {
      var parsedRule = parsedRules[i];
      var rule: {[key: string]: any} = StringMapWrapper.create();
      StringMapWrapper.set(rule, "cssText", css);
      StringMapWrapper.set(rule, "style", {content: "", cssText: ""});
      if (parsedRule.type == "rule") {
        StringMapWrapper.set(rule, "type", 1);
        StringMapWrapper.set(rule, "selectorText", parsedRule.selectors.join(", ")
                                                       .replace(/\s{2,}/g, " ")
                                                       .replace(/\s*~\s*/g, " ~ ")
                                                       .replace(/\s*\+\s*/g, " + ")
                                                       .replace(/\s*>\s*/g, " > ")
                                                       .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
        if (isBlank(parsedRule.declarations)) {
          continue;
        }
        for (var j = 0; j < parsedRule.declarations.length; j++) {
          var declaration = parsedRule.declarations[j];
          StringMapWrapper.set(StringMapWrapper.get(rule, "style"), declaration.property,
                               declaration.value);
          StringMapWrapper.get(rule, "style").cssText +=
              declaration.property + ": " + declaration.value + ";";
        }
      } else if (parsedRule.type == "media") {
        StringMapWrapper.set(rule, "type", 4);
        StringMapWrapper.set(rule, "media", {mediaText: parsedRule.media});
        if (parsedRule.rules) {
          StringMapWrapper.set(rule, "cssRules", this._buildRules(parsedRule.rules));
        }
      }
      rules.push(rule);
    }
    return rules;
  }
  supportsDOMEvents(): boolean { return false; }
  supportsNativeShadowDOM(): boolean { return false; }
  getGlobalEventTarget(target: string): any {
    if (target == "window") {
      return (<any>this.defaultDoc())._window;
    } else if (target == "document") {
      return this.defaultDoc();
    } else if (target == "body") {
      return this.defaultDoc().body;
    }
  }
  getBaseHref(): string { throw 'not implemented'; }
  resetBaseElement(): void { throw 'not implemented'; }
  getHistory(): History { throw 'not implemented'; }
  getLocation(): Location { throw 'not implemented'; }
  getUserAgent(): string { return "Fake user agent"; }
  getData(el, name: string): string { return this.getAttribute(el, 'data-' + name); }
  getComputedStyle(el): any { throw 'not implemented'; }
  setData(el, name: string, value: string) { this.setAttribute(el, 'data-' + name, value); }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(path: string, value: any) { setValueOnPath(global, path, value); }
  requestAnimationFrame(callback): number { return setTimeout(callback, 0); }
  cancelAnimationFrame(id: number) { clearTimeout(id); }
  performanceNow(): number { return DateWrapper.toMillis(DateWrapper.now()); }
  getAnimationPrefix(): string { return ''; }
  getTransitionEnd(): string { return 'transitionend'; }
  supportsAnimation(): boolean { return true; }

  replaceChild(el, newNode, oldNode) { throw new Error('not implemented'); }
  parse(templateHtml: string) { throw new Error('not implemented'); }
  invoke(el: Element, methodName: string, args: any[]): any { throw new Error('not implemented'); }
  getEventKey(event): string { throw new Error('not implemented'); }
}

// TODO: build a proper list, this one is all the keys of a HTMLInputElement
var _HTMLElementPropertyList = [
  "webkitEntries",
  "incremental",
  "webkitdirectory",
  "selectionDirection",
  "selectionEnd",
  "selectionStart",
  "labels",
  "validationMessage",
  "validity",
  "willValidate",
  "width",
  "valueAsNumber",
  "valueAsDate",
  "value",
  "useMap",
  "defaultValue",
  "type",
  "step",
  "src",
  "size",
  "required",
  "readOnly",
  "placeholder",
  "pattern",
  "name",
  "multiple",
  "min",
  "minLength",
  "maxLength",
  "max",
  "list",
  "indeterminate",
  "height",
  "formTarget",
  "formNoValidate",
  "formMethod",
  "formEnctype",
  "formAction",
  "files",
  "form",
  "disabled",
  "dirName",
  "checked",
  "defaultChecked",
  "autofocus",
  "autocomplete",
  "alt",
  "align",
  "accept",
  "onautocompleteerror",
  "onautocomplete",
  "onwaiting",
  "onvolumechange",
  "ontoggle",
  "ontimeupdate",
  "onsuspend",
  "onsubmit",
  "onstalled",
  "onshow",
  "onselect",
  "onseeking",
  "onseeked",
  "onscroll",
  "onresize",
  "onreset",
  "onratechange",
  "onprogress",
  "onplaying",
  "onplay",
  "onpause",
  "onmousewheel",
  "onmouseup",
  "onmouseover",
  "onmouseout",
  "onmousemove",
  "onmouseleave",
  "onmouseenter",
  "onmousedown",
  "onloadstart",
  "onloadedmetadata",
  "onloadeddata",
  "onload",
  "onkeyup",
  "onkeypress",
  "onkeydown",
  "oninvalid",
  "oninput",
  "onfocus",
  "onerror",
  "onended",
  "onemptied",
  "ondurationchange",
  "ondrop",
  "ondragstart",
  "ondragover",
  "ondragleave",
  "ondragenter",
  "ondragend",
  "ondrag",
  "ondblclick",
  "oncuechange",
  "oncontextmenu",
  "onclose",
  "onclick",
  "onchange",
  "oncanplaythrough",
  "oncanplay",
  "oncancel",
  "onblur",
  "onabort",
  "spellcheck",
  "isContentEditable",
  "contentEditable",
  "outerText",
  "innerText",
  "accessKey",
  "hidden",
  "webkitdropzone",
  "draggable",
  "tabIndex",
  "dir",
  "translate",
  "lang",
  "title",
  "childElementCount",
  "lastElementChild",
  "firstElementChild",
  "children",
  "onwebkitfullscreenerror",
  "onwebkitfullscreenchange",
  "nextElementSibling",
  "previousElementSibling",
  "onwheel",
  "onselectstart",
  "onsearch",
  "onpaste",
  "oncut",
  "oncopy",
  "onbeforepaste",
  "onbeforecut",
  "onbeforecopy",
  "shadowRoot",
  "dataset",
  "classList",
  "className",
  "outerHTML",
  "innerHTML",
  "scrollHeight",
  "scrollWidth",
  "scrollTop",
  "scrollLeft",
  "clientHeight",
  "clientWidth",
  "clientTop",
  "clientLeft",
  "offsetParent",
  "offsetHeight",
  "offsetWidth",
  "offsetTop",
  "offsetLeft",
  "localName",
  "prefix",
  "namespaceURI",
  "id",
  "style",
  "attributes",
  "tagName",
  "parentElement",
  "textContent",
  "baseURI",
  "ownerDocument",
  "nextSibling",
  "previousSibling",
  "lastChild",
  "firstChild",
  "childNodes",
  "parentNode",
  "nodeType",
  "nodeValue",
  "nodeName",
  "closure_lm_714617",
  "__jsaction"
];
