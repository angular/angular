'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var generic_browser_adapter_1 = require('./generic_browser_adapter');
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex'
};
var DOM_KEY_LOCATION_NUMPAD = 3;
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
var BrowserDomAdapter = (function (_super) {
    __extends(BrowserDomAdapter, _super);
    function BrowserDomAdapter() {
        _super.apply(this, arguments);
    }
    BrowserDomAdapter.prototype.parse = function (templateHtml) { throw new Error("parse not implemented"); };
    BrowserDomAdapter.makeCurrent = function () { dom_adapter_1.setRootDomAdapter(new BrowserDomAdapter()); };
    BrowserDomAdapter.prototype.hasProperty = function (element, name) { return name in element; };
    BrowserDomAdapter.prototype.setProperty = function (el, name, value) { el[name] = value; };
    BrowserDomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    BrowserDomAdapter.prototype.invoke = function (el, methodName, args) {
        el[methodName].apply(el, args);
    };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.logError = function (error) {
        if (window.console.error) {
            window.console.error(error);
        }
        else {
            window.console.log(error);
        }
    };
    BrowserDomAdapter.prototype.log = function (error) { window.console.log(error); };
    BrowserDomAdapter.prototype.logGroup = function (error) {
        if (window.console.group) {
            window.console.group(error);
            this.logError(error);
        }
        else {
            window.console.log(error);
        }
    };
    BrowserDomAdapter.prototype.logGroupEnd = function () {
        if (window.console.groupEnd) {
            window.console.groupEnd();
        }
    };
    Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    BrowserDomAdapter.prototype.query = function (selector) { return document.querySelector(selector); };
    BrowserDomAdapter.prototype.querySelector = function (el, selector) { return el.querySelector(selector); };
    BrowserDomAdapter.prototype.querySelectorAll = function (el, selector) { return el.querySelectorAll(selector); };
    BrowserDomAdapter.prototype.on = function (el, evt, listener) { el.addEventListener(evt, listener, false); };
    BrowserDomAdapter.prototype.onAndCancel = function (el, evt, listener) {
        el.addEventListener(evt, listener, false);
        // Needed to follow Dart's subscription semantic, until fix of
        // https://code.google.com/p/dart/issues/detail?id=17406
        return function () { el.removeEventListener(evt, listener, false); };
    };
    BrowserDomAdapter.prototype.dispatchEvent = function (el, evt) { el.dispatchEvent(evt); };
    BrowserDomAdapter.prototype.createMouseEvent = function (eventType) {
        var evt = document.createEvent('MouseEvent');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.createEvent = function (eventType) {
        var evt = document.createEvent('Event');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.preventDefault = function (evt) {
        evt.preventDefault();
        evt.returnValue = false;
    };
    BrowserDomAdapter.prototype.isPrevented = function (evt) {
        return evt.defaultPrevented || lang_1.isPresent(evt.returnValue) && !evt.returnValue;
    };
    BrowserDomAdapter.prototype.getInnerHTML = function (el) { return el.innerHTML; };
    BrowserDomAdapter.prototype.getOuterHTML = function (el) { return el.outerHTML; };
    BrowserDomAdapter.prototype.nodeName = function (node) { return node.nodeName; };
    BrowserDomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
    BrowserDomAdapter.prototype.type = function (node) { return node.type; };
    BrowserDomAdapter.prototype.content = function (node) {
        if (this.hasProperty(node, "content")) {
            return node.content;
        }
        else {
            return node;
        }
    };
    BrowserDomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
    BrowserDomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
    BrowserDomAdapter.prototype.parentElement = function (el) { return el.parentNode; };
    BrowserDomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
    BrowserDomAdapter.prototype.childNodesAsList = function (el) {
        var childNodes = el.childNodes;
        var res = collection_1.ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    BrowserDomAdapter.prototype.clearNodes = function (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };
    BrowserDomAdapter.prototype.appendChild = function (el, node) { el.appendChild(node); };
    BrowserDomAdapter.prototype.removeChild = function (el, node) { el.removeChild(node); };
    BrowserDomAdapter.prototype.replaceChild = function (el, newChild, oldChild) { el.replaceChild(newChild, oldChild); };
    BrowserDomAdapter.prototype.remove = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    };
    BrowserDomAdapter.prototype.insertBefore = function (el, node) { el.parentNode.insertBefore(node, el); };
    BrowserDomAdapter.prototype.insertAllBefore = function (el, nodes) { nodes.forEach(function (n) { return el.parentNode.insertBefore(n, el); }); };
    BrowserDomAdapter.prototype.insertAfter = function (el, node) { el.parentNode.insertBefore(node, el.nextSibling); };
    BrowserDomAdapter.prototype.setInnerHTML = function (el, value) { el.innerHTML = value; };
    BrowserDomAdapter.prototype.getText = function (el) { return el.textContent; };
    // TODO(vicb): removed Element type because it does not support StyleElement
    BrowserDomAdapter.prototype.setText = function (el, value) { el.textContent = value; };
    BrowserDomAdapter.prototype.getValue = function (el) { return el.value; };
    BrowserDomAdapter.prototype.setValue = function (el, value) { el.value = value; };
    BrowserDomAdapter.prototype.getChecked = function (el) { return el.checked; };
    BrowserDomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
    BrowserDomAdapter.prototype.createComment = function (text) { return document.createComment(text); };
    BrowserDomAdapter.prototype.createTemplate = function (html) {
        var t = document.createElement('template');
        t.innerHTML = html;
        return t;
    };
    BrowserDomAdapter.prototype.createElement = function (tagName, doc) {
        if (doc === void 0) { doc = document; }
        return doc.createElement(tagName);
    };
    BrowserDomAdapter.prototype.createElementNS = function (ns, tagName, doc) {
        if (doc === void 0) { doc = document; }
        return doc.createElementNS(ns, tagName);
    };
    BrowserDomAdapter.prototype.createTextNode = function (text, doc) {
        if (doc === void 0) { doc = document; }
        return doc.createTextNode(text);
    };
    BrowserDomAdapter.prototype.createScriptTag = function (attrName, attrValue, doc) {
        if (doc === void 0) { doc = document; }
        var el = doc.createElement('SCRIPT');
        el.setAttribute(attrName, attrValue);
        return el;
    };
    BrowserDomAdapter.prototype.createStyleElement = function (css, doc) {
        if (doc === void 0) { doc = document; }
        var style = doc.createElement('style');
        this.appendChild(style, this.createTextNode(css));
        return style;
    };
    BrowserDomAdapter.prototype.createShadowRoot = function (el) { return el.createShadowRoot(); };
    BrowserDomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    BrowserDomAdapter.prototype.getHost = function (el) { return el.host; };
    BrowserDomAdapter.prototype.clone = function (node) { return node.cloneNode(true); };
    BrowserDomAdapter.prototype.getElementsByClassName = function (element, name) {
        return element.getElementsByClassName(name);
    };
    BrowserDomAdapter.prototype.getElementsByTagName = function (element, name) {
        return element.getElementsByTagName(name);
    };
    BrowserDomAdapter.prototype.classList = function (element) { return Array.prototype.slice.call(element.classList, 0); };
    BrowserDomAdapter.prototype.addClass = function (element, className) { element.classList.add(className); };
    BrowserDomAdapter.prototype.removeClass = function (element, className) { element.classList.remove(className); };
    BrowserDomAdapter.prototype.hasClass = function (element, className) { return element.classList.contains(className); };
    BrowserDomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        element.style[styleName] = styleValue;
    };
    BrowserDomAdapter.prototype.removeStyle = function (element, stylename) { element.style[stylename] = null; };
    BrowserDomAdapter.prototype.getStyle = function (element, stylename) { return element.style[stylename]; };
    BrowserDomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        if (styleValue === void 0) { styleValue = null; }
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    BrowserDomAdapter.prototype.tagName = function (element) { return element.tagName; };
    BrowserDomAdapter.prototype.attributeMap = function (element) {
        var res = new Map();
        var elAttrs = element.attributes;
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    BrowserDomAdapter.prototype.hasAttribute = function (element, attribute) { return element.hasAttribute(attribute); };
    BrowserDomAdapter.prototype.getAttribute = function (element, attribute) { return element.getAttribute(attribute); };
    BrowserDomAdapter.prototype.setAttribute = function (element, name, value) { element.setAttribute(name, value); };
    BrowserDomAdapter.prototype.setAttributeNS = function (element, ns, name, value) {
        element.setAttributeNS(ns, name, value);
    };
    BrowserDomAdapter.prototype.removeAttribute = function (element, attribute) { element.removeAttribute(attribute); };
    BrowserDomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
    BrowserDomAdapter.prototype.createHtmlDocument = function () {
        return document.implementation.createHTMLDocument('fakeTitle');
    };
    BrowserDomAdapter.prototype.defaultDoc = function () { return document; };
    BrowserDomAdapter.prototype.getBoundingClientRect = function (el) {
        try {
            return el.getBoundingClientRect();
        }
        catch (e) {
            return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        }
    };
    BrowserDomAdapter.prototype.getTitle = function () { return document.title; };
    BrowserDomAdapter.prototype.setTitle = function (newTitle) { document.title = newTitle || ''; };
    BrowserDomAdapter.prototype.elementMatches = function (n, selector) {
        var matches = false;
        if (n instanceof HTMLElement) {
            if (n.matches) {
                matches = n.matches(selector);
            }
            else if (n.msMatchesSelector) {
                matches = n.msMatchesSelector(selector);
            }
            else if (n.webkitMatchesSelector) {
                matches = n.webkitMatchesSelector(selector);
            }
        }
        return matches;
    };
    BrowserDomAdapter.prototype.isTemplateElement = function (el) {
        return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
    };
    BrowserDomAdapter.prototype.isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
    BrowserDomAdapter.prototype.isCommentNode = function (node) { return node.nodeType === Node.COMMENT_NODE; };
    BrowserDomAdapter.prototype.isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
    BrowserDomAdapter.prototype.hasShadowRoot = function (node) { return node instanceof HTMLElement && lang_1.isPresent(node.shadowRoot); };
    BrowserDomAdapter.prototype.isShadowRoot = function (node) { return node instanceof DocumentFragment; };
    BrowserDomAdapter.prototype.importIntoDoc = function (node) {
        var toImport = node;
        if (this.isTemplateElement(node)) {
            toImport = this.content(node);
        }
        return document.importNode(toImport, true);
    };
    BrowserDomAdapter.prototype.adoptNode = function (node) { return document.adoptNode(node); };
    BrowserDomAdapter.prototype.getHref = function (el) { return el.href; };
    BrowserDomAdapter.prototype.getEventKey = function (event) {
        var key = event.key;
        if (lang_1.isBlank(key)) {
            key = event.keyIdentifier;
            // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
            // Safari
            // cf
            // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
            if (lang_1.isBlank(key)) {
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
    };
    BrowserDomAdapter.prototype.getGlobalEventTarget = function (target) {
        if (target == "window") {
            return window;
        }
        else if (target == "document") {
            return document;
        }
        else if (target == "body") {
            return document.body;
        }
    };
    BrowserDomAdapter.prototype.getHistory = function () { return window.history; };
    BrowserDomAdapter.prototype.getLocation = function () { return window.location; };
    BrowserDomAdapter.prototype.getBaseHref = function () {
        var href = getBaseElementHref();
        if (lang_1.isBlank(href)) {
            return null;
        }
        return relativePath(href);
    };
    BrowserDomAdapter.prototype.resetBaseElement = function () { baseElement = null; };
    BrowserDomAdapter.prototype.getUserAgent = function () { return window.navigator.userAgent; };
    BrowserDomAdapter.prototype.setData = function (element, name, value) {
        this.setAttribute(element, 'data-' + name, value);
    };
    BrowserDomAdapter.prototype.getData = function (element, name) { return this.getAttribute(element, 'data-' + name); };
    BrowserDomAdapter.prototype.getComputedStyle = function (element) { return getComputedStyle(element); };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.setGlobalVar = function (path, value) { lang_1.setValueOnPath(lang_1.global, path, value); };
    BrowserDomAdapter.prototype.requestAnimationFrame = function (callback) { return window.requestAnimationFrame(callback); };
    BrowserDomAdapter.prototype.cancelAnimationFrame = function (id) { window.cancelAnimationFrame(id); };
    BrowserDomAdapter.prototype.performanceNow = function () {
        // performance.now() is not available in all browsers, see
        // http://caniuse.com/#search=performance.now
        if (lang_1.isPresent(window.performance) && lang_1.isPresent(window.performance.now)) {
            return window.performance.now();
        }
        else {
            return lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now());
        }
    };
    return BrowserDomAdapter;
})(generic_browser_adapter_1.GenericBrowserDomAdapter);
exports.BrowserDomAdapter = BrowserDomAdapter;
var baseElement = null;
function getBaseElementHref() {
    if (lang_1.isBlank(baseElement)) {
        baseElement = document.querySelector('base');
        if (lang_1.isBlank(baseElement)) {
            return null;
        }
    }
    return baseElement.getAttribute('href');
}
// based on urlUtils.js in AngularJS 1
var urlParsingNode = null;
function relativePath(url) {
    if (lang_1.isBlank(urlParsingNode)) {
        urlParsingNode = document.createElement("a");
    }
    urlParsingNode.setAttribute('href', url);
    return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
        '/' + urlParsingNode.pathname;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIvYnJvd3Nlcl9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEb21BZGFwdGVyIiwiQnJvd3NlckRvbUFkYXB0ZXIuY29uc3RydWN0b3IiLCJCcm93c2VyRG9tQWRhcHRlci5wYXJzZSIsIkJyb3dzZXJEb21BZGFwdGVyLm1ha2VDdXJyZW50IiwiQnJvd3NlckRvbUFkYXB0ZXIuaGFzUHJvcGVydHkiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRQcm9wZXJ0eSIsIkJyb3dzZXJEb21BZGFwdGVyLmdldFByb3BlcnR5IiwiQnJvd3NlckRvbUFkYXB0ZXIuaW52b2tlIiwiQnJvd3NlckRvbUFkYXB0ZXIubG9nRXJyb3IiLCJCcm93c2VyRG9tQWRhcHRlci5sb2ciLCJCcm93c2VyRG9tQWRhcHRlci5sb2dHcm91cCIsIkJyb3dzZXJEb21BZGFwdGVyLmxvZ0dyb3VwRW5kIiwiQnJvd3NlckRvbUFkYXB0ZXIuYXR0clRvUHJvcE1hcCIsIkJyb3dzZXJEb21BZGFwdGVyLnF1ZXJ5IiwiQnJvd3NlckRvbUFkYXB0ZXIucXVlcnlTZWxlY3RvciIsIkJyb3dzZXJEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3JBbGwiLCJCcm93c2VyRG9tQWRhcHRlci5vbiIsIkJyb3dzZXJEb21BZGFwdGVyLm9uQW5kQ2FuY2VsIiwiQnJvd3NlckRvbUFkYXB0ZXIuZGlzcGF0Y2hFdmVudCIsIkJyb3dzZXJEb21BZGFwdGVyLmNyZWF0ZU1vdXNlRXZlbnQiLCJCcm93c2VyRG9tQWRhcHRlci5jcmVhdGVFdmVudCIsIkJyb3dzZXJEb21BZGFwdGVyLnByZXZlbnREZWZhdWx0IiwiQnJvd3NlckRvbUFkYXB0ZXIuaXNQcmV2ZW50ZWQiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRJbm5lckhUTUwiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRPdXRlckhUTUwiLCJCcm93c2VyRG9tQWRhcHRlci5ub2RlTmFtZSIsIkJyb3dzZXJEb21BZGFwdGVyLm5vZGVWYWx1ZSIsIkJyb3dzZXJEb21BZGFwdGVyLnR5cGUiLCJCcm93c2VyRG9tQWRhcHRlci5jb250ZW50IiwiQnJvd3NlckRvbUFkYXB0ZXIuZmlyc3RDaGlsZCIsIkJyb3dzZXJEb21BZGFwdGVyLm5leHRTaWJsaW5nIiwiQnJvd3NlckRvbUFkYXB0ZXIucGFyZW50RWxlbWVudCIsIkJyb3dzZXJEb21BZGFwdGVyLmNoaWxkTm9kZXMiLCJCcm93c2VyRG9tQWRhcHRlci5jaGlsZE5vZGVzQXNMaXN0IiwiQnJvd3NlckRvbUFkYXB0ZXIuY2xlYXJOb2RlcyIsIkJyb3dzZXJEb21BZGFwdGVyLmFwcGVuZENoaWxkIiwiQnJvd3NlckRvbUFkYXB0ZXIucmVtb3ZlQ2hpbGQiLCJCcm93c2VyRG9tQWRhcHRlci5yZXBsYWNlQ2hpbGQiLCJCcm93c2VyRG9tQWRhcHRlci5yZW1vdmUiLCJCcm93c2VyRG9tQWRhcHRlci5pbnNlcnRCZWZvcmUiLCJCcm93c2VyRG9tQWRhcHRlci5pbnNlcnRBbGxCZWZvcmUiLCJCcm93c2VyRG9tQWRhcHRlci5pbnNlcnRBZnRlciIsIkJyb3dzZXJEb21BZGFwdGVyLnNldElubmVySFRNTCIsIkJyb3dzZXJEb21BZGFwdGVyLmdldFRleHQiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRUZXh0IiwiQnJvd3NlckRvbUFkYXB0ZXIuZ2V0VmFsdWUiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRWYWx1ZSIsIkJyb3dzZXJEb21BZGFwdGVyLmdldENoZWNrZWQiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRDaGVja2VkIiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlQ29tbWVudCIsIkJyb3dzZXJEb21BZGFwdGVyLmNyZWF0ZVRlbXBsYXRlIiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlRWxlbWVudCIsIkJyb3dzZXJEb21BZGFwdGVyLmNyZWF0ZUVsZW1lbnROUyIsIkJyb3dzZXJEb21BZGFwdGVyLmNyZWF0ZVRleHROb2RlIiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlU2NyaXB0VGFnIiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlU3R5bGVFbGVtZW50IiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlU2hhZG93Um9vdCIsIkJyb3dzZXJEb21BZGFwdGVyLmdldFNoYWRvd1Jvb3QiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRIb3N0IiwiQnJvd3NlckRvbUFkYXB0ZXIuY2xvbmUiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiQnJvd3NlckRvbUFkYXB0ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJCcm93c2VyRG9tQWRhcHRlci5jbGFzc0xpc3QiLCJCcm93c2VyRG9tQWRhcHRlci5hZGRDbGFzcyIsIkJyb3dzZXJEb21BZGFwdGVyLnJlbW92ZUNsYXNzIiwiQnJvd3NlckRvbUFkYXB0ZXIuaGFzQ2xhc3MiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRTdHlsZSIsIkJyb3dzZXJEb21BZGFwdGVyLnJlbW92ZVN0eWxlIiwiQnJvd3NlckRvbUFkYXB0ZXIuZ2V0U3R5bGUiLCJCcm93c2VyRG9tQWRhcHRlci5oYXNTdHlsZSIsIkJyb3dzZXJEb21BZGFwdGVyLnRhZ05hbWUiLCJCcm93c2VyRG9tQWRhcHRlci5hdHRyaWJ1dGVNYXAiLCJCcm93c2VyRG9tQWRhcHRlci5oYXNBdHRyaWJ1dGUiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRBdHRyaWJ1dGUiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRBdHRyaWJ1dGUiLCJCcm93c2VyRG9tQWRhcHRlci5zZXRBdHRyaWJ1dGVOUyIsIkJyb3dzZXJEb21BZGFwdGVyLnJlbW92ZUF0dHJpYnV0ZSIsIkJyb3dzZXJEb21BZGFwdGVyLnRlbXBsYXRlQXdhcmVSb290IiwiQnJvd3NlckRvbUFkYXB0ZXIuY3JlYXRlSHRtbERvY3VtZW50IiwiQnJvd3NlckRvbUFkYXB0ZXIuZGVmYXVsdERvYyIsIkJyb3dzZXJEb21BZGFwdGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkJyb3dzZXJEb21BZGFwdGVyLmdldFRpdGxlIiwiQnJvd3NlckRvbUFkYXB0ZXIuc2V0VGl0bGUiLCJCcm93c2VyRG9tQWRhcHRlci5lbGVtZW50TWF0Y2hlcyIsIkJyb3dzZXJEb21BZGFwdGVyLmlzVGVtcGxhdGVFbGVtZW50IiwiQnJvd3NlckRvbUFkYXB0ZXIuaXNUZXh0Tm9kZSIsIkJyb3dzZXJEb21BZGFwdGVyLmlzQ29tbWVudE5vZGUiLCJCcm93c2VyRG9tQWRhcHRlci5pc0VsZW1lbnROb2RlIiwiQnJvd3NlckRvbUFkYXB0ZXIuaGFzU2hhZG93Um9vdCIsIkJyb3dzZXJEb21BZGFwdGVyLmlzU2hhZG93Um9vdCIsIkJyb3dzZXJEb21BZGFwdGVyLmltcG9ydEludG9Eb2MiLCJCcm93c2VyRG9tQWRhcHRlci5hZG9wdE5vZGUiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRIcmVmIiwiQnJvd3NlckRvbUFkYXB0ZXIuZ2V0RXZlbnRLZXkiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRHbG9iYWxFdmVudFRhcmdldCIsIkJyb3dzZXJEb21BZGFwdGVyLmdldEhpc3RvcnkiLCJCcm93c2VyRG9tQWRhcHRlci5nZXRMb2NhdGlvbiIsIkJyb3dzZXJEb21BZGFwdGVyLmdldEJhc2VIcmVmIiwiQnJvd3NlckRvbUFkYXB0ZXIucmVzZXRCYXNlRWxlbWVudCIsIkJyb3dzZXJEb21BZGFwdGVyLmdldFVzZXJBZ2VudCIsIkJyb3dzZXJEb21BZGFwdGVyLnNldERhdGEiLCJCcm93c2VyRG9tQWRhcHRlci5nZXREYXRhIiwiQnJvd3NlckRvbUFkYXB0ZXIuZ2V0Q29tcHV0ZWRTdHlsZSIsIkJyb3dzZXJEb21BZGFwdGVyLnNldEdsb2JhbFZhciIsIkJyb3dzZXJEb21BZGFwdGVyLnJlcXVlc3RBbmltYXRpb25GcmFtZSIsIkJyb3dzZXJEb21BZGFwdGVyLmNhbmNlbEFuaW1hdGlvbkZyYW1lIiwiQnJvd3NlckRvbUFkYXB0ZXIucGVyZm9ybWFuY2VOb3ciLCJnZXRCYXNlRWxl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LENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUMxQ0EsQ0FBQ0E7QUFFRCxzQ0FBc0M7QUFDdEMsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzFCLHNCQUFzQixHQUFHO0lBQ3ZCQyxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1QkEsY0FBY0EsR0FBR0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDL0NBLENBQUNBO0lBQ0RBLGNBQWNBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3pDQSxNQUFNQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQSxRQUFRQTtRQUN2QkEsR0FBR0EsR0FBR0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7QUFDckZBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBnbG9iYWwsIHNldFZhbHVlT25QYXRoLCBEYXRlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7c2V0Um9vdERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXJ9IGZyb20gJy4vZ2VuZXJpY19icm93c2VyX2FkYXB0ZXInO1xuXG52YXIgX2F0dHJUb1Byb3BNYXAgPSB7XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnaW5uZXJIdG1sJzogJ2lubmVySFRNTCcsXG4gICdyZWFkb25seSc6ICdyZWFkT25seScsXG4gICd0YWJpbmRleCc6ICd0YWJJbmRleCdcbn07XG5cbmNvbnN0IERPTV9LRVlfTE9DQVRJT05fTlVNUEFEID0gMztcblxuLy8gTWFwIHRvIGNvbnZlcnQgc29tZSBrZXkgb3Iga2V5SWRlbnRpZmllciB2YWx1ZXMgdG8gd2hhdCB3aWxsIGJlIHJldHVybmVkIGJ5IGdldEV2ZW50S2V5XG52YXIgX2tleU1hcCA9IHtcbiAgLy8gVGhlIGZvbGxvd2luZyB2YWx1ZXMgYXJlIGhlcmUgZm9yIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJpbGl0eSBhbmQgdG8gbWF0Y2ggdGhlIFczQyBzdGFuZGFyZFxuICAvLyBjZiBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMta2V5L1xuICAnXFxiJzogJ0JhY2tzcGFjZScsXG4gICdcXHQnOiAnVGFiJyxcbiAgJ1xceDdGJzogJ0RlbGV0ZScsXG4gICdcXHgxQic6ICdFc2NhcGUnLFxuICAnRGVsJzogJ0RlbGV0ZScsXG4gICdFc2MnOiAnRXNjYXBlJyxcbiAgJ0xlZnQnOiAnQXJyb3dMZWZ0JyxcbiAgJ1JpZ2h0JzogJ0Fycm93UmlnaHQnLFxuICAnVXAnOiAnQXJyb3dVcCcsXG4gICdEb3duJzogJ0Fycm93RG93bicsXG4gICdNZW51JzogJ0NvbnRleHRNZW51JyxcbiAgJ1Njcm9sbCc6ICdTY3JvbGxMb2NrJyxcbiAgJ1dpbic6ICdPUydcbn07XG5cbi8vIFRoZXJlIGlzIGEgYnVnIGluIENocm9tZSBmb3IgbnVtZXJpYyBrZXlwYWQga2V5czpcbi8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNTU2NTRcbi8vIDEsIDIsIDMgLi4uIGFyZSByZXBvcnRlZCBhcyBBLCBCLCBDIC4uLlxudmFyIF9jaHJvbWVOdW1LZXlQYWRNYXAgPSB7XG4gICdBJzogJzEnLFxuICAnQic6ICcyJyxcbiAgJ0MnOiAnMycsXG4gICdEJzogJzQnLFxuICAnRSc6ICc1JyxcbiAgJ0YnOiAnNicsXG4gICdHJzogJzcnLFxuICAnSCc6ICc4JyxcbiAgJ0knOiAnOScsXG4gICdKJzogJyonLFxuICAnSyc6ICcrJyxcbiAgJ00nOiAnLScsXG4gICdOJzogJy4nLFxuICAnTyc6ICcvJyxcbiAgJ1xceDYwJzogJzAnLFxuICAnXFx4OTAnOiAnTnVtTG9jaydcbn07XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG5leHBvcnQgY2xhc3MgQnJvd3NlckRvbUFkYXB0ZXIgZXh0ZW5kcyBHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIge1xuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSBub3QgaW1wbGVtZW50ZWRcIik7IH1cbiAgc3RhdGljIG1ha2VDdXJyZW50KCkgeyBzZXRSb290RG9tQWRhcHRlcihuZXcgQnJvd3NlckRvbUFkYXB0ZXIoKSk7IH1cbiAgaGFzUHJvcGVydHkoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBuYW1lIGluIGVsZW1lbnQ7IH1cbiAgc2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7IGVsW25hbWVdID0gdmFsdWU7IH1cbiAgZ2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nKTogYW55IHsgcmV0dXJuIGVsW25hbWVdOyB9XG4gIGludm9rZShlbDogLyplbGVtZW50Ki8gYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHtcbiAgICBlbFttZXRob2ROYW1lXS5hcHBseShlbCwgYXJncyk7XG4gIH1cblxuICAvLyBUT0RPKHRib3NjaCk6IG1vdmUgdGhpcyBpbnRvIGEgc2VwYXJhdGUgZW52aXJvbm1lbnQgY2xhc3Mgb25jZSB3ZSBoYXZlIGl0XG4gIGxvZ0Vycm9yKGVycm9yKSB7XG4gICAgaWYgKHdpbmRvdy5jb25zb2xlLmVycm9yKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgbG9nKGVycm9yKSB7IHdpbmRvdy5jb25zb2xlLmxvZyhlcnJvcik7IH1cblxuICBsb2dHcm91cChlcnJvcikge1xuICAgIGlmICh3aW5kb3cuY29uc29sZS5ncm91cCkge1xuICAgICAgd2luZG93LmNvbnNvbGUuZ3JvdXAoZXJyb3IpO1xuICAgICAgdGhpcy5sb2dFcnJvcihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgbG9nR3JvdXBFbmQoKSB7XG4gICAgaWYgKHdpbmRvdy5jb25zb2xlLmdyb3VwRW5kKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhdHRyVG9Qcm9wTWFwKCk6IGFueSB7IHJldHVybiBfYXR0clRvUHJvcE1hcDsgfVxuXG4gIHF1ZXJ5KHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7IH1cbiAgcXVlcnlTZWxlY3RvcihlbCwgc2VsZWN0b3I6IHN0cmluZyk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9XG4gIHF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnlbXSB7IHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxuICBvbihlbCwgZXZ0LCBsaXN0ZW5lcikgeyBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgbGlzdGVuZXIsIGZhbHNlKTsgfVxuICBvbkFuZENhbmNlbChlbCwgZXZ0LCBsaXN0ZW5lcik6IEZ1bmN0aW9uIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAvLyBOZWVkZWQgdG8gZm9sbG93IERhcnQncyBzdWJzY3JpcHRpb24gc2VtYW50aWMsIHVudGlsIGZpeCBvZlxuICAgIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvZGFydC9pc3N1ZXMvZGV0YWlsP2lkPTE3NDA2XG4gICAgcmV0dXJuICgpID0+IHsgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGxpc3RlbmVyLCBmYWxzZSk7IH07XG4gIH1cbiAgZGlzcGF0Y2hFdmVudChlbCwgZXZ0KSB7IGVsLmRpc3BhdGNoRXZlbnQoZXZ0KTsgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZTogc3RyaW5nKTogTW91c2VFdmVudCB7XG4gICAgdmFyIGV2dDogTW91c2VFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgZXZ0LmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTogRXZlbnQge1xuICAgIHZhciBldnQ6IEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZXZ0LmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgcHJldmVudERlZmF1bHQoZXZ0OiBFdmVudCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICB9XG4gIGlzUHJldmVudGVkKGV2dDogRXZlbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgfHwgaXNQcmVzZW50KGV2dC5yZXR1cm5WYWx1ZSkgJiYgIWV2dC5yZXR1cm5WYWx1ZTtcbiAgfVxuICBnZXRJbm5lckhUTUwoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaW5uZXJIVE1MOyB9XG4gIGdldE91dGVySFRNTChlbCk6IHN0cmluZyB7IHJldHVybiBlbC5vdXRlckhUTUw7IH1cbiAgbm9kZU5hbWUobm9kZTogTm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLm5vZGVOYW1lOyB9XG4gIG5vZGVWYWx1ZShub2RlOiBOb2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUubm9kZVZhbHVlOyB9XG4gIHR5cGUobm9kZTogSFRNTElucHV0RWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBub2RlLnR5cGU7IH1cbiAgY29udGVudChub2RlOiBOb2RlKTogTm9kZSB7XG4gICAgaWYgKHRoaXMuaGFzUHJvcGVydHkobm9kZSwgXCJjb250ZW50XCIpKSB7XG4gICAgICByZXR1cm4gKDxhbnk+bm9kZSkuY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIGZpcnN0Q2hpbGQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLmZpcnN0Q2hpbGQ7IH1cbiAgbmV4dFNpYmxpbmcoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLm5leHRTaWJsaW5nOyB9XG4gIHBhcmVudEVsZW1lbnQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLnBhcmVudE5vZGU7IH1cbiAgY2hpbGROb2RlcyhlbCk6IE5vZGVbXSB7IHJldHVybiBlbC5jaGlsZE5vZGVzOyB9XG4gIGNoaWxkTm9kZXNBc0xpc3QoZWwpOiBhbnlbXSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBlbC5jaGlsZE5vZGVzO1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoY2hpbGROb2Rlcy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzW2ldID0gY2hpbGROb2Rlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBjbGVhck5vZGVzKGVsKSB7XG4gICAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcbiAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChlbCwgbm9kZSkgeyBlbC5hcHBlbmRDaGlsZChub2RlKTsgfVxuICByZW1vdmVDaGlsZChlbCwgbm9kZSkgeyBlbC5yZW1vdmVDaGlsZChub2RlKTsgfVxuICByZXBsYWNlQ2hpbGQoZWw6IE5vZGUsIG5ld0NoaWxkLCBvbGRDaGlsZCkgeyBlbC5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKTsgfVxuICByZW1vdmUobm9kZSk6IE5vZGUge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgaW5zZXJ0QmVmb3JlKGVsLCBub2RlKSB7IGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGVsKTsgfVxuICBpbnNlcnRBbGxCZWZvcmUoZWwsIG5vZGVzKSB7IG5vZGVzLmZvckVhY2gobiA9PiBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuLCBlbCkpOyB9XG4gIGluc2VydEFmdGVyKGVsLCBub2RlKSB7IGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGVsLm5leHRTaWJsaW5nKTsgfVxuICBzZXRJbm5lckhUTUwoZWwsIHZhbHVlKSB7IGVsLmlubmVySFRNTCA9IHZhbHVlOyB9XG4gIGdldFRleHQoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwudGV4dENvbnRlbnQ7IH1cbiAgLy8gVE9ETyh2aWNiKTogcmVtb3ZlZCBFbGVtZW50IHR5cGUgYmVjYXVzZSBpdCBkb2VzIG5vdCBzdXBwb3J0IFN0eWxlRWxlbWVudFxuICBzZXRUZXh0KGVsLCB2YWx1ZTogc3RyaW5nKSB7IGVsLnRleHRDb250ZW50ID0gdmFsdWU7IH1cbiAgZ2V0VmFsdWUoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwudmFsdWU7IH1cbiAgc2V0VmFsdWUoZWwsIHZhbHVlOiBzdHJpbmcpIHsgZWwudmFsdWUgPSB2YWx1ZTsgfVxuICBnZXRDaGVja2VkKGVsKTogYm9vbGVhbiB7IHJldHVybiBlbC5jaGVja2VkOyB9XG4gIHNldENoZWNrZWQoZWwsIHZhbHVlOiBib29sZWFuKSB7IGVsLmNoZWNrZWQgPSB2YWx1ZTsgfVxuICBjcmVhdGVDb21tZW50KHRleHQ6IHN0cmluZyk6IENvbW1lbnQgeyByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICB0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lLCBkb2MgPSBkb2N1bWVudCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50KHRhZ05hbWUpOyB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSwgZG9jID0gZG9jdW1lbnQpOiBFbGVtZW50IHsgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZ05hbWUpOyB9XG4gIGNyZWF0ZVRleHROb2RlKHRleHQ6IHN0cmluZywgZG9jID0gZG9jdW1lbnQpOiBUZXh0IHsgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVTY3JpcHRUYWcoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcsIGRvYyA9IGRvY3VtZW50KTogSFRNTFNjcmlwdEVsZW1lbnQge1xuICAgIHZhciBlbCA9IDxIVE1MU2NyaXB0RWxlbWVudD5kb2MuY3JlYXRlRWxlbWVudCgnU0NSSVBUJyk7XG4gICAgZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBjcmVhdGVTdHlsZUVsZW1lbnQoY3NzOiBzdHJpbmcsIGRvYyA9IGRvY3VtZW50KTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgdmFyIHN0eWxlID0gPEhUTUxTdHlsZUVsZW1lbnQ+ZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChzdHlsZSwgdGhpcy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbiAgY3JlYXRlU2hhZG93Um9vdChlbDogSFRNTEVsZW1lbnQpOiBEb2N1bWVudEZyYWdtZW50IHsgcmV0dXJuICg8YW55PmVsKS5jcmVhdGVTaGFkb3dSb290KCk7IH1cbiAgZ2V0U2hhZG93Um9vdChlbDogSFRNTEVsZW1lbnQpOiBEb2N1bWVudEZyYWdtZW50IHsgcmV0dXJuICg8YW55PmVsKS5zaGFkb3dSb290OyB9XG4gIGdldEhvc3QoZWw6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgeyByZXR1cm4gKDxhbnk+ZWwpLmhvc3Q7IH1cbiAgY2xvbmUobm9kZTogTm9kZSk6IE5vZGUgeyByZXR1cm4gbm9kZS5jbG9uZU5vZGUodHJ1ZSk7IH1cbiAgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKG5hbWUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHJldHVybiBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKG5hbWUpO1xuICB9XG4gIGNsYXNzTGlzdChlbGVtZW50KTogYW55W10geyByZXR1cm4gPGFueVtdPkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsZW1lbnQuY2xhc3NMaXN0LCAwKTsgfVxuICBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykgeyBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTsgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykgeyBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTsgfVxuICBoYXNDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTsgfVxuICBzZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5zdHlsZVtzdHlsZU5hbWVdID0gc3R5bGVWYWx1ZTtcbiAgfVxuICByZW1vdmVTdHlsZShlbGVtZW50LCBzdHlsZW5hbWU6IHN0cmluZykgeyBlbGVtZW50LnN0eWxlW3N0eWxlbmFtZV0gPSBudWxsOyB9XG4gIGdldFN0eWxlKGVsZW1lbnQsIHN0eWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGVsZW1lbnQuc3R5bGVbc3R5bGVuYW1lXTsgfVxuICBoYXNTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lKSB8fCAnJztcbiAgICByZXR1cm4gc3R5bGVWYWx1ZSA/IHZhbHVlID09IHN0eWxlVmFsdWUgOiB2YWx1ZS5sZW5ndGggPiAwO1xuICB9XG4gIHRhZ05hbWUoZWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnRhZ05hbWU7IH1cbiAgYXR0cmlidXRlTWFwKGVsZW1lbnQpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICB2YXIgcmVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICB2YXIgZWxBdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyaWIgPSBlbEF0dHJzW2ldO1xuICAgICAgcmVzLnNldChhdHRyaWIubmFtZSwgYXR0cmliLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBoYXNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSk7IH1cbiAgZ2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7IH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7IH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhucywgbmFtZSwgdmFsdWUpO1xuICB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykgeyBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpOyB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBIVE1MRG9jdW1lbnQge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ2Zha2VUaXRsZScpO1xuICB9XG4gIGRlZmF1bHREb2MoKTogSFRNTERvY3VtZW50IHsgcmV0dXJuIGRvY3VtZW50OyB9XG4gIGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbCk6IGFueSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4ge3RvcDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwLCByaWdodDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07XG4gICAgfVxuICB9XG4gIGdldFRpdGxlKCk6IHN0cmluZyB7IHJldHVybiBkb2N1bWVudC50aXRsZTsgfVxuICBzZXRUaXRsZShuZXdUaXRsZTogc3RyaW5nKSB7IGRvY3VtZW50LnRpdGxlID0gbmV3VGl0bGUgfHwgJyc7IH1cbiAgZWxlbWVudE1hdGNoZXMobiwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciBtYXRjaGVzID0gZmFsc2U7XG4gICAgaWYgKG4gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgaWYgKG4ubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVzID0gbi5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgICAgIH0gZWxzZSBpZiAobi5tc01hdGNoZXNTZWxlY3Rvcikge1xuICAgICAgICBtYXRjaGVzID0gbi5tc01hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9IGVsc2UgaWYgKG4ud2Via2l0TWF0Y2hlc1NlbGVjdG9yKSB7XG4gICAgICAgIG1hdGNoZXMgPSBuLndlYmtpdE1hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVzO1xuICB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbC5ub2RlTmFtZSA9PSBcIlRFTVBMQVRFXCI7XG4gIH1cbiAgaXNUZXh0Tm9kZShub2RlOiBOb2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERTsgfVxuICBpc0NvbW1lbnROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFOyB9XG4gIGlzRWxlbWVudE5vZGUobm9kZTogTm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7IH1cbiAgaGFzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgaXNQcmVzZW50KG5vZGUuc2hhZG93Um9vdCk7IH1cbiAgaXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50OyB9XG4gIGltcG9ydEludG9Eb2Mobm9kZTogTm9kZSk6IGFueSB7XG4gICAgdmFyIHRvSW1wb3J0ID0gbm9kZTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlRWxlbWVudChub2RlKSkge1xuICAgICAgdG9JbXBvcnQgPSB0aGlzLmNvbnRlbnQobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRvSW1wb3J0LCB0cnVlKTtcbiAgfVxuICBhZG9wdE5vZGUobm9kZTogTm9kZSk6IGFueSB7IHJldHVybiBkb2N1bWVudC5hZG9wdE5vZGUobm9kZSk7IH1cbiAgZ2V0SHJlZihlbDogRWxlbWVudCk6IHN0cmluZyB7IHJldHVybiAoPGFueT5lbCkuaHJlZjsgfVxuICBnZXRFdmVudEtleShldmVudCk6IHN0cmluZyB7XG4gICAgdmFyIGtleSA9IGV2ZW50LmtleTtcbiAgICBpZiAoaXNCbGFuayhrZXkpKSB7XG4gICAgICBrZXkgPSBldmVudC5rZXlJZGVudGlmaWVyO1xuICAgICAgLy8ga2V5SWRlbnRpZmllciBpcyBkZWZpbmVkIGluIHRoZSBvbGQgZHJhZnQgb2YgRE9NIExldmVsIDMgRXZlbnRzIGltcGxlbWVudGVkIGJ5IENocm9tZSBhbmRcbiAgICAgIC8vIFNhZmFyaVxuICAgICAgLy8gY2ZcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDcvV0QtRE9NLUxldmVsLTMtRXZlbnRzLTIwMDcxMjIxL2V2ZW50cy5odG1sI0V2ZW50cy1LZXlib2FyZEV2ZW50cy1JbnRlcmZhY2VzXG4gICAgICBpZiAoaXNCbGFuayhrZXkpKSB7XG4gICAgICAgIHJldHVybiAnVW5pZGVudGlmaWVkJztcbiAgICAgIH1cbiAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnVSsnKSkge1xuICAgICAgICBrZXkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KGtleS5zdWJzdHJpbmcoMiksIDE2KSk7XG4gICAgICAgIGlmIChldmVudC5sb2NhdGlvbiA9PT0gRE9NX0tFWV9MT0NBVElPTl9OVU1QQUQgJiYgX2Nocm9tZU51bUtleVBhZE1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgLy8gVGhlcmUgaXMgYSBidWcgaW4gQ2hyb21lIGZvciBudW1lcmljIGtleXBhZCBrZXlzOlxuICAgICAgICAgIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNTU2NTRcbiAgICAgICAgICAvLyAxLCAyLCAzIC4uLiBhcmUgcmVwb3J0ZWQgYXMgQSwgQiwgQyAuLi5cbiAgICAgICAgICBrZXkgPSBfY2hyb21lTnVtS2V5UGFkTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKF9rZXlNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAga2V5ID0gX2tleU1hcFtrZXldO1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9XG4gIGdldEdsb2JhbEV2ZW50VGFyZ2V0KHRhcmdldDogc3RyaW5nKTogRXZlbnRUYXJnZXQge1xuICAgIGlmICh0YXJnZXQgPT0gXCJ3aW5kb3dcIikge1xuICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImRvY3VtZW50XCIpIHtcbiAgICAgIHJldHVybiBkb2N1bWVudDtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImJvZHlcIikge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gICAgfVxuICB9XG4gIGdldEhpc3RvcnkoKTogSGlzdG9yeSB7IHJldHVybiB3aW5kb3cuaGlzdG9yeTsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHJldHVybiB3aW5kb3cubG9jYXRpb247IH1cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHtcbiAgICB2YXIgaHJlZiA9IGdldEJhc2VFbGVtZW50SHJlZigpO1xuICAgIGlmIChpc0JsYW5rKGhyZWYpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHJlbGF0aXZlUGF0aChocmVmKTtcbiAgfVxuICByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQgeyBiYXNlRWxlbWVudCA9IG51bGw7IH1cbiAgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7IHJldHVybiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDsgfVxuICBzZXREYXRhKGVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKGVsZW1lbnQsICdkYXRhLScgKyBuYW1lLCB2YWx1ZSk7XG4gIH1cbiAgZ2V0RGF0YShlbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoZWxlbWVudCwgJ2RhdGEtJyArIG5hbWUpOyB9XG4gIGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk6IGFueSB7IHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpOyB9XG4gIC8vIFRPRE8odGJvc2NoKTogbW92ZSB0aGlzIGludG8gYSBzZXBhcmF0ZSBlbnZpcm9ubWVudCBjbGFzcyBvbmNlIHdlIGhhdmUgaXRcbiAgc2V0R2xvYmFsVmFyKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkgeyBzZXRWYWx1ZU9uUGF0aChnbG9iYWwsIHBhdGgsIHZhbHVlKTsgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spOiBudW1iZXIgeyByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7IH1cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQ6IG51bWJlcikgeyB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpOyB9XG4gIHBlcmZvcm1hbmNlTm93KCk6IG51bWJlciB7XG4gICAgLy8gcGVyZm9ybWFuY2Uubm93KCkgaXMgbm90IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnMsIHNlZVxuICAgIC8vIGh0dHA6Ly9jYW5pdXNlLmNvbS8jc2VhcmNoPXBlcmZvcm1hbmNlLm5vd1xuICAgIGlmIChpc1ByZXNlbnQod2luZG93LnBlcmZvcm1hbmNlKSAmJiBpc1ByZXNlbnQod2luZG93LnBlcmZvcm1hbmNlLm5vdykpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSk7XG4gICAgfVxuICB9XG59XG5cblxudmFyIGJhc2VFbGVtZW50ID0gbnVsbDtcbmZ1bmN0aW9uIGdldEJhc2VFbGVtZW50SHJlZigpOiBzdHJpbmcge1xuICBpZiAoaXNCbGFuayhiYXNlRWxlbWVudCkpIHtcbiAgICBiYXNlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Jhc2UnKTtcbiAgICBpZiAoaXNCbGFuayhiYXNlRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG59XG5cbi8vIGJhc2VkIG9uIHVybFV0aWxzLmpzIGluIEFuZ3VsYXJKUyAxXG52YXIgdXJsUGFyc2luZ05vZGUgPSBudWxsO1xuZnVuY3Rpb24gcmVsYXRpdmVQYXRoKHVybCk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKHVybFBhcnNpbmdOb2RlKSkge1xuICAgIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gIH1cbiAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcbiAgcmV0dXJuICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgPyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWU7XG59XG4iXX0=