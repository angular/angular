import { ListWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, global, setValueOnPath, DateWrapper } from 'angular2/src/facade/lang';
import { setRootDomAdapter } from 'angular2/src/platform/dom/dom_adapter';
import { GenericBrowserDomAdapter } from './generic_browser_adapter';
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex'
};
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
/**
 * A `DomAdapter` powered by full browser DOM APIs.
 */
/* tslint:disable:requireParameterType */
export class BrowserDomAdapter extends GenericBrowserDomAdapter {
    parse(templateHtml) { throw new Error("parse not implemented"); }
    static makeCurrent() { setRootDomAdapter(new BrowserDomAdapter()); }
    hasProperty(element, name) { return name in element; }
    setProperty(el, name, value) { el[name] = value; }
    getProperty(el, name) { return el[name]; }
    invoke(el, methodName, args) {
        el[methodName].apply(el, args);
    }
    // TODO(tbosch): move this into a separate environment class once we have it
    logError(error) {
        if (window.console.error) {
            window.console.error(error);
        }
        else {
            window.console.log(error);
        }
    }
    log(error) { window.console.log(error); }
    logGroup(error) {
        if (window.console.group) {
            window.console.group(error);
            this.logError(error);
        }
        else {
            window.console.log(error);
        }
    }
    logGroupEnd() {
        if (window.console.groupEnd) {
            window.console.groupEnd();
        }
    }
    get attrToPropMap() { return _attrToPropMap; }
    query(selector) { return document.querySelector(selector); }
    querySelector(el, selector) { return el.querySelector(selector); }
    querySelectorAll(el, selector) { return el.querySelectorAll(selector); }
    on(el, evt, listener) { el.addEventListener(evt, listener, false); }
    onAndCancel(el, evt, listener) {
        el.addEventListener(evt, listener, false);
        // Needed to follow Dart's subscription semantic, until fix of
        // https://code.google.com/p/dart/issues/detail?id=17406
        return () => { el.removeEventListener(evt, listener, false); };
    }
    dispatchEvent(el, evt) { el.dispatchEvent(evt); }
    createMouseEvent(eventType) {
        var evt = document.createEvent('MouseEvent');
        evt.initEvent(eventType, true, true);
        return evt;
    }
    createEvent(eventType) {
        var evt = document.createEvent('Event');
        evt.initEvent(eventType, true, true);
        return evt;
    }
    preventDefault(evt) {
        evt.preventDefault();
        evt.returnValue = false;
    }
    isPrevented(evt) {
        return evt.defaultPrevented || isPresent(evt.returnValue) && !evt.returnValue;
    }
    getInnerHTML(el) { return el.innerHTML; }
    getOuterHTML(el) { return el.outerHTML; }
    nodeName(node) { return node.nodeName; }
    nodeValue(node) { return node.nodeValue; }
    type(node) { return node.type; }
    content(node) {
        if (this.hasProperty(node, "content")) {
            return node.content;
        }
        else {
            return node;
        }
    }
    firstChild(el) { return el.firstChild; }
    nextSibling(el) { return el.nextSibling; }
    parentElement(el) { return el.parentNode; }
    childNodes(el) { return el.childNodes; }
    childNodesAsList(el) {
        var childNodes = el.childNodes;
        var res = ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    }
    clearNodes(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
    appendChild(el, node) { el.appendChild(node); }
    removeChild(el, node) { el.removeChild(node); }
    replaceChild(el, newChild, oldChild) { el.replaceChild(newChild, oldChild); }
    remove(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    }
    insertBefore(el, node) { el.parentNode.insertBefore(node, el); }
    insertAllBefore(el, nodes) { nodes.forEach(n => el.parentNode.insertBefore(n, el)); }
    insertAfter(el, node) { el.parentNode.insertBefore(node, el.nextSibling); }
    setInnerHTML(el, value) { el.innerHTML = value; }
    getText(el) { return el.textContent; }
    // TODO(vicb): removed Element type because it does not support StyleElement
    setText(el, value) { el.textContent = value; }
    getValue(el) { return el.value; }
    setValue(el, value) { el.value = value; }
    getChecked(el) { return el.checked; }
    setChecked(el, value) { el.checked = value; }
    createComment(text) { return document.createComment(text); }
    createTemplate(html) {
        var t = document.createElement('template');
        t.innerHTML = html;
        return t;
    }
    createElement(tagName, doc = document) { return doc.createElement(tagName); }
    createElementNS(ns, tagName, doc = document) { return doc.createElementNS(ns, tagName); }
    createTextNode(text, doc = document) { return doc.createTextNode(text); }
    createScriptTag(attrName, attrValue, doc = document) {
        var el = doc.createElement('SCRIPT');
        el.setAttribute(attrName, attrValue);
        return el;
    }
    createStyleElement(css, doc = document) {
        var style = doc.createElement('style');
        this.appendChild(style, this.createTextNode(css));
        return style;
    }
    createShadowRoot(el) { return el.createShadowRoot(); }
    getShadowRoot(el) { return el.shadowRoot; }
    getHost(el) { return el.host; }
    clone(node) { return node.cloneNode(true); }
    getElementsByClassName(element, name) {
        return element.getElementsByClassName(name);
    }
    getElementsByTagName(element, name) {
        return element.getElementsByTagName(name);
    }
    classList(element) { return Array.prototype.slice.call(element.classList, 0); }
    addClass(element, className) { element.classList.add(className); }
    removeClass(element, className) { element.classList.remove(className); }
    hasClass(element, className) { return element.classList.contains(className); }
    setStyle(element, styleName, styleValue) {
        element.style[styleName] = styleValue;
    }
    removeStyle(element, stylename) { element.style[stylename] = null; }
    getStyle(element, stylename) { return element.style[stylename]; }
    hasStyle(element, styleName, styleValue = null) {
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    }
    tagName(element) { return element.tagName; }
    attributeMap(element) {
        var res = new Map();
        var elAttrs = element.attributes;
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    }
    hasAttribute(element, attribute) { return element.hasAttribute(attribute); }
    hasAttributeNS(element, ns, attribute) {
        return element.hasAttributeNS(ns, attribute);
    }
    getAttribute(element, attribute) { return element.getAttribute(attribute); }
    getAttributeNS(element, ns, name) {
        return element.getAttributeNS(ns, name);
    }
    setAttribute(element, name, value) { element.setAttribute(name, value); }
    setAttributeNS(element, ns, name, value) {
        element.setAttributeNS(ns, name, value);
    }
    removeAttribute(element, attribute) { element.removeAttribute(attribute); }
    removeAttributeNS(element, ns, name) { element.removeAttributeNS(ns, name); }
    templateAwareRoot(el) { return this.isTemplateElement(el) ? this.content(el) : el; }
    createHtmlDocument() {
        return document.implementation.createHTMLDocument('fakeTitle');
    }
    defaultDoc() { return document; }
    getBoundingClientRect(el) {
        try {
            return el.getBoundingClientRect();
        }
        catch (e) {
            return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        }
    }
    getTitle() { return document.title; }
    setTitle(newTitle) { document.title = newTitle || ''; }
    elementMatches(n, selector) {
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
    }
    isTemplateElement(el) {
        return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
    }
    isTextNode(node) { return node.nodeType === Node.TEXT_NODE; }
    isCommentNode(node) { return node.nodeType === Node.COMMENT_NODE; }
    isElementNode(node) { return node.nodeType === Node.ELEMENT_NODE; }
    hasShadowRoot(node) { return node instanceof HTMLElement && isPresent(node.shadowRoot); }
    isShadowRoot(node) { return node instanceof DocumentFragment; }
    importIntoDoc(node) {
        var toImport = node;
        if (this.isTemplateElement(node)) {
            toImport = this.content(node);
        }
        return document.importNode(toImport, true);
    }
    adoptNode(node) { return document.adoptNode(node); }
    getHref(el) { return el.href; }
    getEventKey(event) {
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
    getGlobalEventTarget(target) {
        if (target == "window") {
            return window;
        }
        else if (target == "document") {
            return document;
        }
        else if (target == "body") {
            return document.body;
        }
    }
    getHistory() { return window.history; }
    getLocation() { return window.location; }
    getBaseHref() {
        var href = getBaseElementHref();
        if (isBlank(href)) {
            return null;
        }
        return relativePath(href);
    }
    resetBaseElement() { baseElement = null; }
    getUserAgent() { return window.navigator.userAgent; }
    setData(element, name, value) {
        this.setAttribute(element, 'data-' + name, value);
    }
    getData(element, name) { return this.getAttribute(element, 'data-' + name); }
    getComputedStyle(element) { return getComputedStyle(element); }
    // TODO(tbosch): move this into a separate environment class once we have it
    setGlobalVar(path, value) { setValueOnPath(global, path, value); }
    requestAnimationFrame(callback) { return window.requestAnimationFrame(callback); }
    cancelAnimationFrame(id) { window.cancelAnimationFrame(id); }
    performanceNow() {
        // performance.now() is not available in all browsers, see
        // http://caniuse.com/#search=performance.now
        if (isPresent(window.performance) && isPresent(window.performance.now)) {
            return window.performance.now();
        }
        else {
            return DateWrapper.toMillis(DateWrapper.now());
        }
    }
}
var baseElement = null;
function getBaseElementHref() {
    if (isBlank(baseElement)) {
        baseElement = document.querySelector('base');
        if (isBlank(baseElement)) {
            return null;
        }
    }
    return baseElement.getAttribute('href');
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
