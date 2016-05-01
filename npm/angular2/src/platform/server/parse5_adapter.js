'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
    Parse5DomAdapter.prototype.getText = function (el, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (lang_1.isBlank(el.childNodes) || el.childNodes.length == 0) {
            return "";
        }
        else {
            var textContent = "";
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    };
    Parse5DomAdapter.prototype.setText = function (el, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
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
    Parse5DomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getAttribute = function (element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    };
    Parse5DomAdapter.prototype.getAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
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
    Parse5DomAdapter.prototype.removeAttributeNS = function (element, ns, name) { throw 'not implemented'; };
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
}(common_dom_1.DomAdapter));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoRSxJQUFJLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4RSxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBRXJDLDJCQUF3RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3pGLDJCQUE0Qyw4QkFBOEIsQ0FBQyxDQUFBO0FBQzNFLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UseUJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFFOUMsSUFBSSxjQUFjLEdBQTRCO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFdBQVcsRUFBRSxXQUFXO0lBQ3hCLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFVBQVUsRUFBRSxVQUFVO0NBQ3ZCLENBQUM7QUFDRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFFbEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUVwRSx5QkFBeUIsVUFBVTtJQUNqQyxNQUFNLENBQUMsSUFBSSwwQkFBYSxDQUFDLHNEQUFzRCxHQUFHLFVBQVUs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O0lBQ2IsV0FBVztJQUNYLFlBQVk7SUFDWixjQUFjO0lBQ2QsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsWUFBWTtJQUNaLFdBQVc7SUFDWCxRQUFRO0lBQ1IsY0FBYztJQUNkLElBQUk7SUFDSixPQUFPO0lBQ1AsWUFBWTtJQUNaLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFlBQVk7SUFDWixZQUFZO0lBQ1osVUFBVTtJQUNWLFdBQVc7SUFDWCxVQUFVO0lBQ1YsbUJBQW1CO0lBQ25CLFlBQVk7Q0FDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHBhcnNlNSA9IHJlcXVpcmUoJ3BhcnNlNS9pbmRleCcpO1xudmFyIHBhcnNlciA9IG5ldyBwYXJzZTUuUGFyc2VyKHBhcnNlNS5UcmVlQWRhcHRlcnMuaHRtbHBhcnNlcjIpO1xudmFyIHNlcmlhbGl6ZXIgPSBuZXcgcGFyc2U1LlNlcmlhbGl6ZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgdHJlZUFkYXB0ZXIgPSBwYXJzZXIudHJlZUFkYXB0ZXI7XG5cbmltcG9ydCB7TWFwV3JhcHBlciwgTGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RvbUFkYXB0ZXIsIHNldFJvb3REb21BZGFwdGVyfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb25fZG9tJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgZ2xvYmFsLFxuICBUeXBlLFxuICBzZXRWYWx1ZU9uUGF0aCxcbiAgRGF0ZVdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U2VsZWN0b3JNYXRjaGVyLCBDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcblxudmFyIF9hdHRyVG9Qcm9wTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4Jyxcbn07XG52YXIgZGVmRG9jID0gbnVsbDtcblxudmFyIG1hcFByb3BzID0gWydhdHRyaWJzJywgJ3gtYXR0cmlic05hbWVzcGFjZScsICd4LWF0dHJpYnNQcmVmaXgnXTtcblxuZnVuY3Rpb24gX25vdEltcGxlbWVudGVkKG1ldGhvZE5hbWUpIHtcbiAgcmV0dXJuIG5ldyBCYXNlRXhjZXB0aW9uKCdUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQgaW4gUGFyc2U1RG9tQWRhcHRlcjogJyArIG1ldGhvZE5hbWUpO1xufVxuXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSAqL1xuZXhwb3J0IGNsYXNzIFBhcnNlNURvbUFkYXB0ZXIgZXh0ZW5kcyBEb21BZGFwdGVyIHtcbiAgc3RhdGljIG1ha2VDdXJyZW50KCkgeyBzZXRSb290RG9tQWRhcHRlcihuZXcgUGFyc2U1RG9tQWRhcHRlcigpKTsgfVxuXG4gIGhhc1Byb3BlcnR5KGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QuaW5kZXhPZihuYW1lKSA+IC0xO1xuICB9XG4gIC8vIFRPRE8odGJvc2NoKTogZG9uJ3QgZXZlbiBjYWxsIHRoaXMgbWV0aG9kIHdoZW4gd2UgcnVuIHRoZSB0ZXN0cyBvbiBzZXJ2ZXIgc2lkZVxuICAvLyBieSBub3QgdXNpbmcgdGhlIERvbVJlbmRlcmVyIGluIHRlc3RzLiBLZWVwaW5nIHRoaXMgZm9yIG5vdyB0byBtYWtlIHRlc3RzIGhhcHB5Li4uXG4gIHNldFByb3BlcnR5KGVsOiAvKmVsZW1lbnQqLyBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGlmIChuYW1lID09PSAnaW5uZXJIVE1MJykge1xuICAgICAgdGhpcy5zZXRJbm5lckhUTUwoZWwsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGFzc05hbWUnKSB7XG4gICAgICBlbC5hdHRyaWJzW1wiY2xhc3NcIl0gPSBlbC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgZ2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nKTogYW55IHsgcmV0dXJuIGVsW25hbWVdOyB9XG5cbiAgbG9nRXJyb3IoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2coZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXAoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2dHcm91cEVuZCgpIHt9XG5cbiAgZ2V0WEhSKCk6IFR5cGUgeyByZXR1cm4gWEhSOyB9XG5cbiAgZ2V0IGF0dHJUb1Byb3BNYXAoKSB7IHJldHVybiBfYXR0clRvUHJvcE1hcDsgfVxuXG4gIHF1ZXJ5KHNlbGVjdG9yKSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgncXVlcnknKTsgfVxuICBxdWVyeVNlbGVjdG9yKGVsLCBzZWxlY3Rvcjogc3RyaW5nKTogYW55IHsgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3IpWzBdOyB9XG4gIHF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHZhciBfcmVjdXJzaXZlID0gKHJlc3VsdCwgbm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpID0+IHtcbiAgICAgIHZhciBjTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgICBpZiAoY05vZGVzICYmIGNOb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNOb2Rlc1tpXTtcbiAgICAgICAgICBpZiAodGhpcy5lbGVtZW50TWF0Y2hlcyhjaGlsZE5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3JlY3Vyc2l2ZShyZXN1bHQsIGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKSk7XG4gICAgX3JlY3Vyc2l2ZShyZXMsIGVsLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBlbGVtZW50TWF0Y2hlcyhub2RlLCBzZWxlY3Rvcjogc3RyaW5nLCBtYXRjaGVyID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmlzRWxlbWVudE5vZGUobm9kZSkgJiYgc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAoc2VsZWN0b3IgJiYgc2VsZWN0b3IuY2hhckF0KDApID09IFwiI1wiKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldEF0dHJpYnV0ZShub2RlLCAnaWQnKSA9PSBzZWxlY3Rvci5zdWJzdHJpbmcoMSk7XG4gICAgfSBlbHNlIGlmIChzZWxlY3Rvcikge1xuICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgaWYgKG1hdGNoZXIgPT0gbnVsbCkge1xuICAgICAgICBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICAgICAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudCh0aGlzLnRhZ05hbWUobm9kZSkpO1xuICAgICAgaWYgKG5vZGUuYXR0cmlicykge1xuICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBub2RlLmF0dHJpYnMpIHtcbiAgICAgICAgICBjc3NTZWxlY3Rvci5hZGRBdHRyaWJ1dGUoYXR0ck5hbWUsIG5vZGUuYXR0cmlic1thdHRyTmFtZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3Qobm9kZSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NMaXN0W2ldKTtcbiAgICAgIH1cblxuICAgICAgbWF0Y2hlci5tYXRjaChjc3NTZWxlY3RvciwgZnVuY3Rpb24oc2VsZWN0b3IsIGNiKSB7IHJlc3VsdCA9IHRydWU7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIG9uKGVsLCBldnQsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGxpc3RlbmVyc01hcDoge1trOiAvKmFueSovIHN0cmluZ106IGFueX0gPSBlbC5fZXZlbnRMaXN0ZW5lcnNNYXA7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyc01hcDoge1trOiAvKmFueSovIHN0cmluZ106IGFueX0gPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgICAgZWwuX2V2ZW50TGlzdGVuZXJzTWFwID0gbGlzdGVuZXJzTWFwO1xuICAgIH1cbiAgICB2YXIgbGlzdGVuZXJzID0gU3RyaW5nTWFwV3JhcHBlci5nZXQobGlzdGVuZXJzTWFwLCBldnQpO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVycykpIHtcbiAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobGlzdGVuZXJzTWFwLCBldnQsIGxpc3RlbmVycyk7XG4gIH1cbiAgb25BbmRDYW5jZWwoZWwsIGV2dCwgbGlzdGVuZXIpOiBGdW5jdGlvbiB7XG4gICAgdGhpcy5vbihlbCwgZXZ0LCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShTdHJpbmdNYXBXcmFwcGVyLmdldDxhbnlbXT4oZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQpLCBsaXN0ZW5lcik7XG4gICAgfTtcbiAgfVxuICBkaXNwYXRjaEV2ZW50KGVsLCBldnQpIHtcbiAgICBpZiAoaXNCbGFuayhldnQudGFyZ2V0KSkge1xuICAgICAgZXZ0LnRhcmdldCA9IGVsO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLl9ldmVudExpc3RlbmVyc01hcCkpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM6IGFueSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGVsLl9ldmVudExpc3RlbmVyc01hcCwgZXZ0LnR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChsaXN0ZW5lcnMpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2ldKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5wYXJlbnQpKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZWwucGFyZW50LCBldnQpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLl93aW5kb3cpKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZWwuX3dpbmRvdywgZXZ0KTtcbiAgICB9XG4gIH1cbiAgY3JlYXRlTW91c2VFdmVudChldmVudFR5cGUpOiBFdmVudCB7IHJldHVybiB0aGlzLmNyZWF0ZUV2ZW50KGV2ZW50VHlwZSk7IH1cbiAgY3JlYXRlRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcpOiBFdmVudCB7XG4gICAgdmFyIGV2dCA9IDxFdmVudD57XG4gICAgICB0eXBlOiBldmVudFR5cGUsXG4gICAgICBkZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcbiAgICAgIHByZXZlbnREZWZhdWx0OiAoKSA9PiB7ICg8YW55PmV2dCkuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7IH1cbiAgICB9O1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgcHJldmVudERlZmF1bHQoZXZ0KSB7IGV2dC5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9XG4gIGlzUHJldmVudGVkKGV2dCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KGV2dC5yZXR1cm5WYWx1ZSkgJiYgIWV2dC5yZXR1cm5WYWx1ZTsgfVxuICBnZXRJbm5lckhUTUwoZWwpOiBzdHJpbmcgeyByZXR1cm4gc2VyaWFsaXplci5zZXJpYWxpemUodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChlbCkpOyB9XG4gIGdldE91dGVySFRNTChlbCk6IHN0cmluZyB7XG4gICAgc2VyaWFsaXplci5odG1sID0gJyc7XG4gICAgc2VyaWFsaXplci5fc2VyaWFsaXplRWxlbWVudChlbCk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXIuaHRtbDtcbiAgfVxuICBub2RlTmFtZShub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUudGFnTmFtZTsgfVxuICBub2RlVmFsdWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLm5vZGVWYWx1ZTsgfVxuICB0eXBlKG5vZGU6IGFueSk6IHN0cmluZyB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgndHlwZScpOyB9XG4gIGNvbnRlbnQobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLmNoaWxkTm9kZXNbMF07IH1cbiAgZmlyc3RDaGlsZChlbCk6IE5vZGUgeyByZXR1cm4gZWwuZmlyc3RDaGlsZDsgfVxuICBuZXh0U2libGluZyhlbCk6IE5vZGUgeyByZXR1cm4gZWwubmV4dFNpYmxpbmc7IH1cbiAgcGFyZW50RWxlbWVudChlbCk6IE5vZGUgeyByZXR1cm4gZWwucGFyZW50OyB9XG4gIGNoaWxkTm9kZXMoZWwpOiBOb2RlW10geyByZXR1cm4gZWwuY2hpbGROb2RlczsgfVxuICBjaGlsZE5vZGVzQXNMaXN0KGVsKTogYW55W10ge1xuICAgIHZhciBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcztcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGNoaWxkTm9kZXMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc1tpXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgY2xlYXJOb2RlcyhlbCkge1xuICAgIHdoaWxlIChlbC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlKGVsLmNoaWxkTm9kZXNbMF0pO1xuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpLCBub2RlKTtcbiAgfVxuICByZW1vdmVDaGlsZChlbCwgbm9kZSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhlbC5jaGlsZE5vZGVzLCBub2RlKSkge1xuICAgICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgfVxuICB9XG4gIHJlbW92ZShlbCk6IEhUTUxFbGVtZW50IHtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50O1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHZhciBpbmRleCA9IHBhcmVudC5jaGlsZE5vZGVzLmluZGV4T2YoZWwpO1xuICAgICAgcGFyZW50LmNoaWxkTm9kZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgdmFyIG5leHQgPSBlbC5uZXh0U2libGluZztcbiAgICBpZiAocHJldikge1xuICAgICAgcHJldi5uZXh0ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQpIHtcbiAgICAgIG5leHQucHJldiA9IHByZXY7XG4gICAgfVxuICAgIGVsLnByZXYgPSBudWxsO1xuICAgIGVsLm5leHQgPSBudWxsO1xuICAgIGVsLnBhcmVudCA9IG51bGw7XG4gICAgcmV0dXJuIGVsO1xuICB9XG4gIGluc2VydEJlZm9yZShlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmluc2VydEJlZm9yZShlbC5wYXJlbnQsIG5vZGUsIGVsKTtcbiAgfVxuICBpbnNlcnRBbGxCZWZvcmUoZWwsIG5vZGVzKSB7IG5vZGVzLmZvckVhY2gobiA9PiB0aGlzLmluc2VydEJlZm9yZShlbCwgbikpOyB9XG4gIGluc2VydEFmdGVyKGVsLCBub2RlKSB7XG4gICAgaWYgKGVsLm5leHRTaWJsaW5nKSB7XG4gICAgICB0aGlzLmluc2VydEJlZm9yZShlbC5uZXh0U2libGluZywgbm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoZWwucGFyZW50LCBub2RlKTtcbiAgICB9XG4gIH1cbiAgc2V0SW5uZXJIVE1MKGVsLCB2YWx1ZSkge1xuICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgdmFyIGNvbnRlbnQgPSBwYXJzZXIucGFyc2VGcmFnbWVudCh2YWx1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKGVsLCBjb250ZW50LmNoaWxkTm9kZXNbaV0pO1xuICAgIH1cbiAgfVxuICBnZXRUZXh0KGVsLCBpc1JlY3Vyc2l2ZT86IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlzVGV4dE5vZGUoZWwpKSB7XG4gICAgICByZXR1cm4gZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNDb21tZW50Tm9kZShlbCkpIHtcbiAgICAgIC8vIEluIHRoZSBET00sIGNvbW1lbnRzIHdpdGhpbiBhbiBlbGVtZW50IHJldHVybiBhbiBlbXB0eSBzdHJpbmcgZm9yIHRleHRDb250ZW50XG4gICAgICAvLyBIb3dldmVyLCBjb21tZW50IG5vZGUgaW5zdGFuY2VzIHJldHVybiB0aGUgY29tbWVudCBjb250ZW50IGZvciB0ZXh0Q29udGVudCBnZXR0ZXJcbiAgICAgIHJldHVybiBpc1JlY3Vyc2l2ZSA/ICcnIDogZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKGlzQmxhbmsoZWwuY2hpbGROb2RlcykgfHwgZWwuY2hpbGROb2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gdGhpcy5nZXRUZXh0KGVsLmNoaWxkTm9kZXNbaV0sIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHRDb250ZW50O1xuICAgIH1cbiAgfVxuICBzZXRUZXh0KGVsLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkgfHwgdGhpcy5pc0NvbW1lbnROb2RlKGVsKSkge1xuICAgICAgZWwuZGF0YSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykgdHJlZUFkYXB0ZXIuaW5zZXJ0VGV4dChlbCwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXRWYWx1ZShlbCk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbCwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWwpOiBib29sZWFuIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH1cbiAgc2V0Q2hlY2tlZChlbCwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVDb21tZW50Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KGh0bWwpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRlbXBsYXRlLCBjb250ZW50KTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgbnMsIFtdKTsgfVxuICBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBUZXh0IHtcbiAgICB2YXIgdCA9IDxhbnk+dGhpcy5jcmVhdGVDb21tZW50KHRleHQpO1xuICAgIHQudHlwZSA9ICd0ZXh0JztcbiAgICByZXR1cm4gdDtcbiAgfVxuICBjcmVhdGVTY3JpcHRUYWcoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt7bmFtZTogYXR0ck5hbWUsIHZhbHVlOiBhdHRyVmFsdWV9XSk7XG4gIH1cbiAgY3JlYXRlU3R5bGVFbGVtZW50KGNzczogc3RyaW5nKTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc2V0VGV4dChzdHlsZSwgY3NzKTtcbiAgICByZXR1cm4gPEhUTUxTdHlsZUVsZW1lbnQ+c3R5bGU7XG4gIH1cbiAgY3JlYXRlU2hhZG93Um9vdChlbCk6IEhUTUxFbGVtZW50IHtcbiAgICBlbC5zaGFkb3dSb290ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVsLnNoYWRvd1Jvb3QucGFyZW50ID0gZWw7XG4gICAgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7XG4gIH1cbiAgZ2V0U2hhZG93Um9vdChlbCk6IEVsZW1lbnQgeyByZXR1cm4gZWwuc2hhZG93Um9vdDsgfVxuICBnZXRIb3N0KGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhvc3Q7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogYW55KTogTm9kZVtdIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXREaXN0cmlidXRlZE5vZGVzJyk7IH1cbiAgY2xvbmUobm9kZTogTm9kZSk6IE5vZGUge1xuICAgIHZhciBfcmVjdXJzaXZlID0gKG5vZGUpID0+IHtcbiAgICAgIHZhciBub2RlQ2xvbmUgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihub2RlKSk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5vZGUsIHByb3ApO1xuICAgICAgICBpZiAoZGVzYyAmJiAndmFsdWUnIGluIGRlc2MgJiYgdHlwZW9mIGRlc2MudmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgbm9kZUNsb25lW3Byb3BdID0gbm9kZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUNsb25lLnBhcmVudCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUucHJldiA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUubmV4dCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBudWxsO1xuXG4gICAgICBtYXBQcm9wcy5mb3JFYWNoKG1hcE5hbWUgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KG5vZGVbbWFwTmFtZV0pKSB7XG4gICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdID0ge307XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlW21hcE5hbWVdKSB7XG4gICAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV1bcHJvcF0gPSBub2RlW21hcE5hbWVdW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjTm9kZXMpIHtcbiAgICAgICAgdmFyIGNOb2Rlc0Nsb25lID0gbmV3IEFycmF5KGNOb2Rlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZUNsb25lID0gX3JlY3Vyc2l2ZShjaGlsZE5vZGUpO1xuICAgICAgICAgIGNOb2Rlc0Nsb25lW2ldID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wcmV2ID0gY05vZGVzQ2xvbmVbaSAtIDFdO1xuICAgICAgICAgICAgY05vZGVzQ2xvbmVbaSAtIDFdLm5leHQgPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hpbGROb2RlQ2xvbmUucGFyZW50ID0gbm9kZUNsb25lO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IGNOb2Rlc0Nsb25lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVDbG9uZTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVjdXJzaXZlKG5vZGUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbGVtZW50LCBcIi5cIiArIG5hbWUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXRFbGVtZW50c0J5VGFnTmFtZScpO1xuICB9XG4gIGNsYXNzTGlzdChlbGVtZW50KTogc3RyaW5nW10ge1xuICAgIHZhciBjbGFzc0F0dHJWYWx1ZSA9IG51bGw7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnM7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShcImNsYXNzXCIpKSB7XG4gICAgICBjbGFzc0F0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJjbGFzc1wiXTtcbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzQXR0clZhbHVlID8gY2xhc3NBdHRyVmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpIDogW107XG4gIH1cbiAgYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3QoZWxlbWVudCk7XG4gICAgdmFyIGluZGV4ID0gY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5wdXNoKGNsYXNzTmFtZSk7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NMaXN0LmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBjbGFzc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1tcImNsYXNzXCJdID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIGhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmNvbnRhaW5zKHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpLCBjbGFzc05hbWUpO1xuICB9XG4gIGhhc1N0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpIHx8ICcnO1xuICAgIHJldHVybiBzdHlsZVZhbHVlID8gdmFsdWUgPT0gc3R5bGVWYWx1ZSA6IHZhbHVlLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB7fTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KFwic3R5bGVcIikpIHtcbiAgICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJzdHlsZVwiXTtcbiAgICAgIHZhciBzdHlsZUxpc3QgPSBzdHlsZUF0dHJWYWx1ZS5zcGxpdCgvOysvZyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3R5bGVMaXN0W2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgZWxlbXMgPSBzdHlsZUxpc3RbaV0uc3BsaXQoLzorL2cpO1xuICAgICAgICAgIHN0eWxlTWFwW2VsZW1zWzBdLnRyaW0oKV0gPSBlbGVtc1sxXS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlTWFwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApIHtcbiAgICB2YXIgc3R5bGVBdHRyVmFsdWUgPSBcIlwiO1xuICAgIGZvciAodmFyIGtleSBpbiBzdHlsZU1hcCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gc3R5bGVNYXBba2V5XTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiBuZXdWYWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN0eWxlQXR0clZhbHVlICs9IGtleSArIFwiOlwiICsgc3R5bGVNYXBba2V5XSArIFwiO1wiO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50LmF0dHJpYnNbXCJzdHlsZVwiXSA9IHN0eWxlQXR0clZhbHVlO1xuICB9XG4gIHNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgc3R5bGVNYXBbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWU7XG4gICAgdGhpcy5fd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCk7XG4gIH1cbiAgcmVtb3ZlU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpIHsgdGhpcy5zZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUsIG51bGwpOyB9XG4gIGdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgcmV0dXJuIHN0eWxlTWFwLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkgPyBzdHlsZU1hcFtzdHlsZU5hbWVdIDogXCJcIjtcbiAgfVxuICB0YWdOYW1lKGVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC50YWdOYW1lID09IFwic3R5bGVcIiA/IFwiU1RZTEVcIiA6IGVsZW1lbnQudGFnTmFtZTsgfVxuICBhdHRyaWJ1dGVNYXAoZWxlbWVudCk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHZhciByZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIHZhciBlbEF0dHJzID0gdHJlZUFkYXB0ZXIuZ2V0QXR0ckxpc3QoZWxlbWVudCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0cmliID0gZWxBdHRyc1tpXTtcbiAgICAgIHJlcy5zZXQoYXR0cmliLm5hbWUsIGF0dHJpYi52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgaGFzQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKTtcbiAgfVxuICBoYXNBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4geyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBlbGVtZW50LmF0dHJpYnMgJiYgZWxlbWVudC5hdHRyaWJzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSkgP1xuICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuICBnZXRBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHNldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1thdHRyaWJ1dGVdID0gdmFsdWU7XG4gICAgICBpZiAoYXR0cmlidXRlID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldEF0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZGVsZXRlKGVsZW1lbnQuYXR0cmlicywgYXR0cmlidXRlKTtcbiAgICB9XG4gIH1cbiAgcmVtb3ZlQXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBEb2N1bWVudCB7XG4gICAgdmFyIG5ld0RvYyA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50KCk7XG4gICAgbmV3RG9jLnRpdGxlID0gXCJmYWtlIHRpdGxlXCI7XG4gICAgdmFyIGhlYWQgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiaGVhZFwiLCBudWxsLCBbXSk7XG4gICAgdmFyIGJvZHkgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiYm9keVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgaGVhZCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChuZXdEb2MsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJoZWFkXCIsIGhlYWQpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJib2R5XCIsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJfd2luZG93XCIsIFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCkpO1xuICAgIHJldHVybiBuZXdEb2M7XG4gIH1cbiAgZGVmYXVsdERvYygpOiBEb2N1bWVudCB7XG4gICAgaWYgKGRlZkRvYyA9PT0gbnVsbCkge1xuICAgICAgZGVmRG9jID0gdGhpcy5jcmVhdGVIdG1sRG9jdW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZkRvYztcbiAgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWwpOiBhbnkgeyByZXR1cm4ge2xlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07IH1cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLnRpdGxlIHx8IFwiXCI7IH1cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyB0aGlzLmRlZmF1bHREb2MoKS50aXRsZSA9IG5ld1RpdGxlOyB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VsZW1lbnROb2RlKGVsKSAmJiB0aGlzLnRhZ05hbWUoZWwpID09PSBcInRlbXBsYXRlXCI7XG4gIH1cbiAgaXNUZXh0Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc1RleHROb2RlKG5vZGUpOyB9XG4gIGlzQ29tbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdHJlZUFkYXB0ZXIuaXNDb21tZW50Tm9kZShub2RlKTsgfVxuICBpc0VsZW1lbnROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUgPyB0cmVlQWRhcHRlci5pc0VsZW1lbnROb2RlKG5vZGUpIDogZmFsc2U7IH1cbiAgaGFzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQobm9kZS5zaGFkb3dSb290KTsgfVxuICBpc1NoYWRvd1Jvb3Qobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRTaGFkb3dSb290KG5vZGUpID09IG5vZGU7IH1cbiAgaW1wb3J0SW50b0RvYyhub2RlKTogYW55IHsgcmV0dXJuIHRoaXMuY2xvbmUobm9kZSk7IH1cbiAgYWRvcHROb2RlKG5vZGUpOiBhbnkgeyByZXR1cm4gbm9kZTsgfVxuICBnZXRIcmVmKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhyZWY7IH1cbiAgcmVzb2x2ZUFuZFNldEhyZWYoZWwsIGJhc2VVcmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XG4gICAgaWYgKGhyZWYgPT0gbnVsbCkge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmhyZWYgPSBiYXNlVXJsICsgJy8uLi8nICsgaHJlZjtcbiAgICB9XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYnVpbGRSdWxlcyhwYXJzZWRSdWxlcywgY3NzPykge1xuICAgIHZhciBydWxlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VkUnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJzZWRSdWxlID0gcGFyc2VkUnVsZXNbaV07XG4gICAgICB2YXIgcnVsZToge1trZXk6IHN0cmluZ106IGFueX0gPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NUZXh0XCIsIGNzcyk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInN0eWxlXCIsIHtjb250ZW50OiBcIlwiLCBjc3NUZXh0OiBcIlwifSk7XG4gICAgICBpZiAocGFyc2VkUnVsZS50eXBlID09IFwicnVsZVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCAxKTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJzZWxlY3RvclRleHRcIiwgcGFyc2VkUnVsZS5zZWxlY3RvcnMuam9pbihcIiwgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyp+XFxzKi9nLCBcIiB+IFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqXFwrXFxzKi9nLCBcIiArIFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqPlxccyovZywgXCIgPiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbKFxcdyspPShcXHcrKVxcXS9nLCAnWyQxPVwiJDJcIl0nKSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgZGVjbGFyYXRpb24gPSBwYXJzZWRSdWxlLmRlY2xhcmF0aW9uc1tqXTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCBcInN0eWxlXCIpLCBkZWNsYXJhdGlvbi5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgXCJzdHlsZVwiKS5jc3NUZXh0ICs9XG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnByb3BlcnR5ICsgXCI6IFwiICsgZGVjbGFyYXRpb24udmFsdWUgKyBcIjtcIjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gXCJtZWRpYVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCA0KTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJtZWRpYVwiLCB7bWVkaWFUZXh0OiBwYXJzZWRSdWxlLm1lZGlhfSk7XG4gICAgICAgIGlmIChwYXJzZWRSdWxlLnJ1bGVzKSB7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NSdWxlc1wiLCB0aGlzLl9idWlsZFJ1bGVzKHBhcnNlZFJ1bGUucnVsZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBnZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQ6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKHRhcmdldCA9PSBcIndpbmRvd1wiKSB7XG4gICAgICByZXR1cm4gKDxhbnk+dGhpcy5kZWZhdWx0RG9jKCkpLl93aW5kb3c7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJkb2N1bWVudFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJib2R5XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKS5ib2R5O1xuICAgIH1cbiAgfVxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRIaXN0b3J5KCk6IEhpc3RvcnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gXCJGYWtlIHVzZXIgYWdlbnRcIjsgfVxuICBnZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lKTsgfVxuICBnZXRDb21wdXRlZFN0eWxlKGVsKTogYW55IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgc2V0RGF0YShlbCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRoaXMuc2V0QXR0cmlidXRlKGVsLCAnZGF0YS0nICsgbmFtZSwgdmFsdWUpOyB9XG4gIC8vIFRPRE8odGJvc2NoKTogbW92ZSB0aGlzIGludG8gYSBzZXBhcmF0ZSBlbnZpcm9ubWVudCBjbGFzcyBvbmNlIHdlIGhhdmUgaXRcbiAgc2V0R2xvYmFsVmFyKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkgeyBzZXRWYWx1ZU9uUGF0aChnbG9iYWwsIHBhdGgsIHZhbHVlKTsgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spOiBudW1iZXIgeyByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgMCk7IH1cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQ6IG51bWJlcikgeyBjbGVhclRpbWVvdXQoaWQpOyB9XG4gIHBlcmZvcm1hbmNlTm93KCk6IG51bWJlciB7IHJldHVybiBEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSk7IH1cbiAgZ2V0QW5pbWF0aW9uUHJlZml4KCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuICBnZXRUcmFuc2l0aW9uRW5kKCk6IHN0cmluZyB7IHJldHVybiAndHJhbnNpdGlvbmVuZCc7IH1cbiAgc3VwcG9ydHNBbmltYXRpb24oKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgcmVwbGFjZUNoaWxkKGVsLCBuZXdOb2RlLCBvbGROb2RlKSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgcGFyc2UodGVtcGxhdGVIdG1sOiBzdHJpbmcpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBpbnZva2UoZWw6IEVsZW1lbnQsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGdldEV2ZW50S2V5KGV2ZW50KTogc3RyaW5nIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxufVxuXG4vLyBUT0RPOiBidWlsZCBhIHByb3BlciBsaXN0LCB0aGlzIG9uZSBpcyBhbGwgdGhlIGtleXMgb2YgYSBIVE1MSW5wdXRFbGVtZW50XG52YXIgX0hUTUxFbGVtZW50UHJvcGVydHlMaXN0ID0gW1xuICBcIndlYmtpdEVudHJpZXNcIixcbiAgXCJpbmNyZW1lbnRhbFwiLFxuICBcIndlYmtpdGRpcmVjdG9yeVwiLFxuICBcInNlbGVjdGlvbkRpcmVjdGlvblwiLFxuICBcInNlbGVjdGlvbkVuZFwiLFxuICBcInNlbGVjdGlvblN0YXJ0XCIsXG4gIFwibGFiZWxzXCIsXG4gIFwidmFsaWRhdGlvbk1lc3NhZ2VcIixcbiAgXCJ2YWxpZGl0eVwiLFxuICBcIndpbGxWYWxpZGF0ZVwiLFxuICBcIndpZHRoXCIsXG4gIFwidmFsdWVBc051bWJlclwiLFxuICBcInZhbHVlQXNEYXRlXCIsXG4gIFwidmFsdWVcIixcbiAgXCJ1c2VNYXBcIixcbiAgXCJkZWZhdWx0VmFsdWVcIixcbiAgXCJ0eXBlXCIsXG4gIFwic3RlcFwiLFxuICBcInNyY1wiLFxuICBcInNpemVcIixcbiAgXCJyZXF1aXJlZFwiLFxuICBcInJlYWRPbmx5XCIsXG4gIFwicGxhY2Vob2xkZXJcIixcbiAgXCJwYXR0ZXJuXCIsXG4gIFwibmFtZVwiLFxuICBcIm11bHRpcGxlXCIsXG4gIFwibWluXCIsXG4gIFwibWluTGVuZ3RoXCIsXG4gIFwibWF4TGVuZ3RoXCIsXG4gIFwibWF4XCIsXG4gIFwibGlzdFwiLFxuICBcImluZGV0ZXJtaW5hdGVcIixcbiAgXCJoZWlnaHRcIixcbiAgXCJmb3JtVGFyZ2V0XCIsXG4gIFwiZm9ybU5vVmFsaWRhdGVcIixcbiAgXCJmb3JtTWV0aG9kXCIsXG4gIFwiZm9ybUVuY3R5cGVcIixcbiAgXCJmb3JtQWN0aW9uXCIsXG4gIFwiZmlsZXNcIixcbiAgXCJmb3JtXCIsXG4gIFwiZGlzYWJsZWRcIixcbiAgXCJkaXJOYW1lXCIsXG4gIFwiY2hlY2tlZFwiLFxuICBcImRlZmF1bHRDaGVja2VkXCIsXG4gIFwiYXV0b2ZvY3VzXCIsXG4gIFwiYXV0b2NvbXBsZXRlXCIsXG4gIFwiYWx0XCIsXG4gIFwiYWxpZ25cIixcbiAgXCJhY2NlcHRcIixcbiAgXCJvbmF1dG9jb21wbGV0ZWVycm9yXCIsXG4gIFwib25hdXRvY29tcGxldGVcIixcbiAgXCJvbndhaXRpbmdcIixcbiAgXCJvbnZvbHVtZWNoYW5nZVwiLFxuICBcIm9udG9nZ2xlXCIsXG4gIFwib250aW1ldXBkYXRlXCIsXG4gIFwib25zdXNwZW5kXCIsXG4gIFwib25zdWJtaXRcIixcbiAgXCJvbnN0YWxsZWRcIixcbiAgXCJvbnNob3dcIixcbiAgXCJvbnNlbGVjdFwiLFxuICBcIm9uc2Vla2luZ1wiLFxuICBcIm9uc2Vla2VkXCIsXG4gIFwib25zY3JvbGxcIixcbiAgXCJvbnJlc2l6ZVwiLFxuICBcIm9ucmVzZXRcIixcbiAgXCJvbnJhdGVjaGFuZ2VcIixcbiAgXCJvbnByb2dyZXNzXCIsXG4gIFwib25wbGF5aW5nXCIsXG4gIFwib25wbGF5XCIsXG4gIFwib25wYXVzZVwiLFxuICBcIm9ubW91c2V3aGVlbFwiLFxuICBcIm9ubW91c2V1cFwiLFxuICBcIm9ubW91c2VvdmVyXCIsXG4gIFwib25tb3VzZW91dFwiLFxuICBcIm9ubW91c2Vtb3ZlXCIsXG4gIFwib25tb3VzZWxlYXZlXCIsXG4gIFwib25tb3VzZWVudGVyXCIsXG4gIFwib25tb3VzZWRvd25cIixcbiAgXCJvbmxvYWRzdGFydFwiLFxuICBcIm9ubG9hZGVkbWV0YWRhdGFcIixcbiAgXCJvbmxvYWRlZGRhdGFcIixcbiAgXCJvbmxvYWRcIixcbiAgXCJvbmtleXVwXCIsXG4gIFwib25rZXlwcmVzc1wiLFxuICBcIm9ua2V5ZG93blwiLFxuICBcIm9uaW52YWxpZFwiLFxuICBcIm9uaW5wdXRcIixcbiAgXCJvbmZvY3VzXCIsXG4gIFwib25lcnJvclwiLFxuICBcIm9uZW5kZWRcIixcbiAgXCJvbmVtcHRpZWRcIixcbiAgXCJvbmR1cmF0aW9uY2hhbmdlXCIsXG4gIFwib25kcm9wXCIsXG4gIFwib25kcmFnc3RhcnRcIixcbiAgXCJvbmRyYWdvdmVyXCIsXG4gIFwib25kcmFnbGVhdmVcIixcbiAgXCJvbmRyYWdlbnRlclwiLFxuICBcIm9uZHJhZ2VuZFwiLFxuICBcIm9uZHJhZ1wiLFxuICBcIm9uZGJsY2xpY2tcIixcbiAgXCJvbmN1ZWNoYW5nZVwiLFxuICBcIm9uY29udGV4dG1lbnVcIixcbiAgXCJvbmNsb3NlXCIsXG4gIFwib25jbGlja1wiLFxuICBcIm9uY2hhbmdlXCIsXG4gIFwib25jYW5wbGF5dGhyb3VnaFwiLFxuICBcIm9uY2FucGxheVwiLFxuICBcIm9uY2FuY2VsXCIsXG4gIFwib25ibHVyXCIsXG4gIFwib25hYm9ydFwiLFxuICBcInNwZWxsY2hlY2tcIixcbiAgXCJpc0NvbnRlbnRFZGl0YWJsZVwiLFxuICBcImNvbnRlbnRFZGl0YWJsZVwiLFxuICBcIm91dGVyVGV4dFwiLFxuICBcImlubmVyVGV4dFwiLFxuICBcImFjY2Vzc0tleVwiLFxuICBcImhpZGRlblwiLFxuICBcIndlYmtpdGRyb3B6b25lXCIsXG4gIFwiZHJhZ2dhYmxlXCIsXG4gIFwidGFiSW5kZXhcIixcbiAgXCJkaXJcIixcbiAgXCJ0cmFuc2xhdGVcIixcbiAgXCJsYW5nXCIsXG4gIFwidGl0bGVcIixcbiAgXCJjaGlsZEVsZW1lbnRDb3VudFwiLFxuICBcImxhc3RFbGVtZW50Q2hpbGRcIixcbiAgXCJmaXJzdEVsZW1lbnRDaGlsZFwiLFxuICBcImNoaWxkcmVuXCIsXG4gIFwib253ZWJraXRmdWxsc2NyZWVuZXJyb3JcIixcbiAgXCJvbndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2VcIixcbiAgXCJuZXh0RWxlbWVudFNpYmxpbmdcIixcbiAgXCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nXCIsXG4gIFwib253aGVlbFwiLFxuICBcIm9uc2VsZWN0c3RhcnRcIixcbiAgXCJvbnNlYXJjaFwiLFxuICBcIm9ucGFzdGVcIixcbiAgXCJvbmN1dFwiLFxuICBcIm9uY29weVwiLFxuICBcIm9uYmVmb3JlcGFzdGVcIixcbiAgXCJvbmJlZm9yZWN1dFwiLFxuICBcIm9uYmVmb3JlY29weVwiLFxuICBcInNoYWRvd1Jvb3RcIixcbiAgXCJkYXRhc2V0XCIsXG4gIFwiY2xhc3NMaXN0XCIsXG4gIFwiY2xhc3NOYW1lXCIsXG4gIFwib3V0ZXJIVE1MXCIsXG4gIFwiaW5uZXJIVE1MXCIsXG4gIFwic2Nyb2xsSGVpZ2h0XCIsXG4gIFwic2Nyb2xsV2lkdGhcIixcbiAgXCJzY3JvbGxUb3BcIixcbiAgXCJzY3JvbGxMZWZ0XCIsXG4gIFwiY2xpZW50SGVpZ2h0XCIsXG4gIFwiY2xpZW50V2lkdGhcIixcbiAgXCJjbGllbnRUb3BcIixcbiAgXCJjbGllbnRMZWZ0XCIsXG4gIFwib2Zmc2V0UGFyZW50XCIsXG4gIFwib2Zmc2V0SGVpZ2h0XCIsXG4gIFwib2Zmc2V0V2lkdGhcIixcbiAgXCJvZmZzZXRUb3BcIixcbiAgXCJvZmZzZXRMZWZ0XCIsXG4gIFwibG9jYWxOYW1lXCIsXG4gIFwicHJlZml4XCIsXG4gIFwibmFtZXNwYWNlVVJJXCIsXG4gIFwiaWRcIixcbiAgXCJzdHlsZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJ0YWdOYW1lXCIsXG4gIFwicGFyZW50RWxlbWVudFwiLFxuICBcInRleHRDb250ZW50XCIsXG4gIFwiYmFzZVVSSVwiLFxuICBcIm93bmVyRG9jdW1lbnRcIixcbiAgXCJuZXh0U2libGluZ1wiLFxuICBcInByZXZpb3VzU2libGluZ1wiLFxuICBcImxhc3RDaGlsZFwiLFxuICBcImZpcnN0Q2hpbGRcIixcbiAgXCJjaGlsZE5vZGVzXCIsXG4gIFwicGFyZW50Tm9kZVwiLFxuICBcIm5vZGVUeXBlXCIsXG4gIFwibm9kZVZhbHVlXCIsXG4gIFwibm9kZU5hbWVcIixcbiAgXCJjbG9zdXJlX2xtXzcxNDYxN1wiLFxuICBcIl9fanNhY3Rpb25cIlxuXTtcbiJdfQ==