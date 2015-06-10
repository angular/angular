var parse5 = require('parse5');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;

var cssParse = require('css').parse;

var url = require('url');

import {List, MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DomAdapter, setRootDomAdapter} from './dom_adapter';
import {BaseException, isPresent, isBlank, global} from 'angular2/src/facade/lang';
import {SelectorMatcher, CssSelector} from 'angular2/src/render/dom/compiler/selector';

var _attrToPropMap = {
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};
var defDoc = null;

function _notImplemented(methodName) {
  return new BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}

export class Parse5DomAdapter extends DomAdapter {
  static makeCurrent() { setRootDomAdapter(new Parse5DomAdapter()); }

  logError(error) { console.error(error); }

  get attrToPropMap() { return _attrToPropMap; }

  query(selector) { throw _notImplemented('query'); }
  querySelector(el, selector: string) { return this.querySelectorAll(el, selector)[0]; }
  querySelectorAll(el, selector: string) {
    var res = ListWrapper.create();
    var _recursive = (result, node, selector, matcher) => {
      var cNodes = node.childNodes;
      if (cNodes && cNodes.length > 0) {
        for (var i = 0; i < cNodes.length; i++) {
          var childNode = cNodes[i];
          if (this.elementMatches(childNode, selector, matcher)) {
            ListWrapper.push(result, childNode);
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
    var listenersMap: StringMap<any, any> = el._eventListenersMap;
    if (isBlank(listenersMap)) {
      var listenersMap: StringMap<any, any> = StringMapWrapper.create();
      el._eventListenersMap = listenersMap;
    }
    var listeners = StringMapWrapper.get(listenersMap, evt);
    if (isBlank(listeners)) {
      listeners = ListWrapper.create();
    }
    ListWrapper.push(listeners, listener);
    StringMapWrapper.set(listenersMap, evt, listeners);
  }
  onAndCancel(el, evt, listener): Function {
    this.on(el, evt, listener);
    return () => {
      ListWrapper.remove(StringMapWrapper.get(el._eventListenersMap, evt), listener);
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
  createMouseEvent(eventType) { return this.createEvent(eventType); }
  createEvent(eventType) {
    var evt = {
      type: eventType,
      defaultPrevented: false,
      preventDefault: () => { evt.defaultPrevented = true }
    };
    return evt;
  }
  preventDefault(evt) { evt.returnValue = false; }
  getInnerHTML(el) { return serializer.serialize(this.templateAwareRoot(el)); }
  getOuterHTML(el) {
    serializer.html = '';
    serializer._serializeElement(el);
    return serializer.html;
  }
  nodeName(node): string { return node.tagName; }
  nodeValue(node): string { return node.nodeValue; }
  type(node: any): string { throw _notImplemented('type'); }
  content(node) { return node.childNodes[0]; }
  firstChild(el) { return el.firstChild; }
  nextSibling(el) { return el.nextSibling; }
  parentElement(el) { return el.parent; }
  childNodes(el) { return el.childNodes; }
  childNodesAsList(el): List<any> {
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
  remove(el) {
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
  insertAllBefore(el, nodes) {
    ListWrapper.forEach(nodes, (n) => { this.insertBefore(el, n); });
  }
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
  getText(el) {
    if (this.isTextNode(el)) {
      return el.data;
    } else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
      return "";
    } else {
      var textContent = "";
      for (var i = 0; i < el.childNodes.length; i++) {
        textContent += this.getText(el.childNodes[i]);
      }
      return textContent;
    }
  }
  setText(el, value: string) {
    if (this.isTextNode(el)) {
      el.data = value;
    } else {
      this.clearNodes(el);
      treeAdapter.insertText(el, value);
    }
  }
  getValue(el) { return el.value; }
  setValue(el, value: string) { el.value = value; }
  getChecked(el) { return el.checked; }
  setChecked(el, value: boolean) { el.checked = value; }
  createTemplate(html) {
    var template = treeAdapter.createElement("template", 'http://www.w3.org/1999/xhtml', []);
    var content = parser.parseFragment(html);
    treeAdapter.appendChild(template, content);
    return template;
  }
  createElement(tagName) {
    return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
  }
  createTextNode(text: string) { throw _notImplemented('createTextNode'); }
  createScriptTag(attrName: string, attrValue: string) {
    return treeAdapter.createElement("script", 'http://www.w3.org/1999/xhtml',
                                     [{name: attrName, value: attrValue}]);
  }
  createStyleElement(css: string) {
    var style = this.createElement('style');
    this.setText(style, css);
    return style;
  }
  createShadowRoot(el) {
    el.shadowRoot = treeAdapter.createDocumentFragment();
    el.shadowRoot.parent = el;
    return el.shadowRoot;
  }
  getShadowRoot(el) { return el.shadowRoot; }
  getHost(el) { return el.host; }
  getDistributedNodes(el: any): List<any> { throw _notImplemented('getDistributedNodes'); }
  clone(node) {
    // e.g. document fragment
    if (node.type === 'root') {
      var serialized = serializer.serialize(node);
      var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
      return newParser.parseFragment(serialized);
    } else {
      var temp = treeAdapter.createElement("template", null, []);
      treeAdapter.appendChild(temp, node);
      var serialized = serializer.serialize(temp);
      var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
      return newParser.parseFragment(serialized).childNodes[0];
    }
  }
  hasProperty(element, name: string) { return _HTMLElementPropertyList.indexOf(name) > -1; }
  getElementsByClassName(element, name: string) {
    return this.querySelectorAll(element, "." + name);
  }
  getElementsByTagName(element: any, name: string): List<any> {
    throw _notImplemented('getElementsByTagName');
  }
  classList(element): List<string> {
    var classAttrValue = null;
    var attributes = element.attribs;
    if (attributes && attributes.hasOwnProperty("class")) {
      classAttrValue = attributes["class"];
    }
    return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
  }
  addClass(element, classname: string) {
    var classList = this.classList(element);
    var index = classList.indexOf(classname);
    if (index == -1) {
      ListWrapper.push(classList, classname);
      element.attribs["class"] = element.className = ListWrapper.join(classList, " ");
    }
  }
  removeClass(element, classname: string) {
    var classList = this.classList(element);
    var index = classList.indexOf(classname);
    if (index > -1) {
      classList.splice(index, 1);
      element.attribs["class"] = element.className = ListWrapper.join(classList, " ");
    }
  }
  hasClass(element, classname: string) {
    return ListWrapper.contains(this.classList(element), classname);
  }
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
  setStyle(element, stylename: string, stylevalue: string) {
    var styleMap = this._readStyleAttribute(element);
    styleMap[stylename] = stylevalue;
    this._writeStyleAttribute(element, styleMap);
  }
  removeStyle(element, stylename: string) { this.setStyle(element, stylename, null); }
  getStyle(element, stylename: string) {
    var styleMap = this._readStyleAttribute(element);
    return styleMap.hasOwnProperty(stylename) ? styleMap[stylename] : "";
  }
  tagName(element): string { return element.tagName == "style" ? "STYLE" : element.tagName; }
  attributeMap(element) {
    var res = MapWrapper.create();
    var elAttrs = treeAdapter.getAttrList(element);
    for (var i = 0; i < elAttrs.length; i++) {
      var attrib = elAttrs[i];
      MapWrapper.set(res, attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element, attribute: string) {
    return element.attribs && element.attribs.hasOwnProperty(attribute);
  }
  getAttribute(element, attribute: string) {
    return element.attribs && element.attribs.hasOwnProperty(attribute) ?
               element.attribs[attribute] :
               null;
  }
  setAttribute(element, attribute: string, value: string) {
    if (attribute) {
      element.attribs[attribute] = value;
    }
  }
  removeAttribute(element, attribute: string) {
    if (attribute) {
      StringMapWrapper.delete(element.attribs, attribute);
    }
  }
  templateAwareRoot(el) { return this.isTemplateElement(el) ? this.content(el) : el; }
  createHtmlDocument() {
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
  defaultDoc() {
    if (defDoc === null) {
      defDoc = this.createHtmlDocument();
    }
    return defDoc;
  }
  getBoundingClientRect(el) { return {left: 0, top: 0, width: 0, height: 0}; }
  getTitle() { return this.defaultDoc().title || ""; }
  setTitle(newTitle: string) { this.defaultDoc().title = newTitle; }
  isTemplateElement(el: any): boolean {
    return this.isElementNode(el) && this.tagName(el) === "template";
  }
  isTextNode(node): boolean { return treeAdapter.isTextNode(node); }
  isCommentNode(node): boolean { return treeAdapter.isCommentNode(node); }
  isElementNode(node): boolean { return node ? treeAdapter.isElementNode(node) : false; }
  hasShadowRoot(node): boolean { return isPresent(node.shadowRoot); }
  isShadowRoot(node): boolean { return this.getShadowRoot(node) == node; }
  importIntoDoc(node) { return this.clone(node); }
  isPageRule(rule): boolean {
    return rule.type === 6;  // CSSRule.PAGE_RULE
  }
  isStyleRule(rule): boolean {
    return rule.type === 1;  // CSSRule.MEDIA_RULE
  }
  isMediaRule(rule): boolean {
    return rule.type === 4;  // CSSRule.MEDIA_RULE
  }
  isKeyframesRule(rule): boolean {
    return rule.type === 7;  // CSSRule.KEYFRAMES_RULE
  }
  getHref(el): string { return el.href; }
  resolveAndSetHref(el, baseUrl: string, href: string) {
    if (href == null) {
      el.href = baseUrl;
    } else {
      el.href = url.resolve(baseUrl, href);
    }
  }
  _buildRules(parsedRules, css?) {
    var rules = ListWrapper.create();
    for (var i = 0; i < parsedRules.length; i++) {
      var parsedRule = parsedRules[i];
      var rule: StringMap<string, any> = StringMapWrapper.create();
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
      ListWrapper.push(rules, rule);
    }
    return rules;
  }
  cssToRules(css: string): List<any> {
    css = css.replace(/url\(\'(.+)\'\)/g, 'url($1)');
    var rules = ListWrapper.create();
    var parsedCSS = cssParse(css, {silent: true});
    if (parsedCSS.stylesheet && parsedCSS.stylesheet.rules) {
      rules = this._buildRules(parsedCSS.stylesheet.rules, css);
    }
    return rules;
  }
  supportsDOMEvents(): boolean { return false; }
  supportsNativeShadowDOM(): boolean { return false; }
  getGlobalEventTarget(target: string) {
    if (target == "window") {
      return this.defaultDoc()._window;
    } else if (target == "document") {
      return this.defaultDoc();
    } else if (target == "body") {
      return this.defaultDoc().body;
    }
  }
  getHistory() { throw 'not implemented'; }
  getLocation() { throw 'not implemented'; }
  getUserAgent() { return "Fake user agent"; }
  getData(el, name: string): string { return this.getAttribute(el, 'data-' + name); }
  setData(el, name: string, value: string) { this.setAttribute(el, 'data-' + name, value); }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(name: string, value: any) { global[name] = value; }
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
