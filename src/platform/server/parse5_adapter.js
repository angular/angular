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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLmNvbnN0cnVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5tYWtlQ3VycmVudCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzUHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLnNldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIubG9nRXJyb3IiLCJQYXJzZTVEb21BZGFwdGVyLmxvZyIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXAiLCJQYXJzZTVEb21BZGFwdGVyLmxvZ0dyb3VwRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRYSFIiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJUb1Byb3BNYXAiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5IiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yIiwiUGFyc2U1RG9tQWRhcHRlci5xdWVyeVNlbGVjdG9yQWxsIiwiUGFyc2U1RG9tQWRhcHRlci5lbGVtZW50TWF0Y2hlcyIsIlBhcnNlNURvbUFkYXB0ZXIub24iLCJQYXJzZTVEb21BZGFwdGVyLm9uQW5kQ2FuY2VsIiwiUGFyc2U1RG9tQWRhcHRlci5kaXNwYXRjaEV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVNb3VzZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFdmVudCIsIlBhcnNlNURvbUFkYXB0ZXIucHJldmVudERlZmF1bHQiLCJQYXJzZTVEb21BZGFwdGVyLmlzUHJldmVudGVkIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRJbm5lckhUTUwiLCJQYXJzZTVEb21BZGFwdGVyLmdldE91dGVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZU5hbWUiLCJQYXJzZTVEb21BZGFwdGVyLm5vZGVWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIudHlwZSIsIlBhcnNlNURvbUFkYXB0ZXIuY29udGVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZmlyc3RDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIubmV4dFNpYmxpbmciLCJQYXJzZTVEb21BZGFwdGVyLnBhcmVudEVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNoaWxkTm9kZXNBc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmNsZWFyTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmFwcGVuZENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDaGlsZCIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRCZWZvcmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEFsbEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWZ0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLnNldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGV4dCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRDaGVja2VkIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVDb21tZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZW1wbGF0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudE5TIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVUZXh0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2NyaXB0VGFnIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTdHlsZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFNoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldEhvc3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldERpc3RyaWJ1dGVkTm9kZXMiLCJQYXJzZTVEb21BZGFwdGVyLmNsb25lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2xhc3NMaXN0IiwiUGFyc2U1RG9tQWRhcHRlci5hZGRDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc0NsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3JlYWRTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuX3dyaXRlU3R5bGVBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnRhZ05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmF0dHJpYnV0ZU1hcCIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLnNldEF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0QXR0cmlidXRlTlMiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIudGVtcGxhdGVBd2FyZVJvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUh0bWxEb2N1bWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZGVmYXVsdERvYyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VGl0bGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGVtcGxhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5pc1RleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0NvbW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5pc0VsZW1lbnROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNTaGFkb3dSb290IiwiUGFyc2U1RG9tQWRhcHRlci5pc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmltcG9ydEludG9Eb2MiLCJQYXJzZTVEb21BZGFwdGVyLmFkb3B0Tm9kZSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzb2x2ZUFuZFNldEhyZWYiLCJQYXJzZTVEb21BZGFwdGVyLl9idWlsZFJ1bGVzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0RPTUV2ZW50cyIsIlBhcnNlNURvbUFkYXB0ZXIuc3VwcG9ydHNOYXRpdmVTaGFkb3dET00iLCJQYXJzZTVEb21BZGFwdGVyLmdldEdsb2JhbEV2ZW50VGFyZ2V0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCYXNlSHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIucmVzZXRCYXNlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SGlzdG9yeSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0TG9jYXRpb24iLCJQYXJzZTVEb21BZGFwdGVyLmdldFVzZXJBZ2VudCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0Q29tcHV0ZWRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0RGF0YSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0R2xvYmFsVmFyIiwiUGFyc2U1RG9tQWRhcHRlci5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLmNhbmNlbEFuaW1hdGlvbkZyYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5wZXJmb3JtYW5jZU5vdyIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0QW5pbWF0aW9uUHJlZml4IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUcmFuc2l0aW9uRW5kIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c0FuaW1hdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIucmVwbGFjZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5wYXJzZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW52b2tlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRFdmVudEtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUVyQywyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUN6RiwyQkFBNEMsOEJBQThCLENBQUMsQ0FBQTtBQUMzRSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHlCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBRTlDLElBQUksY0FBYyxHQUE0QjtJQUM1QyxPQUFPLEVBQUUsV0FBVztJQUNwQixXQUFXLEVBQUUsV0FBVztJQUN4QixVQUFVLEVBQUUsVUFBVTtJQUN0QixVQUFVLEVBQUUsVUFBVTtDQUN2QixDQUFDO0FBQ0YsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBRWxCLElB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LFdBQVc7SUFDWCxNQUFNO0lBQ04sT0FBTztJQUNQLG1CQUFtQjtJQUNuQixrQkFBa0I7SUFDbEIsbUJBQW1CO0lBQ25CLFVBQVU7SUFDVix5QkFBeUI7SUFDekIsMEJBQTBCO0lBQzFCLG9CQUFvQjtJQUNwQix3QkFBd0I7SUFDeEIsU0FBUztJQUNULGVBQWU7SUFDZixVQUFVO0lBQ1YsU0FBUztJQUNULE9BQU87SUFDUCxRQUFRO0lBQ1IsZUFBZTtJQUNmLGFBQWE7SUFDYixjQUFjO0lBQ2QsWUFBWTtJQUNaLFNBQVM7SUFDVCxXQUFXO0lBQ1gsV0FBVztJQUNYLFdBQVc7SUFDWCxXQUFXO0lBQ1gsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsWUFBWTtJQUNaLGNBQWM7SUFDZCxhQUFhO0lBQ2IsV0FBVztJQUNYLFlBQVk7SUFDWixjQUFjO0lBQ2QsY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsWUFBWTtJQUNaLFdBQVc7SUFDWCxRQUFRO0lBQ1IsY0FBYztJQUNkLElBQUk7SUFDSixPQUFPO0lBQ1AsWUFBWTtJQUNaLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLFNBQVM7SUFDVCxlQUFlO0lBQ2YsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFlBQVk7SUFDWixZQUFZO0lBQ1osVUFBVTtJQUNWLFdBQVc7SUFDWCxVQUFVO0lBQ1YsbUJBQW1CO0lBQ25CLFlBQVk7Q0FDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHBhcnNlNSA9IHJlcXVpcmUoJ3BhcnNlNS9pbmRleCcpO1xudmFyIHBhcnNlciA9IG5ldyBwYXJzZTUuUGFyc2VyKHBhcnNlNS5UcmVlQWRhcHRlcnMuaHRtbHBhcnNlcjIpO1xudmFyIHNlcmlhbGl6ZXIgPSBuZXcgcGFyc2U1LlNlcmlhbGl6ZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgdHJlZUFkYXB0ZXIgPSBwYXJzZXIudHJlZUFkYXB0ZXI7XG5cbmltcG9ydCB7TWFwV3JhcHBlciwgTGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RvbUFkYXB0ZXIsIHNldFJvb3REb21BZGFwdGVyfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb25fZG9tJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgZ2xvYmFsLFxuICBUeXBlLFxuICBzZXRWYWx1ZU9uUGF0aCxcbiAgRGF0ZVdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U2VsZWN0b3JNYXRjaGVyLCBDc3NTZWxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcblxudmFyIF9hdHRyVG9Qcm9wTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4Jyxcbn07XG52YXIgZGVmRG9jID0gbnVsbDtcblxudmFyIG1hcFByb3BzID0gWydhdHRyaWJzJywgJ3gtYXR0cmlic05hbWVzcGFjZScsICd4LWF0dHJpYnNQcmVmaXgnXTtcblxuZnVuY3Rpb24gX25vdEltcGxlbWVudGVkKG1ldGhvZE5hbWUpIHtcbiAgcmV0dXJuIG5ldyBCYXNlRXhjZXB0aW9uKCdUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQgaW4gUGFyc2U1RG9tQWRhcHRlcjogJyArIG1ldGhvZE5hbWUpO1xufVxuXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSAqL1xuZXhwb3J0IGNsYXNzIFBhcnNlNURvbUFkYXB0ZXIgZXh0ZW5kcyBEb21BZGFwdGVyIHtcbiAgc3RhdGljIG1ha2VDdXJyZW50KCkgeyBzZXRSb290RG9tQWRhcHRlcihuZXcgUGFyc2U1RG9tQWRhcHRlcigpKTsgfVxuXG4gIGhhc1Byb3BlcnR5KGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QuaW5kZXhPZihuYW1lKSA+IC0xO1xuICB9XG4gIC8vIFRPRE8odGJvc2NoKTogZG9uJ3QgZXZlbiBjYWxsIHRoaXMgbWV0aG9kIHdoZW4gd2UgcnVuIHRoZSB0ZXN0cyBvbiBzZXJ2ZXIgc2lkZVxuICAvLyBieSBub3QgdXNpbmcgdGhlIERvbVJlbmRlcmVyIGluIHRlc3RzLiBLZWVwaW5nIHRoaXMgZm9yIG5vdyB0byBtYWtlIHRlc3RzIGhhcHB5Li4uXG4gIHNldFByb3BlcnR5KGVsOiAvKmVsZW1lbnQqLyBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGlmIChuYW1lID09PSAnaW5uZXJIVE1MJykge1xuICAgICAgdGhpcy5zZXRJbm5lckhUTUwoZWwsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGFzc05hbWUnKSB7XG4gICAgICBlbC5hdHRyaWJzW1wiY2xhc3NcIl0gPSBlbC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgZ2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nKTogYW55IHsgcmV0dXJuIGVsW25hbWVdOyB9XG5cbiAgbG9nRXJyb3IoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2coZXJyb3IpIHsgY29uc29sZS5sb2coZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXAoZXJyb3IpIHsgY29uc29sZS5lcnJvcihlcnJvcik7IH1cblxuICBsb2dHcm91cEVuZCgpIHt9XG5cbiAgZ2V0WEhSKCk6IFR5cGUgeyByZXR1cm4gWEhSOyB9XG5cbiAgZ2V0IGF0dHJUb1Byb3BNYXAoKSB7IHJldHVybiBfYXR0clRvUHJvcE1hcDsgfVxuXG4gIHF1ZXJ5KHNlbGVjdG9yKSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgncXVlcnknKTsgfVxuICBxdWVyeVNlbGVjdG9yKGVsLCBzZWxlY3Rvcjogc3RyaW5nKTogYW55IHsgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3IpWzBdOyB9XG4gIHF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHZhciBfcmVjdXJzaXZlID0gKHJlc3VsdCwgbm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpID0+IHtcbiAgICAgIHZhciBjTm9kZXMgPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgICBpZiAoY05vZGVzICYmIGNOb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNOb2Rlc1tpXTtcbiAgICAgICAgICBpZiAodGhpcy5lbGVtZW50TWF0Y2hlcyhjaGlsZE5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3JlY3Vyc2l2ZShyZXN1bHQsIGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKSk7XG4gICAgX3JlY3Vyc2l2ZShyZXMsIGVsLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBlbGVtZW50TWF0Y2hlcyhub2RlLCBzZWxlY3Rvcjogc3RyaW5nLCBtYXRjaGVyID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmlzRWxlbWVudE5vZGUobm9kZSkgJiYgc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAoc2VsZWN0b3IgJiYgc2VsZWN0b3IuY2hhckF0KDApID09IFwiI1wiKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldEF0dHJpYnV0ZShub2RlLCAnaWQnKSA9PSBzZWxlY3Rvci5zdWJzdHJpbmcoMSk7XG4gICAgfSBlbHNlIGlmIChzZWxlY3Rvcikge1xuICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgaWYgKG1hdGNoZXIgPT0gbnVsbCkge1xuICAgICAgICBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKHNlbGVjdG9yKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICAgICAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudCh0aGlzLnRhZ05hbWUobm9kZSkpO1xuICAgICAgaWYgKG5vZGUuYXR0cmlicykge1xuICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBub2RlLmF0dHJpYnMpIHtcbiAgICAgICAgICBjc3NTZWxlY3Rvci5hZGRBdHRyaWJ1dGUoYXR0ck5hbWUsIG5vZGUuYXR0cmlic1thdHRyTmFtZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3Qobm9kZSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NMaXN0W2ldKTtcbiAgICAgIH1cblxuICAgICAgbWF0Y2hlci5tYXRjaChjc3NTZWxlY3RvciwgZnVuY3Rpb24oc2VsZWN0b3IsIGNiKSB7IHJlc3VsdCA9IHRydWU7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIG9uKGVsLCBldnQsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGxpc3RlbmVyc01hcDoge1trOiAvKmFueSovIHN0cmluZ106IGFueX0gPSBlbC5fZXZlbnRMaXN0ZW5lcnNNYXA7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyc01hcDoge1trOiAvKmFueSovIHN0cmluZ106IGFueX0gPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgICAgZWwuX2V2ZW50TGlzdGVuZXJzTWFwID0gbGlzdGVuZXJzTWFwO1xuICAgIH1cbiAgICB2YXIgbGlzdGVuZXJzID0gU3RyaW5nTWFwV3JhcHBlci5nZXQobGlzdGVuZXJzTWFwLCBldnQpO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVycykpIHtcbiAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobGlzdGVuZXJzTWFwLCBldnQsIGxpc3RlbmVycyk7XG4gIH1cbiAgb25BbmRDYW5jZWwoZWwsIGV2dCwgbGlzdGVuZXIpOiBGdW5jdGlvbiB7XG4gICAgdGhpcy5vbihlbCwgZXZ0LCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShTdHJpbmdNYXBXcmFwcGVyLmdldDxhbnlbXT4oZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQpLCBsaXN0ZW5lcik7XG4gICAgfTtcbiAgfVxuICBkaXNwYXRjaEV2ZW50KGVsLCBldnQpIHtcbiAgICBpZiAoaXNCbGFuayhldnQudGFyZ2V0KSkge1xuICAgICAgZXZ0LnRhcmdldCA9IGVsO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLl9ldmVudExpc3RlbmVyc01hcCkpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnM6IGFueSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGVsLl9ldmVudExpc3RlbmVyc01hcCwgZXZ0LnR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChsaXN0ZW5lcnMpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGlzdGVuZXJzW2ldKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5wYXJlbnQpKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZWwucGFyZW50LCBldnQpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLl93aW5kb3cpKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZWwuX3dpbmRvdywgZXZ0KTtcbiAgICB9XG4gIH1cbiAgY3JlYXRlTW91c2VFdmVudChldmVudFR5cGUpOiBFdmVudCB7IHJldHVybiB0aGlzLmNyZWF0ZUV2ZW50KGV2ZW50VHlwZSk7IH1cbiAgY3JlYXRlRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcpOiBFdmVudCB7XG4gICAgdmFyIGV2dCA9IDxFdmVudD57XG4gICAgICB0eXBlOiBldmVudFR5cGUsXG4gICAgICBkZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcbiAgICAgIHByZXZlbnREZWZhdWx0OiAoKSA9PiB7IGV2dC5kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTsgfVxuICAgIH07XG4gICAgcmV0dXJuIGV2dDtcbiAgfVxuICBwcmV2ZW50RGVmYXVsdChldnQpIHsgZXZ0LnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgaXNQcmV2ZW50ZWQoZXZ0KTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQoZXZ0LnJldHVyblZhbHVlKSAmJiAhZXZ0LnJldHVyblZhbHVlOyB9XG4gIGdldElubmVySFRNTChlbCk6IHN0cmluZyB7IHJldHVybiBzZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLnRlbXBsYXRlQXdhcmVSb290KGVsKSk7IH1cbiAgZ2V0T3V0ZXJIVE1MKGVsKTogc3RyaW5nIHtcbiAgICBzZXJpYWxpemVyLmh0bWwgPSAnJztcbiAgICBzZXJpYWxpemVyLl9zZXJpYWxpemVFbGVtZW50KGVsKTtcbiAgICByZXR1cm4gc2VyaWFsaXplci5odG1sO1xuICB9XG4gIG5vZGVOYW1lKG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS50YWdOYW1lOyB9XG4gIG5vZGVWYWx1ZShub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUubm9kZVZhbHVlOyB9XG4gIHR5cGUobm9kZTogYW55KTogc3RyaW5nIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCd0eXBlJyk7IH1cbiAgY29udGVudChub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUuY2hpbGROb2Rlc1swXTsgfVxuICBmaXJzdENoaWxkKGVsKTogTm9kZSB7IHJldHVybiBlbC5maXJzdENoaWxkOyB9XG4gIG5leHRTaWJsaW5nKGVsKTogTm9kZSB7IHJldHVybiBlbC5uZXh0U2libGluZzsgfVxuICBwYXJlbnRFbGVtZW50KGVsKTogTm9kZSB7IHJldHVybiBlbC5wYXJlbnQ7IH1cbiAgY2hpbGROb2RlcyhlbCk6IE5vZGVbXSB7IHJldHVybiBlbC5jaGlsZE5vZGVzOyB9XG4gIGNoaWxkTm9kZXNBc0xpc3QoZWwpOiBhbnlbXSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBlbC5jaGlsZE5vZGVzO1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoY2hpbGROb2Rlcy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzW2ldID0gY2hpbGROb2Rlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBjbGVhck5vZGVzKGVsKSB7XG4gICAgd2hpbGUgKGVsLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmUoZWwuY2hpbGROb2Rlc1swXSk7XG4gICAgfVxuICB9XG4gIGFwcGVuZENoaWxkKGVsLCBub2RlKSB7XG4gICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChlbCksIG5vZGUpO1xuICB9XG4gIHJlbW92ZUNoaWxkKGVsLCBub2RlKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmNvbnRhaW5zKGVsLmNoaWxkTm9kZXMsIG5vZGUpKSB7XG4gICAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB9XG4gIH1cbiAgcmVtb3ZlKGVsKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgdmFyIGluZGV4ID0gcGFyZW50LmNoaWxkTm9kZXMuaW5kZXhPZihlbCk7XG4gICAgICBwYXJlbnQuY2hpbGROb2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICB2YXIgcHJldiA9IGVsLnByZXZpb3VzU2libGluZztcbiAgICB2YXIgbmV4dCA9IGVsLm5leHRTaWJsaW5nO1xuICAgIGlmIChwcmV2KSB7XG4gICAgICBwcmV2Lm5leHQgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCkge1xuICAgICAgbmV4dC5wcmV2ID0gcHJldjtcbiAgICB9XG4gICAgZWwucHJldiA9IG51bGw7XG4gICAgZWwubmV4dCA9IG51bGw7XG4gICAgZWwucGFyZW50ID0gbnVsbDtcbiAgICByZXR1cm4gZWw7XG4gIH1cbiAgaW5zZXJ0QmVmb3JlKGVsLCBub2RlKSB7XG4gICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgdHJlZUFkYXB0ZXIuaW5zZXJ0QmVmb3JlKGVsLnBhcmVudCwgbm9kZSwgZWwpO1xuICB9XG4gIGluc2VydEFsbEJlZm9yZShlbCwgbm9kZXMpIHsgbm9kZXMuZm9yRWFjaChuID0+IHRoaXMuaW5zZXJ0QmVmb3JlKGVsLCBuKSk7IH1cbiAgaW5zZXJ0QWZ0ZXIoZWwsIG5vZGUpIHtcbiAgICBpZiAoZWwubmV4dFNpYmxpbmcpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QmVmb3JlKGVsLm5leHRTaWJsaW5nLCBub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBlbmRDaGlsZChlbC5wYXJlbnQsIG5vZGUpO1xuICAgIH1cbiAgfVxuICBzZXRJbm5lckhUTUwoZWwsIHZhbHVlKSB7XG4gICAgdGhpcy5jbGVhck5vZGVzKGVsKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KHZhbHVlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRlbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQoZWwsIGNvbnRlbnQuY2hpbGROb2Rlc1tpXSk7XG4gICAgfVxuICB9XG4gIGdldFRleHQoZWwsIGlzUmVjdXJzaXZlPzogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkpIHtcbiAgICAgIHJldHVybiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0NvbW1lbnROb2RlKGVsKSkge1xuICAgICAgLy8gSW4gdGhlIERPTSwgY29tbWVudHMgd2l0aGluIGFuIGVsZW1lbnQgcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBmb3IgdGV4dENvbnRlbnRcbiAgICAgIC8vIEhvd2V2ZXIsIGNvbW1lbnQgbm9kZSBpbnN0YW5jZXMgcmV0dXJuIHRoZSBjb21tZW50IGNvbnRlbnQgZm9yIHRleHRDb250ZW50IGdldHRlclxuICAgICAgcmV0dXJuIGlzUmVjdXJzaXZlID8gJycgOiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhlbC5jaGlsZE5vZGVzKSB8fCBlbC5jaGlsZE5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ZXh0Q29udGVudCArPSB0aGlzLmdldFRleHQoZWwuY2hpbGROb2Rlc1tpXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQ7XG4gICAgfVxuICB9XG4gIHNldFRleHQoZWwsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSB8fCB0aGlzLmlzQ29tbWVudE5vZGUoZWwpKSB7XG4gICAgICBlbC5kYXRhID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgICBpZiAodmFsdWUgIT09ICcnKSB0cmVlQWRhcHRlci5pbnNlcnRUZXh0KGVsLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGdldFZhbHVlKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLnZhbHVlOyB9XG4gIHNldFZhbHVlKGVsLCB2YWx1ZTogc3RyaW5nKSB7IGVsLnZhbHVlID0gdmFsdWU7IH1cbiAgZ2V0Q2hlY2tlZChlbCk6IGJvb2xlYW4geyByZXR1cm4gZWwuY2hlY2tlZDsgfVxuICBzZXRDaGVja2VkKGVsLCB2YWx1ZTogYm9vbGVhbikgeyBlbC5jaGVja2VkID0gdmFsdWU7IH1cbiAgY3JlYXRlQ29tbWVudCh0ZXh0OiBzdHJpbmcpOiBDb21tZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUNvbW1lbnROb2RlKHRleHQpOyB9XG4gIGNyZWF0ZVRlbXBsYXRlKGh0bWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHRlbXBsYXRlID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICAgIHZhciBjb250ZW50ID0gcGFyc2VyLnBhcnNlRnJhZ21lbnQoaHRtbCk7XG4gICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUsIGNvbnRlbnQpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuICBjcmVhdGVFbGVtZW50KHRhZ05hbWUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBbXSk7XG4gIH1cbiAgY3JlYXRlRWxlbWVudE5TKG5zLCB0YWdOYW1lKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCh0YWdOYW1lLCBucywgW10pOyB9XG4gIGNyZWF0ZVRleHROb2RlKHRleHQ6IHN0cmluZyk6IFRleHQge1xuICAgIHZhciB0ID0gPGFueT50aGlzLmNyZWF0ZUNvbW1lbnQodGV4dCk7XG4gICAgdC50eXBlID0gJ3RleHQnO1xuICAgIHJldHVybiB0O1xuICB9XG4gIGNyZWF0ZVNjcmlwdFRhZyhhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3tuYW1lOiBhdHRyTmFtZSwgdmFsdWU6IGF0dHJWYWx1ZX1dKTtcbiAgfVxuICBjcmVhdGVTdHlsZUVsZW1lbnQoY3NzOiBzdHJpbmcpOiBIVE1MU3R5bGVFbGVtZW50IHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdGhpcy5zZXRUZXh0KHN0eWxlLCBjc3MpO1xuICAgIHJldHVybiA8SFRNTFN0eWxlRWxlbWVudD5zdHlsZTtcbiAgfVxuICBjcmVhdGVTaGFkb3dSb290KGVsKTogSFRNTEVsZW1lbnQge1xuICAgIGVsLnNoYWRvd1Jvb3QgPSB0cmVlQWRhcHRlci5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZWwuc2hhZG93Um9vdC5wYXJlbnQgPSBlbDtcbiAgICByZXR1cm4gZWwuc2hhZG93Um9vdDtcbiAgfVxuICBnZXRTaGFkb3dSb290KGVsKTogRWxlbWVudCB7IHJldHVybiBlbC5zaGFkb3dSb290OyB9XG4gIGdldEhvc3QoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaG9zdDsgfVxuICBnZXREaXN0cmlidXRlZE5vZGVzKGVsOiBhbnkpOiBOb2RlW10geyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ2dldERpc3RyaWJ1dGVkTm9kZXMnKTsgfVxuICBjbG9uZShub2RlOiBOb2RlKTogTm9kZSB7XG4gICAgdmFyIF9yZWN1cnNpdmUgPSAobm9kZSkgPT4ge1xuICAgICAgdmFyIG5vZGVDbG9uZSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5vZGUpKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gbm9kZSkge1xuICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobm9kZSwgcHJvcCk7XG4gICAgICAgIGlmIChkZXNjICYmICd2YWx1ZScgaW4gZGVzYyAmJiB0eXBlb2YgZGVzYy52YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBub2RlQ2xvbmVbcHJvcF0gPSBub2RlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlQ2xvbmUucGFyZW50ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5wcmV2ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5uZXh0ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IG51bGw7XG5cbiAgICAgIG1hcFByb3BzLmZvckVhY2gobWFwTmFtZSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQobm9kZVttYXBOYW1lXSkpIHtcbiAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV0gPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGVbbWFwTmFtZV0pIHtcbiAgICAgICAgICAgIG5vZGVDbG9uZVttYXBOYW1lXVtwcm9wXSA9IG5vZGVbbWFwTmFtZV1bcHJvcF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhciBjTm9kZXMgPSBub2RlLmNoaWxkcmVuO1xuICAgICAgaWYgKGNOb2Rlcykge1xuICAgICAgICB2YXIgY05vZGVzQ2xvbmUgPSBuZXcgQXJyYXkoY05vZGVzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNOb2Rlc1tpXTtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlQ2xvbmUgPSBfcmVjdXJzaXZlKGNoaWxkTm9kZSk7XG4gICAgICAgICAgY05vZGVzQ2xvbmVbaV0gPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZUNsb25lLnByZXYgPSBjTm9kZXNDbG9uZVtpIC0gMV07XG4gICAgICAgICAgICBjTm9kZXNDbG9uZVtpIC0gMV0ubmV4dCA9IGNoaWxkTm9kZUNsb25lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wYXJlbnQgPSBub2RlQ2xvbmU7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZUNsb25lLmNoaWxkcmVuID0gY05vZGVzQ2xvbmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZUNsb25lO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWN1cnNpdmUobm9kZSk7XG4gIH1cbiAgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnQsIFwiLlwiICsgbmFtZSk7XG4gIH1cbiAgZ2V0RWxlbWVudHNCeVRhZ05hbWUoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ2dldEVsZW1lbnRzQnlUYWdOYW1lJyk7XG4gIH1cbiAgY2xhc3NMaXN0KGVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgdmFyIGNsYXNzQXR0clZhbHVlID0gbnVsbDtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KFwiY2xhc3NcIikpIHtcbiAgICAgIGNsYXNzQXR0clZhbHVlID0gYXR0cmlidXRlc1tcImNsYXNzXCJdO1xuICAgIH1cbiAgICByZXR1cm4gY2xhc3NBdHRyVmFsdWUgPyBjbGFzc0F0dHJWYWx1ZS50cmltKCkuc3BsaXQoL1xccysvZykgOiBbXTtcbiAgfVxuICBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgY2xhc3NMaXN0LnB1c2goY2xhc3NOYW1lKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1tcImNsYXNzXCJdID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpO1xuICAgIHZhciBpbmRleCA9IGNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZWxlbWVudC5hdHRyaWJzW1wiY2xhc3NcIl0gPSBlbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTGlzdC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH1cbiAgaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5jbGFzc0xpc3QoZWxlbWVudCksIGNsYXNzTmFtZSk7XG4gIH1cbiAgaGFzU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZyA9IG51bGwpOiBib29sZWFuIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSkgfHwgJyc7XG4gICAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCkge1xuICAgIHZhciBzdHlsZU1hcCA9IHt9O1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJzO1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoXCJzdHlsZVwiKSkge1xuICAgICAgdmFyIHN0eWxlQXR0clZhbHVlID0gYXR0cmlidXRlc1tcInN0eWxlXCJdO1xuICAgICAgdmFyIHN0eWxlTGlzdCA9IHN0eWxlQXR0clZhbHVlLnNwbGl0KC87Ky9nKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdHlsZUxpc3RbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBlbGVtcyA9IHN0eWxlTGlzdFtpXS5zcGxpdCgvOisvZyk7XG4gICAgICAgICAgc3R5bGVNYXBbZWxlbXNbMF0udHJpbSgpXSA9IGVsZW1zWzFdLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3R5bGVNYXA7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCkge1xuICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IFwiXCI7XG4gICAgZm9yICh2YXIga2V5IGluIHN0eWxlTWFwKSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBzdHlsZU1hcFtrZXldO1xuICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3R5bGVBdHRyVmFsdWUgKz0ga2V5ICsgXCI6XCIgKyBzdHlsZU1hcFtrZXldICsgXCI7XCI7XG4gICAgICB9XG4gICAgfVxuICAgIGVsZW1lbnQuYXR0cmlic1tcInN0eWxlXCJdID0gc3R5bGVBdHRyVmFsdWU7XG4gIH1cbiAgc2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZykge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICBzdHlsZU1hcFtzdHlsZU5hbWVdID0gc3R5bGVWYWx1ZTtcbiAgICB0aGlzLl93cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKTtcbiAgfVxuICByZW1vdmVTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZykgeyB0aGlzLnNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSwgbnVsbCk7IH1cbiAgZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVNYXAuaGFzT3duUHJvcGVydHkoc3R5bGVOYW1lKSA/IHN0eWxlTWFwW3N0eWxlTmFtZV0gOiBcIlwiO1xuICB9XG4gIHRhZ05hbWUoZWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnRhZ05hbWUgPT0gXCJzdHlsZVwiID8gXCJTVFlMRVwiIDogZWxlbWVudC50YWdOYW1lOyB9XG4gIGF0dHJpYnV0ZU1hcChlbGVtZW50KTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgdmFyIHJlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgdmFyIGVsQXR0cnMgPSB0cmVlQWRhcHRlci5nZXRBdHRyTGlzdChlbGVtZW50KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyaWIgPSBlbEF0dHJzW2ldO1xuICAgICAgcmVzLnNldChhdHRyaWIubmFtZSwgYXR0cmliLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBoYXNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudC5hdHRyaWJzICYmIGVsZW1lbnQuYXR0cmlicy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpO1xuICB9XG4gIGdldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKSA/XG4gICAgICAgICAgICAgICBlbGVtZW50LmF0dHJpYnNbYXR0cmlidXRlXSA6XG4gICAgICAgICAgICAgICBudWxsO1xuICB9XG4gIHNldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1thdHRyaWJ1dGVdID0gdmFsdWU7XG4gICAgICBpZiAoYXR0cmlidXRlID09PSAnY2xhc3MnKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldEF0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykge1xuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZGVsZXRlKGVsZW1lbnQuYXR0cmlicywgYXR0cmlidXRlKTtcbiAgICB9XG4gIH1cbiAgdGVtcGxhdGVBd2FyZVJvb3QoZWwpOiBhbnkgeyByZXR1cm4gdGhpcy5pc1RlbXBsYXRlRWxlbWVudChlbCkgPyB0aGlzLmNvbnRlbnQoZWwpIDogZWw7IH1cbiAgY3JlYXRlSHRtbERvY3VtZW50KCk6IERvY3VtZW50IHtcbiAgICB2YXIgbmV3RG9jID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnQoKTtcbiAgICBuZXdEb2MudGl0bGUgPSBcImZha2UgdGl0bGVcIjtcbiAgICB2YXIgaGVhZCA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJoZWFkXCIsIG51bGwsIFtdKTtcbiAgICB2YXIgYm9keSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobmV3RG9jLCBoZWFkKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcImhlYWRcIiwgaGVhZCk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcImJvZHlcIiwgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcIl93aW5kb3dcIiwgU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKSk7XG4gICAgcmV0dXJuIG5ld0RvYztcbiAgfVxuICBkZWZhdWx0RG9jKCk6IERvY3VtZW50IHtcbiAgICBpZiAoZGVmRG9jID09PSBudWxsKSB7XG4gICAgICBkZWZEb2MgPSB0aGlzLmNyZWF0ZUh0bWxEb2N1bWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmRG9jO1xuICB9XG4gIGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbCk6IGFueSB7IHJldHVybiB7bGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwfTsgfVxuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCkudGl0bGUgfHwgXCJcIjsgfVxuICBzZXRUaXRsZShuZXdUaXRsZTogc3RyaW5nKSB7IHRoaXMuZGVmYXVsdERvYygpLnRpdGxlID0gbmV3VGl0bGU7IH1cbiAgaXNUZW1wbGF0ZUVsZW1lbnQoZWw6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRWxlbWVudE5vZGUoZWwpICYmIHRoaXMudGFnTmFtZShlbCkgPT09IFwidGVtcGxhdGVcIjtcbiAgfVxuICBpc1RleHROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRyZWVBZGFwdGVyLmlzVGV4dE5vZGUobm9kZSk7IH1cbiAgaXNDb21tZW50Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc0NvbW1lbnROb2RlKG5vZGUpOyB9XG4gIGlzRWxlbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZSA/IHRyZWVBZGFwdGVyLmlzRWxlbWVudE5vZGUobm9kZSkgOiBmYWxzZTsgfVxuICBoYXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChub2RlLnNoYWRvd1Jvb3QpOyB9XG4gIGlzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldFNoYWRvd1Jvb3Qobm9kZSkgPT0gbm9kZTsgfVxuICBpbXBvcnRJbnRvRG9jKG5vZGUpOiBhbnkgeyByZXR1cm4gdGhpcy5jbG9uZShub2RlKTsgfVxuICBhZG9wdE5vZGUobm9kZSk6IGFueSB7IHJldHVybiBub2RlOyB9XG4gIGdldEhyZWYoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaHJlZjsgfVxuICByZXNvbHZlQW5kU2V0SHJlZihlbCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICBlbC5ocmVmID0gYmFzZVVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICAgIH1cbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9idWlsZFJ1bGVzKHBhcnNlZFJ1bGVzLCBjc3M/KSB7XG4gICAgdmFyIHJ1bGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJzZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhcnNlZFJ1bGUgPSBwYXJzZWRSdWxlc1tpXTtcbiAgICAgIHZhciBydWxlOiB7W2tleTogc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcImNzc1RleHRcIiwgY3NzKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwic3R5bGVcIiwge2NvbnRlbnQ6IFwiXCIsIGNzc1RleHQ6IFwiXCJ9KTtcbiAgICAgIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gXCJydWxlXCIpIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJ0eXBlXCIsIDEpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInNlbGVjdG9yVGV4dFwiLCBwYXJzZWRSdWxlLnNlbGVjdG9ycy5qb2luKFwiLCBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBcIiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKn5cXHMqL2csIFwiIH4gXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccypcXCtcXHMqL2csIFwiICsgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyo+XFxzKi9nLCBcIiA+IFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFsoXFx3Kyk9KFxcdyspXFxdL2csICdbJDE9XCIkMlwiXScpKTtcbiAgICAgICAgaWYgKGlzQmxhbmsocGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJzZWRSdWxlLmRlY2xhcmF0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHZhciBkZWNsYXJhdGlvbiA9IHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zW2pdO1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KFN0cmluZ01hcFdyYXBwZXIuZ2V0KHJ1bGUsIFwic3R5bGVcIiksIGRlY2xhcmF0aW9uLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnZhbHVlKTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCBcInN0eWxlXCIpLmNzc1RleHQgKz1cbiAgICAgICAgICAgICAgZGVjbGFyYXRpb24ucHJvcGVydHkgKyBcIjogXCIgKyBkZWNsYXJhdGlvbi52YWx1ZSArIFwiO1wiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlZFJ1bGUudHlwZSA9PSBcIm1lZGlhXCIpIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJ0eXBlXCIsIDQpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcIm1lZGlhXCIsIHttZWRpYVRleHQ6IHBhcnNlZFJ1bGUubWVkaWF9KTtcbiAgICAgICAgaWYgKHBhcnNlZFJ1bGUucnVsZXMpIHtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcImNzc1J1bGVzXCIsIHRoaXMuX2J1aWxkUnVsZXMocGFyc2VkUnVsZS5ydWxlcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gcnVsZXM7XG4gIH1cbiAgc3VwcG9ydHNET01FdmVudHMoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBzdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGdldEdsb2JhbEV2ZW50VGFyZ2V0KHRhcmdldDogc3RyaW5nKTogYW55IHtcbiAgICBpZiAodGFyZ2V0ID09IFwid2luZG93XCIpIHtcbiAgICAgIHJldHVybiAoPGFueT50aGlzLmRlZmF1bHREb2MoKSkuX3dpbmRvdztcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImRvY3VtZW50XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImJvZHlcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLmJvZHk7XG4gICAgfVxuICB9XG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHJlc2V0QmFzZUVsZW1lbnQoKTogdm9pZCB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldEhpc3RvcnkoKTogSGlzdG9yeSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldExvY2F0aW9uKCk6IExvY2F0aW9uIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7IHJldHVybiBcIkZha2UgdXNlciBhZ2VudFwiOyB9XG4gIGdldERhdGEoZWwsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShlbCwgJ2RhdGEtJyArIG5hbWUpOyB9XG4gIGdldENvbXB1dGVkU3R5bGUoZWwpOiBhbnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBzZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5zZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lLCB2YWx1ZSk7IH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBzZXRHbG9iYWxWYXIocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KSB7IHNldFZhbHVlT25QYXRoKGdsb2JhbCwgcGF0aCwgdmFsdWUpOyB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk6IG51bWJlciB7IHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTsgfVxuICBjYW5jZWxBbmltYXRpb25GcmFtZShpZDogbnVtYmVyKSB7IGNsZWFyVGltZW91dChpZCk7IH1cbiAgcGVyZm9ybWFuY2VOb3coKTogbnVtYmVyIHsgcmV0dXJuIERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKTsgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuICd0cmFuc2l0aW9uZW5kJzsgfVxuICBzdXBwb3J0c0FuaW1hdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICByZXBsYWNlQ2hpbGQoZWwsIG5ld05vZGUsIG9sZE5vZGUpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGludm9rZShlbDogRWxlbWVudCwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IGFueSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgZ2V0RXZlbnRLZXkoZXZlbnQpOiBzdHJpbmcgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG59XG5cbi8vIFRPRE86IGJ1aWxkIGEgcHJvcGVyIGxpc3QsIHRoaXMgb25lIGlzIGFsbCB0aGUga2V5cyBvZiBhIEhUTUxJbnB1dEVsZW1lbnRcbnZhciBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QgPSBbXG4gIFwid2Via2l0RW50cmllc1wiLFxuICBcImluY3JlbWVudGFsXCIsXG4gIFwid2Via2l0ZGlyZWN0b3J5XCIsXG4gIFwic2VsZWN0aW9uRGlyZWN0aW9uXCIsXG4gIFwic2VsZWN0aW9uRW5kXCIsXG4gIFwic2VsZWN0aW9uU3RhcnRcIixcbiAgXCJsYWJlbHNcIixcbiAgXCJ2YWxpZGF0aW9uTWVzc2FnZVwiLFxuICBcInZhbGlkaXR5XCIsXG4gIFwid2lsbFZhbGlkYXRlXCIsXG4gIFwid2lkdGhcIixcbiAgXCJ2YWx1ZUFzTnVtYmVyXCIsXG4gIFwidmFsdWVBc0RhdGVcIixcbiAgXCJ2YWx1ZVwiLFxuICBcInVzZU1hcFwiLFxuICBcImRlZmF1bHRWYWx1ZVwiLFxuICBcInR5cGVcIixcbiAgXCJzdGVwXCIsXG4gIFwic3JjXCIsXG4gIFwic2l6ZVwiLFxuICBcInJlcXVpcmVkXCIsXG4gIFwicmVhZE9ubHlcIixcbiAgXCJwbGFjZWhvbGRlclwiLFxuICBcInBhdHRlcm5cIixcbiAgXCJuYW1lXCIsXG4gIFwibXVsdGlwbGVcIixcbiAgXCJtaW5cIixcbiAgXCJtaW5MZW5ndGhcIixcbiAgXCJtYXhMZW5ndGhcIixcbiAgXCJtYXhcIixcbiAgXCJsaXN0XCIsXG4gIFwiaW5kZXRlcm1pbmF0ZVwiLFxuICBcImhlaWdodFwiLFxuICBcImZvcm1UYXJnZXRcIixcbiAgXCJmb3JtTm9WYWxpZGF0ZVwiLFxuICBcImZvcm1NZXRob2RcIixcbiAgXCJmb3JtRW5jdHlwZVwiLFxuICBcImZvcm1BY3Rpb25cIixcbiAgXCJmaWxlc1wiLFxuICBcImZvcm1cIixcbiAgXCJkaXNhYmxlZFwiLFxuICBcImRpck5hbWVcIixcbiAgXCJjaGVja2VkXCIsXG4gIFwiZGVmYXVsdENoZWNrZWRcIixcbiAgXCJhdXRvZm9jdXNcIixcbiAgXCJhdXRvY29tcGxldGVcIixcbiAgXCJhbHRcIixcbiAgXCJhbGlnblwiLFxuICBcImFjY2VwdFwiLFxuICBcIm9uYXV0b2NvbXBsZXRlZXJyb3JcIixcbiAgXCJvbmF1dG9jb21wbGV0ZVwiLFxuICBcIm9ud2FpdGluZ1wiLFxuICBcIm9udm9sdW1lY2hhbmdlXCIsXG4gIFwib250b2dnbGVcIixcbiAgXCJvbnRpbWV1cGRhdGVcIixcbiAgXCJvbnN1c3BlbmRcIixcbiAgXCJvbnN1Ym1pdFwiLFxuICBcIm9uc3RhbGxlZFwiLFxuICBcIm9uc2hvd1wiLFxuICBcIm9uc2VsZWN0XCIsXG4gIFwib25zZWVraW5nXCIsXG4gIFwib25zZWVrZWRcIixcbiAgXCJvbnNjcm9sbFwiLFxuICBcIm9ucmVzaXplXCIsXG4gIFwib25yZXNldFwiLFxuICBcIm9ucmF0ZWNoYW5nZVwiLFxuICBcIm9ucHJvZ3Jlc3NcIixcbiAgXCJvbnBsYXlpbmdcIixcbiAgXCJvbnBsYXlcIixcbiAgXCJvbnBhdXNlXCIsXG4gIFwib25tb3VzZXdoZWVsXCIsXG4gIFwib25tb3VzZXVwXCIsXG4gIFwib25tb3VzZW92ZXJcIixcbiAgXCJvbm1vdXNlb3V0XCIsXG4gIFwib25tb3VzZW1vdmVcIixcbiAgXCJvbm1vdXNlbGVhdmVcIixcbiAgXCJvbm1vdXNlZW50ZXJcIixcbiAgXCJvbm1vdXNlZG93blwiLFxuICBcIm9ubG9hZHN0YXJ0XCIsXG4gIFwib25sb2FkZWRtZXRhZGF0YVwiLFxuICBcIm9ubG9hZGVkZGF0YVwiLFxuICBcIm9ubG9hZFwiLFxuICBcIm9ua2V5dXBcIixcbiAgXCJvbmtleXByZXNzXCIsXG4gIFwib25rZXlkb3duXCIsXG4gIFwib25pbnZhbGlkXCIsXG4gIFwib25pbnB1dFwiLFxuICBcIm9uZm9jdXNcIixcbiAgXCJvbmVycm9yXCIsXG4gIFwib25lbmRlZFwiLFxuICBcIm9uZW1wdGllZFwiLFxuICBcIm9uZHVyYXRpb25jaGFuZ2VcIixcbiAgXCJvbmRyb3BcIixcbiAgXCJvbmRyYWdzdGFydFwiLFxuICBcIm9uZHJhZ292ZXJcIixcbiAgXCJvbmRyYWdsZWF2ZVwiLFxuICBcIm9uZHJhZ2VudGVyXCIsXG4gIFwib25kcmFnZW5kXCIsXG4gIFwib25kcmFnXCIsXG4gIFwib25kYmxjbGlja1wiLFxuICBcIm9uY3VlY2hhbmdlXCIsXG4gIFwib25jb250ZXh0bWVudVwiLFxuICBcIm9uY2xvc2VcIixcbiAgXCJvbmNsaWNrXCIsXG4gIFwib25jaGFuZ2VcIixcbiAgXCJvbmNhbnBsYXl0aHJvdWdoXCIsXG4gIFwib25jYW5wbGF5XCIsXG4gIFwib25jYW5jZWxcIixcbiAgXCJvbmJsdXJcIixcbiAgXCJvbmFib3J0XCIsXG4gIFwic3BlbGxjaGVja1wiLFxuICBcImlzQ29udGVudEVkaXRhYmxlXCIsXG4gIFwiY29udGVudEVkaXRhYmxlXCIsXG4gIFwib3V0ZXJUZXh0XCIsXG4gIFwiaW5uZXJUZXh0XCIsXG4gIFwiYWNjZXNzS2V5XCIsXG4gIFwiaGlkZGVuXCIsXG4gIFwid2Via2l0ZHJvcHpvbmVcIixcbiAgXCJkcmFnZ2FibGVcIixcbiAgXCJ0YWJJbmRleFwiLFxuICBcImRpclwiLFxuICBcInRyYW5zbGF0ZVwiLFxuICBcImxhbmdcIixcbiAgXCJ0aXRsZVwiLFxuICBcImNoaWxkRWxlbWVudENvdW50XCIsXG4gIFwibGFzdEVsZW1lbnRDaGlsZFwiLFxuICBcImZpcnN0RWxlbWVudENoaWxkXCIsXG4gIFwiY2hpbGRyZW5cIixcbiAgXCJvbndlYmtpdGZ1bGxzY3JlZW5lcnJvclwiLFxuICBcIm9ud2Via2l0ZnVsbHNjcmVlbmNoYW5nZVwiLFxuICBcIm5leHRFbGVtZW50U2libGluZ1wiLFxuICBcInByZXZpb3VzRWxlbWVudFNpYmxpbmdcIixcbiAgXCJvbndoZWVsXCIsXG4gIFwib25zZWxlY3RzdGFydFwiLFxuICBcIm9uc2VhcmNoXCIsXG4gIFwib25wYXN0ZVwiLFxuICBcIm9uY3V0XCIsXG4gIFwib25jb3B5XCIsXG4gIFwib25iZWZvcmVwYXN0ZVwiLFxuICBcIm9uYmVmb3JlY3V0XCIsXG4gIFwib25iZWZvcmVjb3B5XCIsXG4gIFwic2hhZG93Um9vdFwiLFxuICBcImRhdGFzZXRcIixcbiAgXCJjbGFzc0xpc3RcIixcbiAgXCJjbGFzc05hbWVcIixcbiAgXCJvdXRlckhUTUxcIixcbiAgXCJpbm5lckhUTUxcIixcbiAgXCJzY3JvbGxIZWlnaHRcIixcbiAgXCJzY3JvbGxXaWR0aFwiLFxuICBcInNjcm9sbFRvcFwiLFxuICBcInNjcm9sbExlZnRcIixcbiAgXCJjbGllbnRIZWlnaHRcIixcbiAgXCJjbGllbnRXaWR0aFwiLFxuICBcImNsaWVudFRvcFwiLFxuICBcImNsaWVudExlZnRcIixcbiAgXCJvZmZzZXRQYXJlbnRcIixcbiAgXCJvZmZzZXRIZWlnaHRcIixcbiAgXCJvZmZzZXRXaWR0aFwiLFxuICBcIm9mZnNldFRvcFwiLFxuICBcIm9mZnNldExlZnRcIixcbiAgXCJsb2NhbE5hbWVcIixcbiAgXCJwcmVmaXhcIixcbiAgXCJuYW1lc3BhY2VVUklcIixcbiAgXCJpZFwiLFxuICBcInN0eWxlXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcInRhZ05hbWVcIixcbiAgXCJwYXJlbnRFbGVtZW50XCIsXG4gIFwidGV4dENvbnRlbnRcIixcbiAgXCJiYXNlVVJJXCIsXG4gIFwib3duZXJEb2N1bWVudFwiLFxuICBcIm5leHRTaWJsaW5nXCIsXG4gIFwicHJldmlvdXNTaWJsaW5nXCIsXG4gIFwibGFzdENoaWxkXCIsXG4gIFwiZmlyc3RDaGlsZFwiLFxuICBcImNoaWxkTm9kZXNcIixcbiAgXCJwYXJlbnROb2RlXCIsXG4gIFwibm9kZVR5cGVcIixcbiAgXCJub2RlVmFsdWVcIixcbiAgXCJub2RlTmFtZVwiLFxuICBcImNsb3N1cmVfbG1fNzE0NjE3XCIsXG4gIFwiX19qc2FjdGlvblwiXG5dO1xuIl19