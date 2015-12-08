'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse5 = require('parse5/index');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;
var collection_1 = require('angular2/src/facade/collection');
var common_dom_1 = require('angular2/platform/common_dom');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var selector_1 = require('angular2/src/compiler/selector');
var xhr_1 = require('angular2/src/compiler/xhr');
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var defDoc = null;
var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
function _notImplemented(methodName) {
    return new exceptions_1.BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}
/* tslint:disable:requireParameterType */
var Parse5DomAdapter = (function (_super) {
    __extends(Parse5DomAdapter, _super);
    function Parse5DomAdapter() {
        _super.apply(this, arguments);
    }
    Parse5DomAdapter.makeCurrent = function () { common_dom_1.setRootDomAdapter(new Parse5DomAdapter()); };
    Parse5DomAdapter.prototype.hasProperty = function (element, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.setProperty = function (el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs["class"] = el.className = value;
        }
        else {
            el[name] = value;
        }
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    Parse5DomAdapter.prototype.logError = function (error) { console.error(error); };
    Parse5DomAdapter.prototype.log = function (error) { console.log(error); };
    Parse5DomAdapter.prototype.logGroup = function (error) { console.error(error); };
    Parse5DomAdapter.prototype.logGroupEnd = function () { };
    Parse5DomAdapter.prototype.getXHR = function () { return xhr_1.XHR; };
    Object.defineProperty(Parse5DomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    Parse5DomAdapter.prototype.query = function (selector) { throw _notImplemented('query'); };
    Parse5DomAdapter.prototype.querySelector = function (el, selector) { return this.querySelectorAll(el, selector)[0]; };
    Parse5DomAdapter.prototype.querySelectorAll = function (el, selector) {
        var _this = this;
        var res = [];
        var _recursive = function (result, node, selector, matcher) {
            var cNodes = node.childNodes;
            if (cNodes && cNodes.length > 0) {
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    if (_this.elementMatches(childNode, selector, matcher)) {
                        result.push(childNode);
                    }
                    _recursive(result, childNode, selector, matcher);
                }
            }
        };
        var matcher = new selector_1.SelectorMatcher();
        matcher.addSelectables(selector_1.CssSelector.parse(selector));
        _recursive(res, el, selector, matcher);
        return res;
    };
    Parse5DomAdapter.prototype.elementMatches = function (node, selector, matcher) {
        if (matcher === void 0) { matcher = null; }
        if (this.isElementNode(node) && selector === '*') {
            return true;
        }
        var result = false;
        if (selector && selector.charAt(0) == "#") {
            result = this.getAttribute(node, 'id') == selector.substring(1);
        }
        else if (selector) {
            var result = false;
            if (matcher == null) {
                matcher = new selector_1.SelectorMatcher();
                matcher.addSelectables(selector_1.CssSelector.parse(selector));
            }
            var cssSelector = new selector_1.CssSelector();
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
            matcher.match(cssSelector, function (selector, cb) { result = true; });
        }
        return result;
    };
    Parse5DomAdapter.prototype.on = function (el, evt, listener) {
        var listenersMap = el._eventListenersMap;
        if (lang_1.isBlank(listenersMap)) {
            var listenersMap = collection_1.StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = collection_1.StringMapWrapper.get(listenersMap, evt);
        if (lang_1.isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        collection_1.StringMapWrapper.set(listenersMap, evt, listeners);
    };
    Parse5DomAdapter.prototype.onAndCancel = function (el, evt, listener) {
        this.on(el, evt, listener);
        return function () {
            collection_1.ListWrapper.remove(collection_1.StringMapWrapper.get(el._eventListenersMap, evt), listener);
        };
    };
    Parse5DomAdapter.prototype.dispatchEvent = function (el, evt) {
        if (lang_1.isBlank(evt.target)) {
            evt.target = el;
        }
        if (lang_1.isPresent(el._eventListenersMap)) {
            var listeners = collection_1.StringMapWrapper.get(el._eventListenersMap, evt.type);
            if (lang_1.isPresent(listeners)) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](evt);
                }
            }
        }
        if (lang_1.isPresent(el.parent)) {
            this.dispatchEvent(el.parent, evt);
        }
        if (lang_1.isPresent(el._window)) {
            this.dispatchEvent(el._window, evt);
        }
    };
    Parse5DomAdapter.prototype.createMouseEvent = function (eventType) { return this.createEvent(eventType); };
    Parse5DomAdapter.prototype.createEvent = function (eventType) {
        var evt = {
            type: eventType,
            defaultPrevented: false,
            preventDefault: function () { evt.defaultPrevented = true; }
        };
        return evt;
    };
    Parse5DomAdapter.prototype.preventDefault = function (evt) { evt.returnValue = false; };
    Parse5DomAdapter.prototype.isPrevented = function (evt) { return lang_1.isPresent(evt.returnValue) && !evt.returnValue; };
    Parse5DomAdapter.prototype.getInnerHTML = function (el) { return serializer.serialize(this.templateAwareRoot(el)); };
    Parse5DomAdapter.prototype.getOuterHTML = function (el) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    };
    Parse5DomAdapter.prototype.nodeName = function (node) { return node.tagName; };
    Parse5DomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
    Parse5DomAdapter.prototype.type = function (node) { throw _notImplemented('type'); };
    Parse5DomAdapter.prototype.content = function (node) { return node.childNodes[0]; };
    Parse5DomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
    Parse5DomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
    Parse5DomAdapter.prototype.parentElement = function (el) { return el.parent; };
    Parse5DomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
    Parse5DomAdapter.prototype.childNodesAsList = function (el) {
        var childNodes = el.childNodes;
        var res = collection_1.ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    Parse5DomAdapter.prototype.clearNodes = function (el) {
        while (el.childNodes.length > 0) {
            this.remove(el.childNodes[0]);
        }
    };
    Parse5DomAdapter.prototype.appendChild = function (el, node) {
        this.remove(node);
        treeAdapter.appendChild(this.templateAwareRoot(el), node);
    };
    Parse5DomAdapter.prototype.removeChild = function (el, node) {
        if (collection_1.ListWrapper.contains(el.childNodes, node)) {
            this.remove(node);
        }
    };
    Parse5DomAdapter.prototype.remove = function (el) {
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
    };
    Parse5DomAdapter.prototype.insertBefore = function (el, node) {
        this.remove(node);
        treeAdapter.insertBefore(el.parent, node, el);
    };
    Parse5DomAdapter.prototype.insertAllBefore = function (el, nodes) {
        var _this = this;
        nodes.forEach(function (n) { return _this.insertBefore(el, n); });
    };
    Parse5DomAdapter.prototype.insertAfter = function (el, node) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
            this.appendChild(el.parent, node);
        }
    };
    Parse5DomAdapter.prototype.setInnerHTML = function (el, value) {
        this.clearNodes(el);
        var content = parser.parseFragment(value);
        for (var i = 0; i < content.childNodes.length; i++) {
            treeAdapter.appendChild(el, content.childNodes[i]);
        }
    };
    Parse5DomAdapter.prototype.getText = function (el) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (lang_1.isBlank(el.childNodes) || el.childNodes.length == 0) {
            return "";
        }
        else {
            var textContent = "";
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i]);
            }
            return textContent;
        }
    };
    Parse5DomAdapter.prototype.setText = function (el, value) {
        if (this.isTextNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    };
    Parse5DomAdapter.prototype.getValue = function (el) { return el.value; };
    Parse5DomAdapter.prototype.setValue = function (el, value) { el.value = value; };
    Parse5DomAdapter.prototype.getChecked = function (el) { return el.checked; };
    Parse5DomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
    Parse5DomAdapter.prototype.createComment = function (text) { return treeAdapter.createCommentNode(text); };
    Parse5DomAdapter.prototype.createTemplate = function (html) {
        var template = treeAdapter.createElement("template", 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    };
    Parse5DomAdapter.prototype.createElement = function (tagName) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    };
    Parse5DomAdapter.prototype.createElementNS = function (ns, tagName) { return treeAdapter.createElement(tagName, ns, []); };
    Parse5DomAdapter.prototype.createTextNode = function (text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    };
    Parse5DomAdapter.prototype.createScriptTag = function (attrName, attrValue) {
        return treeAdapter.createElement("script", 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    };
    Parse5DomAdapter.prototype.createStyleElement = function (css) {
        var style = this.createElement('style');
        this.setText(style, css);
        return style;
    };
    Parse5DomAdapter.prototype.createShadowRoot = function (el) {
        el.shadowRoot = treeAdapter.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    };
    Parse5DomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    Parse5DomAdapter.prototype.getHost = function (el) { return el.host; };
    Parse5DomAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
    Parse5DomAdapter.prototype.clone = function (node) {
        var _recursive = function (node) {
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
            mapProps.forEach(function (mapName) {
                if (lang_1.isPresent(node[mapName])) {
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
    };
    Parse5DomAdapter.prototype.getElementsByClassName = function (element, name) {
        return this.querySelectorAll(element, "." + name);
    };
    Parse5DomAdapter.prototype.getElementsByTagName = function (element, name) {
        throw _notImplemented('getElementsByTagName');
    };
    Parse5DomAdapter.prototype.classList = function (element) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty("class")) {
            classAttrValue = attributes["class"];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    };
    Parse5DomAdapter.prototype.addClass = function (element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs["class"] = element.className = classList.join(" ");
        }
    };
    Parse5DomAdapter.prototype.removeClass = function (element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs["class"] = element.className = classList.join(" ");
        }
    };
    Parse5DomAdapter.prototype.hasClass = function (element, className) {
        return collection_1.ListWrapper.contains(this.classList(element), className);
    };
    Parse5DomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        if (styleValue === void 0) { styleValue = null; }
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    /** @internal */
    Parse5DomAdapter.prototype._readStyleAttribute = function (element) {
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
    };
    /** @internal */
    Parse5DomAdapter.prototype._writeStyleAttribute = function (element, styleMap) {
        var styleAttrValue = "";
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue && newValue.length > 0) {
                styleAttrValue += key + ":" + styleMap[key] + ";";
            }
        }
        element.attribs["style"] = styleAttrValue;
    };
    Parse5DomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    };
    Parse5DomAdapter.prototype.removeStyle = function (element, styleName) { this.setStyle(element, styleName, null); };
    Parse5DomAdapter.prototype.getStyle = function (element, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : "";
    };
    Parse5DomAdapter.prototype.tagName = function (element) { return element.tagName == "style" ? "STYLE" : element.tagName; };
    Parse5DomAdapter.prototype.attributeMap = function (element) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    Parse5DomAdapter.prototype.hasAttribute = function (element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    };
    Parse5DomAdapter.prototype.getAttribute = function (element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    };
    Parse5DomAdapter.prototype.setAttribute = function (element, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    };
    Parse5DomAdapter.prototype.setAttributeNS = function (element, ns, attribute, value) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.removeAttribute = function (element, attribute) {
        if (attribute) {
            collection_1.StringMapWrapper.delete(element.attribs, attribute);
        }
    };
    Parse5DomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
    Parse5DomAdapter.prototype.createHtmlDocument = function () {
        var newDoc = treeAdapter.createDocument();
        newDoc.title = "fake title";
        var head = treeAdapter.createElement("head", null, []);
        var body = treeAdapter.createElement("body", 'http://www.w3.org/1999/xhtml', []);
        this.appendChild(newDoc, head);
        this.appendChild(newDoc, body);
        collection_1.StringMapWrapper.set(newDoc, "head", head);
        collection_1.StringMapWrapper.set(newDoc, "body", body);
        collection_1.StringMapWrapper.set(newDoc, "_window", collection_1.StringMapWrapper.create());
        return newDoc;
    };
    Parse5DomAdapter.prototype.defaultDoc = function () {
        if (defDoc === null) {
            defDoc = this.createHtmlDocument();
        }
        return defDoc;
    };
    Parse5DomAdapter.prototype.getBoundingClientRect = function (el) { return { left: 0, top: 0, width: 0, height: 0 }; };
    Parse5DomAdapter.prototype.getTitle = function () { return this.defaultDoc().title || ""; };
    Parse5DomAdapter.prototype.setTitle = function (newTitle) { this.defaultDoc().title = newTitle; };
    Parse5DomAdapter.prototype.isTemplateElement = function (el) {
        return this.isElementNode(el) && this.tagName(el) === "template";
    };
    Parse5DomAdapter.prototype.isTextNode = function (node) { return treeAdapter.isTextNode(node); };
    Parse5DomAdapter.prototype.isCommentNode = function (node) { return treeAdapter.isCommentNode(node); };
    Parse5DomAdapter.prototype.isElementNode = function (node) { return node ? treeAdapter.isElementNode(node) : false; };
    Parse5DomAdapter.prototype.hasShadowRoot = function (node) { return lang_1.isPresent(node.shadowRoot); };
    Parse5DomAdapter.prototype.isShadowRoot = function (node) { return this.getShadowRoot(node) == node; };
    Parse5DomAdapter.prototype.importIntoDoc = function (node) { return this.clone(node); };
    Parse5DomAdapter.prototype.adoptNode = function (node) { return node; };
    Parse5DomAdapter.prototype.getHref = function (el) { return el.href; };
    Parse5DomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    };
    /** @internal */
    Parse5DomAdapter.prototype._buildRules = function (parsedRules, css) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = collection_1.StringMapWrapper.create();
            collection_1.StringMapWrapper.set(rule, "cssText", css);
            collection_1.StringMapWrapper.set(rule, "style", { content: "", cssText: "" });
            if (parsedRule.type == "rule") {
                collection_1.StringMapWrapper.set(rule, "type", 1);
                collection_1.StringMapWrapper.set(rule, "selectorText", parsedRule.selectors.join(", ")
                    .replace(/\s{2,}/g, " ")
                    .replace(/\s*~\s*/g, " ~ ")
                    .replace(/\s*\+\s*/g, " + ")
                    .replace(/\s*>\s*/g, " > ")
                    .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                if (lang_1.isBlank(parsedRule.declarations)) {
                    continue;
                }
                for (var j = 0; j < parsedRule.declarations.length; j++) {
                    var declaration = parsedRule.declarations[j];
                    collection_1.StringMapWrapper.set(collection_1.StringMapWrapper.get(rule, "style"), declaration.property, declaration.value);
                    collection_1.StringMapWrapper.get(rule, "style").cssText +=
                        declaration.property + ": " + declaration.value + ";";
                }
            }
            else if (parsedRule.type == "media") {
                collection_1.StringMapWrapper.set(rule, "type", 4);
                collection_1.StringMapWrapper.set(rule, "media", { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    collection_1.StringMapWrapper.set(rule, "cssRules", this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    };
    Parse5DomAdapter.prototype.supportsDOMEvents = function () { return false; };
    Parse5DomAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
    Parse5DomAdapter.prototype.getGlobalEventTarget = function (target) {
        if (target == "window") {
            return this.defaultDoc()._window;
        }
        else if (target == "document") {
            return this.defaultDoc();
        }
        else if (target == "body") {
            return this.defaultDoc().body;
        }
    };
    Parse5DomAdapter.prototype.getBaseHref = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.resetBaseElement = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getHistory = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getLocation = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getUserAgent = function () { return "Fake user agent"; };
    Parse5DomAdapter.prototype.getData = function (el, name) { return this.getAttribute(el, 'data-' + name); };
    Parse5DomAdapter.prototype.getComputedStyle = function (el) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.setData = function (el, name, value) { this.setAttribute(el, 'data-' + name, value); };
    // TODO(tbosch): move this into a separate environment class once we have it
    Parse5DomAdapter.prototype.setGlobalVar = function (path, value) { lang_1.setValueOnPath(lang_1.global, path, value); };
    Parse5DomAdapter.prototype.requestAnimationFrame = function (callback) { return setTimeout(callback, 0); };
    Parse5DomAdapter.prototype.cancelAnimationFrame = function (id) { clearTimeout(id); };
    Parse5DomAdapter.prototype.performanceNow = function () { return lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now()); };
    Parse5DomAdapter.prototype.getAnimationPrefix = function () { return ''; };
    Parse5DomAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
    Parse5DomAdapter.prototype.supportsAnimation = function () { return true; };
    Parse5DomAdapter.prototype.replaceChild = function (el, newNode, oldNode) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.parse = function (templateHtml) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.invoke = function (el, methodName, args) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.getEventKey = function (event) { throw new Error('not implemented'); };
    return Parse5DomAdapter;
})(common_dom_1.DomAdapter);
exports.Parse5DomAdapter = Parse5DomAdapter;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLmNvbnN0cnVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5tYWtlQ3VycmVudCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzUHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLnNldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIubG9nRXJyb3IiLCJQYXJzZTVEb21BZGFwdGVyLmxvZyIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXAiLCJQYXJzZTVEb21BZGFwdGVyLmxvZ0dyb3VwRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRYSFIiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJUb1Byb3BNYXAiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5IiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yQWxsIiwiUGFyc2U1RG9tQWRhcHRlci5lbGVtZW50TWF0Y2hlcyIsIlBhcnNlNURvbUFkYXB0ZXIub24iLCJQYXJzZTVEb21BZGFwdGVyLm9uQW5kQ2FuY2VsIiwiUGFyc2U1RG9tQWRhcHRlci5kaXNwYXRjaEV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVNb3VzZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFdmVudCIsIlBhcnNlNURvbUFkYXB0ZXIucHJldmVudERlZmF1bHQiLCJQYXJzZTVEb21BZGFwdGVyLmlzUHJldmVudGVkIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRJbm5lckhUTUwiLCJQYXJzZTVEb21BZGFwdGVyLmdldE91dGVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZU5hbWUiLCJQYXJzZTVEb21BZGFwdGVyLm5vZGVWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIudHlwZSIsIlBhcnNlNURvbUFkYXB0ZXIuY29udGVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZmlyc3RDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIubmV4dFNpYmxpbmciLCJQYXJzZTVEb21BZGFwdGVyLnBhcmVudEVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXNBc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmNsZWFyTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmFwcGVuZENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRCZWZvcmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEFsbEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWZ0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLnNldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVDb21tZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZW1wbGF0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudE5TIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZXh0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2NyaXB0VGFnIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTdHlsZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldEhvc3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldERpc3RyaWJ1dGVkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNsb25lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2xhc3NMaXN0IiwiUGFyc2U1RG9tQWRhcHRlci5hZGRDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc0NsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3JlYWRTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3dyaXRlU3R5bGVBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnRhZ05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJpYnV0ZU1hcCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldEF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0QXR0cmlidXRlTlMiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIudGVtcGxhdGVBd2FyZVJvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUh0bWxEb2N1bWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZGVmYXVsdERvYyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGl0bGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGVtcGxhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5pc1RleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0NvbW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0VsZW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTaGFkb3dSb290IiwiUGFyc2U1RG9tQWRhcHRlci5pc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmltcG9ydEludG9Eb2MiLCJQYXJzZTVEb21BZGFwdGVyLmFkb3B0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzb2x2ZUFuZFNldEhyZWYiLCJQYXJzZTVEb21BZGFwdGVyLl9idWlsZFJ1bGVzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0RPTUV2ZW50cyIsIlBhcnNlNURvbUFkYXB0ZXIuc3VwcG9ydHNOYXRpdmVTaGFkb3dET00iLCJQYXJzZTVEb21BZGFwdGVyLmdldEdsb2JhbEV2ZW50VGFyZ2V0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCYXNlSHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzZXRCYXNlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SGlzdG9yeSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0TG9jYXRpb24iLCJQYXJzZTVEb21BZGFwdGVyLmdldFVzZXJBZ2VudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Q29tcHV0ZWRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0R2xvYmFsVmFyIiwiUGFyc2U1RG9tQWRhcHRlci5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLmNhbmNlbEFuaW1hdGlvbkZyYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5wZXJmb3JtYW5jZU5vdyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0QW5pbWF0aW9uUHJlZml4IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUcmFuc2l0aW9uRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0FuaW1hdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIucmVwbGFjZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5wYXJzZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW52b2tlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFdmVudEtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUVyQywyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUN6RiwyQkFBNEMsOEJBQThCLENBQUMsQ0FBQTtBQUMzRSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHlCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBRTlDLElBQUksY0FBYyxHQUE0QjtJQUM1QyxPQUFPLEVBQUUsV0FBVztJQUNwQixXQUFXLEVBQUUsV0FBVztJQUN4QixVQUFVLEVBQUUsVUFBVTtJQUN0QixVQUFVLEVBQUUsVUFBVTtDQUN2QixDQUFDO0FBQ0YsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBRWxCLElB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QUNYLFdBQVc7SUFDWCxjQUFjO0lBQ2QsYUFBYTtJQUNiLFdBQVc7SUFDWCxZQUFZO0lBQ1osY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsWUFBWTtJQUNaLGNBQWM7SUFDZCxjQUFjO0lBQ2QsYUFBYTtJQUNiLFdBQVc7SUFDWCxZQUFZO0lBQ1osV0FBVztJQUNYLFFBQVE7SUFDUixjQUFjO0lBQ2QsSUFBSTtJQUNKLE9BQU87SUFDUCxZQUFZO0lBQ1osU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLFdBQVc7SUFDWCxZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixVQUFVO0lBQ1YsV0FBVztJQUNYLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsWUFBWTtDQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcGFyc2U1ID0gcmVxdWlyZSgncGFyc2U1L2luZGV4Jyk7XG52YXIgcGFyc2VyID0gbmV3IHBhcnNlNS5QYXJzZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgc2VyaWFsaXplciA9IG5ldyBwYXJzZTUuU2VyaWFsaXplcihwYXJzZTUuVHJlZUFkYXB0ZXJzLmh0bWxwYXJzZXIyKTtcbnZhciB0cmVlQWRhcHRlciA9IHBhcnNlci50cmVlQWRhcHRlcjtcblxuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RG9tQWRhcHRlciwgc2V0Um9vdERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBnbG9iYWwsXG4gIFR5cGUsXG4gIHNldFZhbHVlT25QYXRoLFxuICBEYXRlV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTZWxlY3Rvck1hdGNoZXIsIENzc1NlbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG52YXIgX2F0dHJUb1Byb3BNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnLFxufTtcbnZhciBkZWZEb2MgPSBudWxsO1xuXG52YXIgbWFwUHJvcHMgPSBbJ2F0dHJpYnMnLCAneC1hdHRyaWJzTmFtZXNwYWNlJywgJ3gtYXR0cmlic1ByZWZpeCddO1xuXG5mdW5jdGlvbiBfbm90SW1wbGVtZW50ZWQobWV0aG9kTmFtZSkge1xuICByZXR1cm4gbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBQYXJzZTVEb21BZGFwdGVyOiAnICsgbWV0aG9kTmFtZSk7XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG5leHBvcnQgY2xhc3MgUGFyc2U1RG9tQWRhcHRlciBleHRlbmRzIERvbUFkYXB0ZXIge1xuICBzdGF0aWMgbWFrZUN1cnJlbnQoKSB7IHNldFJvb3REb21BZGFwdGVyKG5ldyBQYXJzZTVEb21BZGFwdGVyKCkpOyB9XG5cbiAgaGFzUHJvcGVydHkoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdC5pbmRleE9mKG5hbWUpID4gLTE7XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgc2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKG5hbWUgPT09ICdpbm5lckhUTUwnKSB7XG4gICAgICB0aGlzLnNldElubmVySFRNTChlbCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgIGVsLmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsLmNsYXNzTmFtZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICAvLyBUT0RPKHRib3NjaCk6IGRvbid0IGV2ZW4gY2FsbCB0aGlzIG1ldGhvZCB3aGVuIHdlIHJ1biB0aGUgdGVzdHMgb24gc2VydmVyIHNpZGVcbiAgLy8gYnkgbm90IHVzaW5nIHRoZSBEb21SZW5kZXJlciBpbiB0ZXN0cy4gS2VlcGluZyB0aGlzIGZvciBub3cgdG8gbWFrZSB0ZXN0cyBoYXBweS4uLlxuICBnZXRQcm9wZXJ0eShlbDogLyplbGVtZW50Ki8gYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gZWxbbmFtZV07IH1cblxuICBsb2dFcnJvcihlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZyhlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cblxuICBsb2dHcm91cChlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZ0dyb3VwRW5kKCkge31cblxuICBnZXRYSFIoKTogVHlwZSB7IHJldHVybiBYSFI7IH1cblxuICBnZXQgYXR0clRvUHJvcE1hcCgpIHsgcmV0dXJuIF9hdHRyVG9Qcm9wTWFwOyB9XG5cbiAgcXVlcnkoc2VsZWN0b3IpIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdxdWVyeScpOyB9XG4gIHF1ZXJ5U2VsZWN0b3IoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGVsLCBzZWxlY3RvcilbMF07IH1cbiAgcXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgdmFyIF9yZWN1cnNpdmUgPSAocmVzdWx0LCBub2RlLCBzZWxlY3RvciwgbWF0Y2hlcikgPT4ge1xuICAgICAgdmFyIGNOb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICAgIGlmIChjTm9kZXMgJiYgY05vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gY05vZGVzW2ldO1xuICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRNYXRjaGVzKGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVjdXJzaXZlKHJlc3VsdCwgY2hpbGROb2RlLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICBfcmVjdXJzaXZlKHJlcywgZWwsIHNlbGVjdG9yLCBtYXRjaGVyKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGVsZW1lbnRNYXRjaGVzKG5vZGUsIHNlbGVjdG9yOiBzdHJpbmcsIG1hdGNoZXIgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbGVtZW50Tm9kZShub2RlKSAmJiBzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChzZWxlY3RvciAmJiBzZWxlY3Rvci5jaGFyQXQoMCkgPT0gXCIjXCIpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5vZGUsICdpZCcpID09IHNlbGVjdG9yLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBpZiAobWF0Y2hlciA9PSBudWxsKSB7XG4gICAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gICAgICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KHRoaXMudGFnTmFtZShub2RlKSk7XG4gICAgICBpZiAobm9kZS5hdHRyaWJzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIG5vZGUuYXR0cmlicykge1xuICAgICAgICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZSwgbm9kZS5hdHRyaWJzW2F0dHJOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChub2RlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc0xpc3RbaV0pO1xuICAgICAgfVxuXG4gICAgICBtYXRjaGVyLm1hdGNoKGNzc1NlbGVjdG9yLCBmdW5jdGlvbihzZWxlY3RvciwgY2IpIHsgcmVzdWx0ID0gdHJ1ZTsgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgb24oZWwsIGV2dCwgbGlzdGVuZXIpIHtcbiAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IGVsLl9ldmVudExpc3RlbmVyc01hcDtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBlbC5fZXZlbnRMaXN0ZW5lcnNNYXAgPSBsaXN0ZW5lcnNNYXA7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChsaXN0ZW5lcnNNYXAsIGV2dCk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChsaXN0ZW5lcnNNYXAsIGV2dCwgbGlzdGVuZXJzKTtcbiAgfVxuICBvbkFuZENhbmNlbChlbCwgZXZ0LCBsaXN0ZW5lcik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLm9uKGVsLCBldnQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKFN0cmluZ01hcFdyYXBwZXIuZ2V0PGFueVtdPihlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dCksIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9XG4gIGRpc3BhdGNoRXZlbnQoZWwsIGV2dCkge1xuICAgIGlmIChpc0JsYW5rKGV2dC50YXJnZXQpKSB7XG4gICAgICBldnQudGFyZ2V0ID0gZWw7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyczogYW55ID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQudHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGxpc3RlbmVycykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0oZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLnBhcmVudCkpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5wYXJlbnQsIGV2dCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX3dpbmRvdykpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5fd2luZG93LCBldnQpO1xuICAgIH1cbiAgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZSk6IEV2ZW50IHsgcmV0dXJuIHRoaXMuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTsgfVxuICBjcmVhdGVFdmVudChldmVudFR5cGU6IHN0cmluZyk6IEV2ZW50IHtcbiAgICB2YXIgZXZ0ID0gPEV2ZW50PntcbiAgICAgIHR5cGU6IGV2ZW50VHlwZSxcbiAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6ICgpID0+IHsgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9XG4gICAgfTtcbiAgICByZXR1cm4gZXZ0O1xuICB9XG4gIHByZXZlbnREZWZhdWx0KGV2dCkgeyBldnQucmV0dXJuVmFsdWUgPSBmYWxzZTsgfVxuICBpc1ByZXZlbnRlZChldnQpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChldnQucmV0dXJuVmFsdWUpICYmICFldnQucmV0dXJuVmFsdWU7IH1cbiAgZ2V0SW5uZXJIVE1MKGVsKTogc3RyaW5nIHsgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpKTsgfVxuICBnZXRPdXRlckhUTUwoZWwpOiBzdHJpbmcge1xuICAgIHNlcmlhbGl6ZXIuaHRtbCA9ICcnO1xuICAgIHNlcmlhbGl6ZXIuX3NlcmlhbGl6ZUVsZW1lbnQoZWwpO1xuICAgIHJldHVybiBzZXJpYWxpemVyLmh0bWw7XG4gIH1cbiAgbm9kZU5hbWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLnRhZ05hbWU7IH1cbiAgbm9kZVZhbHVlKG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5ub2RlVmFsdWU7IH1cbiAgdHlwZShub2RlOiBhbnkpOiBzdHJpbmcgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3R5cGUnKTsgfVxuICBjb250ZW50KG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5jaGlsZE5vZGVzWzBdOyB9XG4gIGZpcnN0Q2hpbGQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLmZpcnN0Q2hpbGQ7IH1cbiAgbmV4dFNpYmxpbmcoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLm5leHRTaWJsaW5nOyB9XG4gIHBhcmVudEVsZW1lbnQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLnBhcmVudDsgfVxuICBjaGlsZE5vZGVzKGVsKTogTm9kZVtdIHsgcmV0dXJuIGVsLmNoaWxkTm9kZXM7IH1cbiAgY2hpbGROb2Rlc0FzTGlzdChlbCk6IGFueVtdIHtcbiAgICB2YXIgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShjaGlsZE5vZGVzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXNbaV0gPSBjaGlsZE5vZGVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGNsZWFyTm9kZXMoZWwpIHtcbiAgICB3aGlsZSAoZWwuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbW92ZShlbC5jaGlsZE5vZGVzWzBdKTtcbiAgICB9XG4gIH1cbiAgYXBwZW5kQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZCh0aGlzLnRlbXBsYXRlQXdhcmVSb290KGVsKSwgbm9kZSk7XG4gIH1cbiAgcmVtb3ZlQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMoZWwuY2hpbGROb2Rlcywgbm9kZSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIH1cbiAgfVxuICByZW1vdmUoZWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudDtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB2YXIgaW5kZXggPSBwYXJlbnQuY2hpbGROb2Rlcy5pbmRleE9mKGVsKTtcbiAgICAgIHBhcmVudC5jaGlsZE5vZGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNTaWJsaW5nO1xuICAgIHZhciBuZXh0ID0gZWwubmV4dFNpYmxpbmc7XG4gICAgaWYgKHByZXYpIHtcbiAgICAgIHByZXYubmV4dCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0KSB7XG4gICAgICBuZXh0LnByZXYgPSBwcmV2O1xuICAgIH1cbiAgICBlbC5wcmV2ID0gbnVsbDtcbiAgICBlbC5uZXh0ID0gbnVsbDtcbiAgICBlbC5wYXJlbnQgPSBudWxsO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBpbnNlcnRCZWZvcmUoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5pbnNlcnRCZWZvcmUoZWwucGFyZW50LCBub2RlLCBlbCk7XG4gIH1cbiAgaW5zZXJ0QWxsQmVmb3JlKGVsLCBub2RlcykgeyBub2Rlcy5mb3JFYWNoKG4gPT4gdGhpcy5pbnNlcnRCZWZvcmUoZWwsIG4pKTsgfVxuICBpbnNlcnRBZnRlcihlbCwgbm9kZSkge1xuICAgIGlmIChlbC5uZXh0U2libGluZykge1xuICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWwubmV4dFNpYmxpbmcsIG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGVuZENoaWxkKGVsLnBhcmVudCwgbm9kZSk7XG4gICAgfVxuICB9XG4gIHNldElubmVySFRNTChlbCwgdmFsdWUpIHtcbiAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgIHZhciBjb250ZW50ID0gcGFyc2VyLnBhcnNlRnJhZ21lbnQodmFsdWUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZChlbCwgY29udGVudC5jaGlsZE5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbiAgZ2V0VGV4dChlbCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkpIHtcbiAgICAgIHJldHVybiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhlbC5jaGlsZE5vZGVzKSB8fCBlbC5jaGlsZE5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ZXh0Q29udGVudCArPSB0aGlzLmdldFRleHQoZWwuY2hpbGROb2Rlc1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQ7XG4gICAgfVxuICB9XG4gIHNldFRleHQoZWwsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSkge1xuICAgICAgZWwuZGF0YSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykgdHJlZUFkYXB0ZXIuaW5zZXJ0VGV4dChlbCwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXRWYWx1ZShlbCk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbCwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWwpOiBib29sZWFuIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH1cbiAgc2V0Q2hlY2tlZChlbCwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVDb21tZW50Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KGh0bWwpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRlbXBsYXRlLCBjb250ZW50KTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgbnMsIFtdKTsgfVxuICBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBUZXh0IHtcbiAgICB2YXIgdCA9IDxhbnk+dGhpcy5jcmVhdGVDb21tZW50KHRleHQpO1xuICAgIHQudHlwZSA9ICd0ZXh0JztcbiAgICByZXR1cm4gdDtcbiAgfVxuICBjcmVhdGVTY3JpcHRUYWcoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt7bmFtZTogYXR0ck5hbWUsIHZhbHVlOiBhdHRyVmFsdWV9XSk7XG4gIH1cbiAgY3JlYXRlU3R5bGVFbGVtZW50KGNzczogc3RyaW5nKTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc2V0VGV4dChzdHlsZSwgY3NzKTtcbiAgICByZXR1cm4gPEhUTUxTdHlsZUVsZW1lbnQ+c3R5bGU7XG4gIH1cbiAgY3JlYXRlU2hhZG93Um9vdChlbCk6IEhUTUxFbGVtZW50IHtcbiAgICBlbC5zaGFkb3dSb290ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVsLnNoYWRvd1Jvb3QucGFyZW50ID0gZWw7XG4gICAgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7XG4gIH1cbiAgZ2V0U2hhZG93Um9vdChlbCk6IEVsZW1lbnQgeyByZXR1cm4gZWwuc2hhZG93Um9vdDsgfVxuICBnZXRIb3N0KGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhvc3Q7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogYW55KTogTm9kZVtdIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXREaXN0cmlidXRlZE5vZGVzJyk7IH1cbiAgY2xvbmUobm9kZTogTm9kZSk6IE5vZGUge1xuICAgIHZhciBfcmVjdXJzaXZlID0gKG5vZGUpID0+IHtcbiAgICAgIHZhciBub2RlQ2xvbmUgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihub2RlKSk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5vZGUsIHByb3ApO1xuICAgICAgICBpZiAoZGVzYyAmJiAndmFsdWUnIGluIGRlc2MgJiYgdHlwZW9mIGRlc2MudmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgbm9kZUNsb25lW3Byb3BdID0gbm9kZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUNsb25lLnBhcmVudCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUucHJldiA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUubmV4dCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBudWxsO1xuXG4gICAgICBtYXBQcm9wcy5mb3JFYWNoKG1hcE5hbWUgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KG5vZGVbbWFwTmFtZV0pKSB7XG4gICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdID0ge307XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlW21hcE5hbWVdKSB7XG4gICAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV1bcHJvcF0gPSBub2RlW21hcE5hbWVdW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjTm9kZXMpIHtcbiAgICAgICAgdmFyIGNOb2Rlc0Nsb25lID0gbmV3IEFycmF5KGNOb2Rlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZUNsb25lID0gX3JlY3Vyc2l2ZShjaGlsZE5vZGUpO1xuICAgICAgICAgIGNOb2Rlc0Nsb25lW2ldID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wcmV2ID0gY05vZGVzQ2xvbmVbaSAtIDFdO1xuICAgICAgICAgICAgY05vZGVzQ2xvbmVbaSAtIDFdLm5leHQgPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hpbGROb2RlQ2xvbmUucGFyZW50ID0gbm9kZUNsb25lO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IGNOb2Rlc0Nsb25lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVDbG9uZTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVjdXJzaXZlKG5vZGUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbGVtZW50LCBcIi5cIiArIG5hbWUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXRFbGVtZW50c0J5VGFnTmFtZScpO1xuICB9XG4gIGNsYXNzTGlzdChlbGVtZW50KTogc3RyaW5nW10ge1xuICAgIHZhciBjbGFzc0F0dHJWYWx1ZSA9IG51bGw7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnM7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShcImNsYXNzXCIpKSB7XG4gICAgICBjbGFzc0F0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJjbGFzc1wiXTtcbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzQXR0clZhbHVlID8gY2xhc3NBdHRyVmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpIDogW107XG4gIH1cbiAgYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3QoZWxlbWVudCk7XG4gICAgdmFyIGluZGV4ID0gY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5wdXNoKGNsYXNzTmFtZSk7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NMaXN0LmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBjbGFzc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1tcImNsYXNzXCJdID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIGhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmNvbnRhaW5zKHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpLCBjbGFzc05hbWUpO1xuICB9XG4gIGhhc1N0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpIHx8ICcnO1xuICAgIHJldHVybiBzdHlsZVZhbHVlID8gdmFsdWUgPT0gc3R5bGVWYWx1ZSA6IHZhbHVlLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB7fTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KFwic3R5bGVcIikpIHtcbiAgICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJzdHlsZVwiXTtcbiAgICAgIHZhciBzdHlsZUxpc3QgPSBzdHlsZUF0dHJWYWx1ZS5zcGxpdCgvOysvZyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3R5bGVMaXN0W2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgZWxlbXMgPSBzdHlsZUxpc3RbaV0uc3BsaXQoLzorL2cpO1xuICAgICAgICAgIHN0eWxlTWFwW2VsZW1zWzBdLnRyaW0oKV0gPSBlbGVtc1sxXS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlTWFwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApIHtcbiAgICB2YXIgc3R5bGVBdHRyVmFsdWUgPSBcIlwiO1xuICAgIGZvciAodmFyIGtleSBpbiBzdHlsZU1hcCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gc3R5bGVNYXBba2V5XTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiBuZXdWYWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN0eWxlQXR0clZhbHVlICs9IGtleSArIFwiOlwiICsgc3R5bGVNYXBba2V5XSArIFwiO1wiO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50LmF0dHJpYnNbXCJzdHlsZVwiXSA9IHN0eWxlQXR0clZhbHVlO1xuICB9XG4gIHNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgc3R5bGVNYXBbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWU7XG4gICAgdGhpcy5fd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCk7XG4gIH1cbiAgcmVtb3ZlU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpIHsgdGhpcy5zZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUsIG51bGwpOyB9XG4gIGdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgcmV0dXJuIHN0eWxlTWFwLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkgPyBzdHlsZU1hcFtzdHlsZU5hbWVdIDogXCJcIjtcbiAgfVxuICB0YWdOYW1lKGVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC50YWdOYW1lID09IFwic3R5bGVcIiA/IFwiU1RZTEVcIiA6IGVsZW1lbnQudGFnTmFtZTsgfVxuICBhdHRyaWJ1dGVNYXAoZWxlbWVudCk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHZhciByZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIHZhciBlbEF0dHJzID0gdHJlZUFkYXB0ZXIuZ2V0QXR0ckxpc3QoZWxlbWVudCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0cmliID0gZWxBdHRyc1tpXTtcbiAgICAgIHJlcy5zZXQoYXR0cmliLm5hbWUsIGF0dHJpYi52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgaGFzQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKTtcbiAgfVxuICBnZXRBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBlbGVtZW50LmF0dHJpYnMgJiYgZWxlbWVudC5hdHRyaWJzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSkgP1xuICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuICBzZXRBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbYXR0cmlidXRlXSA9IHZhbHVlO1xuICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBzZXRBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZW1vdmVBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmRlbGV0ZShlbGVtZW50LmF0dHJpYnMsIGF0dHJpYnV0ZSk7XG4gICAgfVxuICB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBEb2N1bWVudCB7XG4gICAgdmFyIG5ld0RvYyA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50KCk7XG4gICAgbmV3RG9jLnRpdGxlID0gXCJmYWtlIHRpdGxlXCI7XG4gICAgdmFyIGhlYWQgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiaGVhZFwiLCBudWxsLCBbXSk7XG4gICAgdmFyIGJvZHkgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiYm9keVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgaGVhZCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChuZXdEb2MsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJoZWFkXCIsIGhlYWQpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJib2R5XCIsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJfd2luZG93XCIsIFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCkpO1xuICAgIHJldHVybiBuZXdEb2M7XG4gIH1cbiAgZGVmYXVsdERvYygpOiBEb2N1bWVudCB7XG4gICAgaWYgKGRlZkRvYyA9PT0gbnVsbCkge1xuICAgICAgZGVmRG9jID0gdGhpcy5jcmVhdGVIdG1sRG9jdW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZkRvYztcbiAgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWwpOiBhbnkgeyByZXR1cm4ge2xlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07IH1cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLnRpdGxlIHx8IFwiXCI7IH1cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyB0aGlzLmRlZmF1bHREb2MoKS50aXRsZSA9IG5ld1RpdGxlOyB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VsZW1lbnROb2RlKGVsKSAmJiB0aGlzLnRhZ05hbWUoZWwpID09PSBcInRlbXBsYXRlXCI7XG4gIH1cbiAgaXNUZXh0Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc1RleHROb2RlKG5vZGUpOyB9XG4gIGlzQ29tbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdHJlZUFkYXB0ZXIuaXNDb21tZW50Tm9kZShub2RlKTsgfVxuICBpc0VsZW1lbnROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUgPyB0cmVlQWRhcHRlci5pc0VsZW1lbnROb2RlKG5vZGUpIDogZmFsc2U7IH1cbiAgaGFzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQobm9kZS5zaGFkb3dSb290KTsgfVxuICBpc1NoYWRvd1Jvb3Qobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRTaGFkb3dSb290KG5vZGUpID09IG5vZGU7IH1cbiAgaW1wb3J0SW50b0RvYyhub2RlKTogYW55IHsgcmV0dXJuIHRoaXMuY2xvbmUobm9kZSk7IH1cbiAgYWRvcHROb2RlKG5vZGUpOiBhbnkgeyByZXR1cm4gbm9kZTsgfVxuICBnZXRIcmVmKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhyZWY7IH1cbiAgcmVzb2x2ZUFuZFNldEhyZWYoZWwsIGJhc2VVcmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XG4gICAgaWYgKGhyZWYgPT0gbnVsbCkge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmhyZWYgPSBiYXNlVXJsICsgJy8uLi8nICsgaHJlZjtcbiAgICB9XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYnVpbGRSdWxlcyhwYXJzZWRSdWxlcywgY3NzPykge1xuICAgIHZhciBydWxlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VkUnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJzZWRSdWxlID0gcGFyc2VkUnVsZXNbaV07XG4gICAgICB2YXIgcnVsZToge1trZXk6IHN0cmluZ106IGFueX0gPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NUZXh0XCIsIGNzcyk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInN0eWxlXCIsIHtjb250ZW50OiBcIlwiLCBjc3NUZXh0OiBcIlwifSk7XG4gICAgICBpZiAocGFyc2VkUnVsZS50eXBlID09IFwicnVsZVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCAxKTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJzZWxlY3RvclRleHRcIiwgcGFyc2VkUnVsZS5zZWxlY3RvcnMuam9pbihcIiwgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyp+XFxzKi9nLCBcIiB+IFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqXFwrXFxzKi9nLCBcIiArIFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqPlxccyovZywgXCIgPiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbKFxcdyspPShcXHcrKVxcXS9nLCAnWyQxPVwiJDJcIl0nKSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgZGVjbGFyYXRpb24gPSBwYXJzZWRSdWxlLmRlY2xhcmF0aW9uc1tqXTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCBcInN0eWxlXCIpLCBkZWNsYXJhdGlvbi5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgXCJzdHlsZVwiKS5jc3NUZXh0ICs9XG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnByb3BlcnR5ICsgXCI6IFwiICsgZGVjbGFyYXRpb24udmFsdWUgKyBcIjtcIjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gXCJtZWRpYVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCA0KTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJtZWRpYVwiLCB7bWVkaWFUZXh0OiBwYXJzZWRSdWxlLm1lZGlhfSk7XG4gICAgICAgIGlmIChwYXJzZWRSdWxlLnJ1bGVzKSB7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NSdWxlc1wiLCB0aGlzLl9idWlsZFJ1bGVzKHBhcnNlZFJ1bGUucnVsZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBnZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQ6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKHRhcmdldCA9PSBcIndpbmRvd1wiKSB7XG4gICAgICByZXR1cm4gKDxhbnk+dGhpcy5kZWZhdWx0RG9jKCkpLl93aW5kb3c7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJkb2N1bWVudFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJib2R5XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKS5ib2R5O1xuICAgIH1cbiAgfVxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRIaXN0b3J5KCk6IEhpc3RvcnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gXCJGYWtlIHVzZXIgYWdlbnRcIjsgfVxuICBnZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lKTsgfVxuICBnZXRDb21wdXRlZFN0eWxlKGVsKTogYW55IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgc2V0RGF0YShlbCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRoaXMuc2V0QXR0cmlidXRlKGVsLCAnZGF0YS0nICsgbmFtZSwgdmFsdWUpOyB9XG4gIC8vIFRPRE8odGJvc2NoKTogbW92ZSB0aGlzIGludG8gYSBzZXBhcmF0ZSBlbnZpcm9ubWVudCBjbGFzcyBvbmNlIHdlIGhhdmUgaXRcbiAgc2V0R2xvYmFsVmFyKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkgeyBzZXRWYWx1ZU9uUGF0aChnbG9iYWwsIHBhdGgsIHZhbHVlKTsgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spOiBudW1iZXIgeyByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgMCk7IH1cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQ6IG51bWJlcikgeyBjbGVhclRpbWVvdXQoaWQpOyB9XG4gIHBlcmZvcm1hbmNlTm93KCk6IG51bWJlciB7IHJldHVybiBEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSk7IH1cbiAgZ2V0QW5pbWF0aW9uUHJlZml4KCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuICBnZXRUcmFuc2l0aW9uRW5kKCk6IHN0cmluZyB7IHJldHVybiAndHJhbnNpdGlvbmVuZCc7IH1cbiAgc3VwcG9ydHNBbmltYXRpb24oKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgcmVwbGFjZUNoaWxkKGVsLCBuZXdOb2RlLCBvbGROb2RlKSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgcGFyc2UodGVtcGxhdGVIdG1sOiBzdHJpbmcpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBpbnZva2UoZWw6IEVsZW1lbnQsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGdldEV2ZW50S2V5KGV2ZW50KTogc3RyaW5nIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxufVxuXG4vLyBUT0RPOiBidWlsZCBhIHByb3BlciBsaXN0LCB0aGlzIG9uZSBpcyBhbGwgdGhlIGtleXMgb2YgYSBIVE1MSW5wdXRFbGVtZW50XG52YXIgX0hUTUxFbGVtZW50UHJvcGVydHlMaXN0ID0gW1xuICBcIndlYmtpdEVudHJpZXNcIixcbiAgXCJpbmNyZW1lbnRhbFwiLFxuICBcIndlYmtpdGRpcmVjdG9yeVwiLFxuICBcInNlbGVjdGlvbkRpcmVjdGlvblwiLFxuICBcInNlbGVjdGlvbkVuZFwiLFxuICBcInNlbGVjdGlvblN0YXJ0XCIsXG4gIFwibGFiZWxzXCIsXG4gIFwidmFsaWRhdGlvbk1lc3NhZ2VcIixcbiAgXCJ2YWxpZGl0eVwiLFxuICBcIndpbGxWYWxpZGF0ZVwiLFxuICBcIndpZHRoXCIsXG4gIFwidmFsdWVBc051bWJlclwiLFxuICBcInZhbHVlQXNEYXRlXCIsXG4gIFwidmFsdWVcIixcbiAgXCJ1c2VNYXBcIixcbiAgXCJkZWZhdWx0VmFsdWVcIixcbiAgXCJ0eXBlXCIsXG4gIFwic3RlcFwiLFxuICBcInNyY1wiLFxuICBcInNpemVcIixcbiAgXCJyZXF1aXJlZFwiLFxuICBcInJlYWRPbmx5XCIsXG4gIFwicGxhY2Vob2xkZXJcIixcbiAgXCJwYXR0ZXJuXCIsXG4gIFwibmFtZVwiLFxuICBcIm11bHRpcGxlXCIsXG4gIFwibWluXCIsXG4gIFwibWluTGVuZ3RoXCIsXG4gIFwibWF4TGVuZ3RoXCIsXG4gIFwibWF4XCIsXG4gIFwibGlzdFwiLFxuICBcImluZGV0ZXJtaW5hdGVcIixcbiAgXCJoZWlnaHRcIixcbiAgXCJmb3JtVGFyZ2V0XCIsXG4gIFwiZm9ybU5vVmFsaWRhdGVcIixcbiAgXCJmb3JtTWV0aG9kXCIsXG4gIFwiZm9ybUVuY3R5cGVcIixcbiAgXCJmb3JtQWN0aW9uXCIsXG4gIFwiZmlsZXNcIixcbiAgXCJmb3JtXCIsXG4gIFwiZGlzYWJsZWRcIixcbiAgXCJkaXJOYW1lXCIsXG4gIFwiY2hlY2tlZFwiLFxuICBcImRlZmF1bHRDaGVja2VkXCIsXG4gIFwiYXV0b2ZvY3VzXCIsXG4gIFwiYXV0b2NvbXBsZXRlXCIsXG4gIFwiYWx0XCIsXG4gIFwiYWxpZ25cIixcbiAgXCJhY2NlcHRcIixcbiAgXCJvbmF1dG9jb21wbGV0ZWVycm9yXCIsXG4gIFwib25hdXRvY29tcGxldGVcIixcbiAgXCJvbndhaXRpbmdcIixcbiAgXCJvbnZvbHVtZWNoYW5nZVwiLFxuICBcIm9udG9nZ2xlXCIsXG4gIFwib250aW1ldXBkYXRlXCIsXG4gIFwib25zdXNwZW5kXCIsXG4gIFwib25zdWJtaXRcIixcbiAgXCJvbnN0YWxsZWRcIixcbiAgXCJvbnNob3dcIixcbiAgXCJvbnNlbGVjdFwiLFxuICBcIm9uc2Vla2luZ1wiLFxuICBcIm9uc2Vla2VkXCIsXG4gIFwib25zY3JvbGxcIixcbiAgXCJvbnJlc2l6ZVwiLFxuICBcIm9ucmVzZXRcIixcbiAgXCJvbnJhdGVjaGFuZ2VcIixcbiAgXCJvbnByb2dyZXNzXCIsXG4gIFwib25wbGF5aW5nXCIsXG4gIFwib25wbGF5XCIsXG4gIFwib25wYXVzZVwiLFxuICBcIm9ubW91c2V3aGVlbFwiLFxuICBcIm9ubW91c2V1cFwiLFxuICBcIm9ubW91c2VvdmVyXCIsXG4gIFwib25tb3VzZW91dFwiLFxuICBcIm9ubW91c2Vtb3ZlXCIsXG4gIFwib25tb3VzZWxlYXZlXCIsXG4gIFwib25tb3VzZWVudGVyXCIsXG4gIFwib25tb3VzZWRvd25cIixcbiAgXCJvbmxvYWRzdGFydFwiLFxuICBcIm9ubG9hZGVkbWV0YWRhdGFcIixcbiAgXCJvbmxvYWRlZGRhdGFcIixcbiAgXCJvbmxvYWRcIixcbiAgXCJvbmtleXVwXCIsXG4gIFwib25rZXlwcmVzc1wiLFxuICBcIm9ua2V5ZG93blwiLFxuICBcIm9uaW52YWxpZFwiLFxuICBcIm9uaW5wdXRcIixcbiAgXCJvbmZvY3VzXCIsXG4gIFwib25lcnJvclwiLFxuICBcIm9uZW5kZWRcIixcbiAgXCJvbmVtcHRpZWRcIixcbiAgXCJvbmR1cmF0aW9uY2hhbmdlXCIsXG4gIFwib25kcm9wXCIsXG4gIFwib25kcmFnc3RhcnRcIixcbiAgXCJvbmRyYWdvdmVyXCIsXG4gIFwib25kcmFnbGVhdmVcIixcbiAgXCJvbmRyYWdlbnRlclwiLFxuICBcIm9uZHJhZ2VuZFwiLFxuICBcIm9uZHJhZ1wiLFxuICBcIm9uZGJsY2xpY2tcIixcbiAgXCJvbmN1ZWNoYW5nZVwiLFxuICBcIm9uY29udGV4dG1lbnVcIixcbiAgXCJvbmNsb3NlXCIsXG4gIFwib25jbGlja1wiLFxuICBcIm9uY2hhbmdlXCIsXG4gIFwib25jYW5wbGF5dGhyb3VnaFwiLFxuICBcIm9uY2FucGxheVwiLFxuICBcIm9uY2FuY2VsXCIsXG4gIFwib25ibHVyXCIsXG4gIFwib25hYm9ydFwiLFxuICBcInNwZWxsY2hlY2tcIixcbiAgXCJpc0NvbnRlbnRFZGl0YWJsZVwiLFxuICBcImNvbnRlbnRFZGl0YWJsZVwiLFxuICBcIm91dGVyVGV4dFwiLFxuICBcImlubmVyVGV4dFwiLFxuICBcImFjY2Vzc0tleVwiLFxuICBcImhpZGRlblwiLFxuICBcIndlYmtpdGRyb3B6b25lXCIsXG4gIFwiZHJhZ2dhYmxlXCIsXG4gIFwidGFiSW5kZXhcIixcbiAgXCJkaXJcIixcbiAgXCJ0cmFuc2xhdGVcIixcbiAgXCJsYW5nXCIsXG4gIFwidGl0bGVcIixcbiAgXCJjaGlsZEVsZW1lbnRDb3VudFwiLFxuICBcImxhc3RFbGVtZW50Q2hpbGRcIixcbiAgXCJmaXJzdEVsZW1lbnRDaGlsZFwiLFxuICBcImNoaWxkcmVuXCIsXG4gIFwib253ZWJraXRmdWxsc2NyZWVuZXJyb3JcIixcbiAgXCJvbndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2VcIixcbiAgXCJuZXh0RWxlbWVudFNpYmxpbmdcIixcbiAgXCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nXCIsXG4gIFwib253aGVlbFwiLFxuICBcIm9uc2VsZWN0c3RhcnRcIixcbiAgXCJvbnNlYXJjaFwiLFxuICBcIm9ucGFzdGVcIixcbiAgXCJvbmN1dFwiLFxuICBcIm9uY29weVwiLFxuICBcIm9uYmVmb3JlcGFzdGVcIixcbiAgXCJvbmJlZm9yZWN1dFwiLFxuICBcIm9uYmVmb3JlY29weVwiLFxuICBcInNoYWRvd1Jvb3RcIixcbiAgXCJkYXRhc2V0XCIsXG4gIFwiY2xhc3NMaXN0XCIsXG4gIFwiY2xhc3NOYW1lXCIsXG4gIFwib3V0ZXJIVE1MXCIsXG4gIFwiaW5uZXJIVE1MXCIsXG4gIFwic2Nyb2xsSGVpZ2h0XCIsXG4gIFwic2Nyb2xsV2lkdGhcIixcbiAgXCJzY3JvbGxUb3BcIixcbiAgXCJzY3JvbGxMZWZ0XCIsXG4gIFwiY2xpZW50SGVpZ2h0XCIsXG4gIFwiY2xpZW50V2lkdGhcIixcbiAgXCJjbGllbnRUb3BcIixcbiAgXCJjbGllbnRMZWZ0XCIsXG4gIFwib2Zmc2V0UGFyZW50XCIsXG4gIFwib2Zmc2V0SGVpZ2h0XCIsXG4gIFwib2Zmc2V0V2lkdGhcIixcbiAgXCJvZmZzZXRUb3BcIixcbiAgXCJvZmZzZXRMZWZ0XCIsXG4gIFwibG9jYWxOYW1lXCIsXG4gIFwicHJlZml4XCIsXG4gIFwibmFtZXNwYWNlVVJJXCIsXG4gIFwiaWRcIixcbiAgXCJzdHlsZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJ0YWdOYW1lXCIsXG4gIFwicGFyZW50RWxlbWVudFwiLFxuICBcInRleHRDb250ZW50XCIsXG4gIFwiYmFzZVVSSVwiLFxuICBcIm93bmVyRG9jdW1lbnRcIixcbiAgXCJuZXh0U2libGluZ1wiLFxuICBcInByZXZpb3VzU2libGluZ1wiLFxuICBcImxhc3RDaGlsZFwiLFxuICBcImZpcnN0Q2hpbGRcIixcbiAgXCJjaGlsZE5vZGVzXCIsXG4gIFwicGFyZW50Tm9kZVwiLFxuICBcIm5vZGVUeXBlXCIsXG4gIFwibm9kZVZhbHVlXCIsXG4gIFwibm9kZU5hbWVcIixcbiAgXCJjbG9zdXJlX2xtXzcxNDYxN1wiLFxuICBcIl9fanNhY3Rpb25cIlxuXTtcbiJdfQ==