var parse5 = require('parse5/index');
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
var treeAdapter = parser.treeAdapter;
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { DomAdapter, setRootDomAdapter } from 'angular2/platform/common_dom';
import { isPresent, isBlank, global, setValueOnPath, DateWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { SelectorMatcher, CssSelector } from 'angular2/src/compiler/selector';
import { XHR } from 'angular2/src/compiler/xhr';
var _attrToPropMap = {
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
    hasProperty(element, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    setProperty(el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs["class"] = el.className = value;
        }
        else {
            el[name] = value;
        }
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    getProperty(el, name) { return el[name]; }
    logError(error) { console.error(error); }
    log(error) { console.log(error); }
    logGroup(error) { console.error(error); }
    logGroupEnd() { }
    getXHR() { return XHR; }
    get attrToPropMap() { return _attrToPropMap; }
    query(selector) { throw _notImplemented('query'); }
    querySelector(el, selector) { return this.querySelectorAll(el, selector)[0]; }
    querySelectorAll(el, selector) {
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
    elementMatches(node, selector, matcher = null) {
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
            matcher.match(cssSelector, function (selector, cb) { result = true; });
        }
        return result;
    }
    on(el, evt, listener) {
        var listenersMap = el._eventListenersMap;
        if (isBlank(listenersMap)) {
            var listenersMap = StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = StringMapWrapper.get(listenersMap, evt);
        if (isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        StringMapWrapper.set(listenersMap, evt, listeners);
    }
    onAndCancel(el, evt, listener) {
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
            var listeners = StringMapWrapper.get(el._eventListenersMap, evt.type);
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
            preventDefault: () => { evt.defaultPrevented = true; }
        };
        return evt;
    }
    preventDefault(evt) { evt.returnValue = false; }
    isPrevented(evt) { return isPresent(evt.returnValue) && !evt.returnValue; }
    getInnerHTML(el) { return serializer.serialize(this.templateAwareRoot(el)); }
    getOuterHTML(el) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    }
    nodeName(node) { return node.tagName; }
    nodeValue(node) { return node.nodeValue; }
    type(node) { throw _notImplemented('type'); }
    content(node) { return node.childNodes[0]; }
    firstChild(el) { return el.firstChild; }
    nextSibling(el) { return el.nextSibling; }
    parentElement(el) { return el.parent; }
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
    insertAllBefore(el, nodes) { nodes.forEach(n => this.insertBefore(el, n)); }
    insertAfter(el, node) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
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
        }
        else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
            return "";
        }
        else {
            var textContent = "";
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i]);
            }
            return textContent;
        }
    }
    setText(el, value) {
        if (this.isTextNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    }
    getValue(el) { return el.value; }
    setValue(el, value) { el.value = value; }
    getChecked(el) { return el.checked; }
    setChecked(el, value) { el.checked = value; }
    createComment(text) { return treeAdapter.createCommentNode(text); }
    createTemplate(html) {
        var template = treeAdapter.createElement("template", 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    }
    createElement(tagName) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    }
    createElementNS(ns, tagName) { throw 'not implemented'; }
    createTextNode(text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    }
    createScriptTag(attrName, attrValue) {
        return treeAdapter.createElement("script", 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    }
    createStyleElement(css) {
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
    getDistributedNodes(el) { throw _notImplemented('getDistributedNodes'); }
    clone(node) {
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
    getElementsByClassName(element, name) {
        return this.querySelectorAll(element, "." + name);
    }
    getElementsByTagName(element, name) {
        throw _notImplemented('getElementsByTagName');
    }
    classList(element) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty("class")) {
            classAttrValue = attributes["class"];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    }
    addClass(element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs["class"] = element.className = classList.join(" ");
        }
    }
    removeClass(element, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs["class"] = element.className = classList.join(" ");
        }
    }
    hasClass(element, className) {
        return ListWrapper.contains(this.classList(element), className);
    }
    hasStyle(element, styleName, styleValue = null) {
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
    setStyle(element, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    }
    removeStyle(element, styleName) { this.setStyle(element, styleName, null); }
    getStyle(element, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : "";
    }
    tagName(element) { return element.tagName == "style" ? "STYLE" : element.tagName; }
    attributeMap(element) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    }
    hasAttribute(element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    }
    getAttribute(element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    }
    setAttribute(element, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    }
    setAttributeNS(element, ns, attribute, value) { throw 'not implemented'; }
    removeAttribute(element, attribute) {
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
    getBoundingClientRect(el) { return { left: 0, top: 0, width: 0, height: 0 }; }
    getTitle() { return this.defaultDoc().title || ""; }
    setTitle(newTitle) { this.defaultDoc().title = newTitle; }
    isTemplateElement(el) {
        return this.isElementNode(el) && this.tagName(el) === "template";
    }
    isTextNode(node) { return treeAdapter.isTextNode(node); }
    isCommentNode(node) { return treeAdapter.isCommentNode(node); }
    isElementNode(node) { return node ? treeAdapter.isElementNode(node) : false; }
    hasShadowRoot(node) { return isPresent(node.shadowRoot); }
    isShadowRoot(node) { return this.getShadowRoot(node) == node; }
    importIntoDoc(node) { return this.clone(node); }
    adoptNode(node) { return node; }
    getHref(el) { return el.href; }
    resolveAndSetHref(el, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    }
    /** @internal */
    _buildRules(parsedRules, css) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = StringMapWrapper.create();
            StringMapWrapper.set(rule, "cssText", css);
            StringMapWrapper.set(rule, "style", { content: "", cssText: "" });
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
                    StringMapWrapper.set(StringMapWrapper.get(rule, "style"), declaration.property, declaration.value);
                    StringMapWrapper.get(rule, "style").cssText +=
                        declaration.property + ": " + declaration.value + ";";
                }
            }
            else if (parsedRule.type == "media") {
                StringMapWrapper.set(rule, "type", 4);
                StringMapWrapper.set(rule, "media", { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    StringMapWrapper.set(rule, "cssRules", this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    }
    supportsDOMEvents() { return false; }
    supportsNativeShadowDOM() { return false; }
    getGlobalEventTarget(target) {
        if (target == "window") {
            return this.defaultDoc()._window;
        }
        else if (target == "document") {
            return this.defaultDoc();
        }
        else if (target == "body") {
            return this.defaultDoc().body;
        }
    }
    getBaseHref() { throw 'not implemented'; }
    resetBaseElement() { throw 'not implemented'; }
    getHistory() { throw 'not implemented'; }
    getLocation() { throw 'not implemented'; }
    getUserAgent() { return "Fake user agent"; }
    getData(el, name) { return this.getAttribute(el, 'data-' + name); }
    getComputedStyle(el) { throw 'not implemented'; }
    setData(el, name, value) { this.setAttribute(el, 'data-' + name, value); }
    // TODO(tbosch): move this into a separate environment class once we have it
    setGlobalVar(path, value) { setValueOnPath(global, path, value); }
    requestAnimationFrame(callback) { return setTimeout(callback, 0); }
    cancelAnimationFrame(id) { clearTimeout(id); }
    performanceNow() { return DateWrapper.toMillis(DateWrapper.now()); }
    getAnimationPrefix() { return ''; }
    getTransitionEnd() { return 'transitionend'; }
    supportsAnimation() { return true; }
    replaceChild(el, newNode, oldNode) { throw new Error('not implemented'); }
    parse(templateHtml) { throw new Error('not implemented'); }
    invoke(el, methodName, args) { throw new Error('not implemented'); }
    getEventKey(event) { throw new Error('not implemented'); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLm1ha2VDdXJyZW50IiwiUGFyc2U1RG9tQWRhcHRlci5oYXNQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0UHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLmdldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5sb2dFcnJvciIsIlBhcnNlNURvbUFkYXB0ZXIubG9nIiwiUGFyc2U1RG9tQWRhcHRlci5sb2dHcm91cCIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXBFbmQiLCJQYXJzZTVEb21BZGFwdGVyLmdldFhIUiIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0clRvUHJvcE1hcCIsIlBhcnNlNURvbUFkYXB0ZXIucXVlcnkiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3IiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3JBbGwiLCJQYXJzZTVEb21BZGFwdGVyLmVsZW1lbnRNYXRjaGVzIiwiUGFyc2U1RG9tQWRhcHRlci5vbiIsIlBhcnNlNURvbUFkYXB0ZXIub25BbmRDYW5jZWwiLCJQYXJzZTVEb21BZGFwdGVyLmRpc3BhdGNoRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZU1vdXNlRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5wcmV2ZW50RGVmYXVsdCIsIlBhcnNlNURvbUFkYXB0ZXIuaXNQcmV2ZW50ZWQiLCJQYXJzZTVEb21BZGFwdGVyLmdldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0T3V0ZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5ub2RlTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZVZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci50eXBlIiwiUGFyc2U1RG9tQWRhcHRlci5jb250ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5maXJzdENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5uZXh0U2libGluZyIsIlBhcnNlNURvbUFkYXB0ZXIucGFyZW50RWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2Rlc0FzTGlzdCIsIlBhcnNlNURvbUFkYXB0ZXIuY2xlYXJOb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuYXBwZW5kQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWxsQmVmb3JlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRBZnRlciIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0SW5uZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLnNldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUNvbW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRlbXBsYXRlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50TlMiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTY3JpcHRUYWciLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVN0eWxlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SG9zdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGlzdHJpYnV0ZWROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2xvbmUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5jbGFzc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmFkZENsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1N0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5fcmVhZFN0eWxlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5fd3JpdGVTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZVN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIudGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0cmlidXRlTWFwIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0QXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci50ZW1wbGF0ZUF3YXJlUm9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlSHRtbERvY3VtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5kZWZhdWx0RG9jIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRpdGxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuaXNUZW1wbGF0ZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGV4dE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzQ29tbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzRWxlbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmlzU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuaW1wb3J0SW50b0RvYyIsIlBhcnNlNURvbUFkYXB0ZXIuYWRvcHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNvbHZlQW5kU2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIuX2J1aWxkUnVsZXMiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzRE9NRXZlbnRzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0R2xvYmFsRXZlbnRUYXJnZXQiLCJQYXJzZTVEb21BZGFwdGVyLmdldEJhc2VIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNldEJhc2VFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIaXN0b3J5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRMb2NhdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VXNlckFnZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDb21wdXRlZFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRHbG9iYWxWYXIiLCJQYXJzZTVEb21BZGFwdGVyLnJlcXVlc3RBbmltYXRpb25GcmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLnBlcmZvcm1hbmNlTm93IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBbmltYXRpb25QcmVmaXgiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRyYW5zaXRpb25FbmQiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzQW5pbWF0aW9uIiwiUGFyc2U1RG9tQWRhcHRlci5yZXBsYWNlQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnBhcnNlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnZva2UiLCJQYXJzZTVEb21BZGFwdGVyLmdldEV2ZW50S2V5Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztPQUU5QixFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNqRixFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDhCQUE4QjtPQUNuRSxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsTUFBTSxFQUVOLGNBQWMsRUFDZCxXQUFXLEVBQ1osTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQjtBQUU3QyxJQUFJLGNBQWMsR0FBNEI7SUFDNUMsT0FBTyxFQUFFLFdBQVc7SUFDcEIsV0FBVyxFQUFFLFdBQVc7SUFDeEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsVUFBVSxF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QSxDQUFDQTtRQUNaQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxXQUFXQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNyQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7Z0JBQzlDQSxXQUFXQSxJQUFJQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDckJBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0R6QyxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxLQUFhQTtRQUN2QjBDLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNsQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBO2dCQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0REEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDRDFDLFFBQVFBLENBQUNBLEVBQUVBLElBQVkyQyxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN6QzNDLFFBQVFBLENBQUNBLEVBQUVBLEVBQUVBLEtBQWFBLElBQUk0QyxFQUFFQSxDQUFDQSxLQUFLQSxHQUFH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STtJQUNKLE9BQU87SUFDUCxZQUFZO0lBQ1osU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLFdBQVc7SUFDWCxZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixVQUFVO0lBQ1YsV0FBVztJQUNYLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsWUFBWTtDQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcGFyc2U1ID0gcmVxdWlyZSgncGFyc2U1L2luZGV4Jyk7XG52YXIgcGFyc2VyID0gbmV3IHBhcnNlNS5QYXJzZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgc2VyaWFsaXplciA9IG5ldyBwYXJzZTUuU2VyaWFsaXplcihwYXJzZTUuVHJlZUFkYXB0ZXJzLmh0bWxwYXJzZXIyKTtcbnZhciB0cmVlQWRhcHRlciA9IHBhcnNlci50cmVlQWRhcHRlcjtcblxuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RG9tQWRhcHRlciwgc2V0Um9vdERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBnbG9iYWwsXG4gIFR5cGUsXG4gIHNldFZhbHVlT25QYXRoLFxuICBEYXRlV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTZWxlY3Rvck1hdGNoZXIsIENzc1NlbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG52YXIgX2F0dHJUb1Byb3BNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnLFxufTtcbnZhciBkZWZEb2MgPSBudWxsO1xuXG52YXIgbWFwUHJvcHMgPSBbJ2F0dHJpYnMnLCAneC1hdHRyaWJzTmFtZXNwYWNlJywgJ3gtYXR0cmlic1ByZWZpeCddO1xuXG5mdW5jdGlvbiBfbm90SW1wbGVtZW50ZWQobWV0aG9kTmFtZSkge1xuICByZXR1cm4gbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBQYXJzZTVEb21BZGFwdGVyOiAnICsgbWV0aG9kTmFtZSk7XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG5leHBvcnQgY2xhc3MgUGFyc2U1RG9tQWRhcHRlciBleHRlbmRzIERvbUFkYXB0ZXIge1xuICBzdGF0aWMgbWFrZUN1cnJlbnQoKSB7IHNldFJvb3REb21BZGFwdGVyKG5ldyBQYXJzZTVEb21BZGFwdGVyKCkpOyB9XG5cbiAgaGFzUHJvcGVydHkoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdC5pbmRleE9mKG5hbWUpID4gLTE7XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgc2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKG5hbWUgPT09ICdpbm5lckhUTUwnKSB7XG4gICAgICB0aGlzLnNldElubmVySFRNTChlbCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgIGVsLmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsLmNsYXNzTmFtZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICAvLyBUT0RPKHRib3NjaCk6IGRvbid0IGV2ZW4gY2FsbCB0aGlzIG1ldGhvZCB3aGVuIHdlIHJ1biB0aGUgdGVzdHMgb24gc2VydmVyIHNpZGVcbiAgLy8gYnkgbm90IHVzaW5nIHRoZSBEb21SZW5kZXJlciBpbiB0ZXN0cy4gS2VlcGluZyB0aGlzIGZvciBub3cgdG8gbWFrZSB0ZXN0cyBoYXBweS4uLlxuICBnZXRQcm9wZXJ0eShlbDogLyplbGVtZW50Ki8gYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gZWxbbmFtZV07IH1cblxuICBsb2dFcnJvcihlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZyhlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cblxuICBsb2dHcm91cChlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZ0dyb3VwRW5kKCkge31cblxuICBnZXRYSFIoKTogVHlwZSB7IHJldHVybiBYSFI7IH1cblxuICBnZXQgYXR0clRvUHJvcE1hcCgpIHsgcmV0dXJuIF9hdHRyVG9Qcm9wTWFwOyB9XG5cbiAgcXVlcnkoc2VsZWN0b3IpIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdxdWVyeScpOyB9XG4gIHF1ZXJ5U2VsZWN0b3IoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGVsLCBzZWxlY3RvcilbMF07IH1cbiAgcXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgdmFyIF9yZWN1cnNpdmUgPSAocmVzdWx0LCBub2RlLCBzZWxlY3RvciwgbWF0Y2hlcikgPT4ge1xuICAgICAgdmFyIGNOb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICAgIGlmIChjTm9kZXMgJiYgY05vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gY05vZGVzW2ldO1xuICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRNYXRjaGVzKGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVjdXJzaXZlKHJlc3VsdCwgY2hpbGROb2RlLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICBfcmVjdXJzaXZlKHJlcywgZWwsIHNlbGVjdG9yLCBtYXRjaGVyKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGVsZW1lbnRNYXRjaGVzKG5vZGUsIHNlbGVjdG9yOiBzdHJpbmcsIG1hdGNoZXIgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbGVtZW50Tm9kZShub2RlKSAmJiBzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChzZWxlY3RvciAmJiBzZWxlY3Rvci5jaGFyQXQoMCkgPT0gXCIjXCIpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5vZGUsICdpZCcpID09IHNlbGVjdG9yLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBpZiAobWF0Y2hlciA9PSBudWxsKSB7XG4gICAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gICAgICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KHRoaXMudGFnTmFtZShub2RlKSk7XG4gICAgICBpZiAobm9kZS5hdHRyaWJzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIG5vZGUuYXR0cmlicykge1xuICAgICAgICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZSwgbm9kZS5hdHRyaWJzW2F0dHJOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChub2RlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc0xpc3RbaV0pO1xuICAgICAgfVxuXG4gICAgICBtYXRjaGVyLm1hdGNoKGNzc1NlbGVjdG9yLCBmdW5jdGlvbihzZWxlY3RvciwgY2IpIHsgcmVzdWx0ID0gdHJ1ZTsgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgb24oZWwsIGV2dCwgbGlzdGVuZXIpIHtcbiAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IGVsLl9ldmVudExpc3RlbmVyc01hcDtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBlbC5fZXZlbnRMaXN0ZW5lcnNNYXAgPSBsaXN0ZW5lcnNNYXA7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChsaXN0ZW5lcnNNYXAsIGV2dCk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChsaXN0ZW5lcnNNYXAsIGV2dCwgbGlzdGVuZXJzKTtcbiAgfVxuICBvbkFuZENhbmNlbChlbCwgZXZ0LCBsaXN0ZW5lcik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLm9uKGVsLCBldnQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKFN0cmluZ01hcFdyYXBwZXIuZ2V0PGFueVtdPihlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dCksIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9XG4gIGRpc3BhdGNoRXZlbnQoZWwsIGV2dCkge1xuICAgIGlmIChpc0JsYW5rKGV2dC50YXJnZXQpKSB7XG4gICAgICBldnQudGFyZ2V0ID0gZWw7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyczogYW55ID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQudHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGxpc3RlbmVycykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0oZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLnBhcmVudCkpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5wYXJlbnQsIGV2dCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX3dpbmRvdykpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5fd2luZG93LCBldnQpO1xuICAgIH1cbiAgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZSk6IEV2ZW50IHsgcmV0dXJuIHRoaXMuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTsgfVxuICBjcmVhdGVFdmVudChldmVudFR5cGU6IHN0cmluZyk6IEV2ZW50IHtcbiAgICB2YXIgZXZ0ID0gPEV2ZW50PntcbiAgICAgIHR5cGU6IGV2ZW50VHlwZSxcbiAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6ICgpID0+IHsgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9XG4gICAgfTtcbiAgICByZXR1cm4gZXZ0O1xuICB9XG4gIHByZXZlbnREZWZhdWx0KGV2dCkgeyBldnQucmV0dXJuVmFsdWUgPSBmYWxzZTsgfVxuICBpc1ByZXZlbnRlZChldnQpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChldnQucmV0dXJuVmFsdWUpICYmICFldnQucmV0dXJuVmFsdWU7IH1cbiAgZ2V0SW5uZXJIVE1MKGVsKTogc3RyaW5nIHsgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpKTsgfVxuICBnZXRPdXRlckhUTUwoZWwpOiBzdHJpbmcge1xuICAgIHNlcmlhbGl6ZXIuaHRtbCA9ICcnO1xuICAgIHNlcmlhbGl6ZXIuX3NlcmlhbGl6ZUVsZW1lbnQoZWwpO1xuICAgIHJldHVybiBzZXJpYWxpemVyLmh0bWw7XG4gIH1cbiAgbm9kZU5hbWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLnRhZ05hbWU7IH1cbiAgbm9kZVZhbHVlKG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5ub2RlVmFsdWU7IH1cbiAgdHlwZShub2RlOiBhbnkpOiBzdHJpbmcgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3R5cGUnKTsgfVxuICBjb250ZW50KG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS5jaGlsZE5vZGVzWzBdOyB9XG4gIGZpcnN0Q2hpbGQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLmZpcnN0Q2hpbGQ7IH1cbiAgbmV4dFNpYmxpbmcoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLm5leHRTaWJsaW5nOyB9XG4gIHBhcmVudEVsZW1lbnQoZWwpOiBOb2RlIHsgcmV0dXJuIGVsLnBhcmVudDsgfVxuICBjaGlsZE5vZGVzKGVsKTogTm9kZVtdIHsgcmV0dXJuIGVsLmNoaWxkTm9kZXM7IH1cbiAgY2hpbGROb2Rlc0FzTGlzdChlbCk6IGFueVtdIHtcbiAgICB2YXIgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXM7XG4gICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShjaGlsZE5vZGVzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXNbaV0gPSBjaGlsZE5vZGVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGNsZWFyTm9kZXMoZWwpIHtcbiAgICB3aGlsZSAoZWwuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbW92ZShlbC5jaGlsZE5vZGVzWzBdKTtcbiAgICB9XG4gIH1cbiAgYXBwZW5kQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZCh0aGlzLnRlbXBsYXRlQXdhcmVSb290KGVsKSwgbm9kZSk7XG4gIH1cbiAgcmVtb3ZlQ2hpbGQoZWwsIG5vZGUpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMoZWwuY2hpbGROb2Rlcywgbm9kZSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIH1cbiAgfVxuICByZW1vdmUoZWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudDtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB2YXIgaW5kZXggPSBwYXJlbnQuY2hpbGROb2Rlcy5pbmRleE9mKGVsKTtcbiAgICAgIHBhcmVudC5jaGlsZE5vZGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNTaWJsaW5nO1xuICAgIHZhciBuZXh0ID0gZWwubmV4dFNpYmxpbmc7XG4gICAgaWYgKHByZXYpIHtcbiAgICAgIHByZXYubmV4dCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0KSB7XG4gICAgICBuZXh0LnByZXYgPSBwcmV2O1xuICAgIH1cbiAgICBlbC5wcmV2ID0gbnVsbDtcbiAgICBlbC5uZXh0ID0gbnVsbDtcbiAgICBlbC5wYXJlbnQgPSBudWxsO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBpbnNlcnRCZWZvcmUoZWwsIG5vZGUpIHtcbiAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB0cmVlQWRhcHRlci5pbnNlcnRCZWZvcmUoZWwucGFyZW50LCBub2RlLCBlbCk7XG4gIH1cbiAgaW5zZXJ0QWxsQmVmb3JlKGVsLCBub2RlcykgeyBub2Rlcy5mb3JFYWNoKG4gPT4gdGhpcy5pbnNlcnRCZWZvcmUoZWwsIG4pKTsgfVxuICBpbnNlcnRBZnRlcihlbCwgbm9kZSkge1xuICAgIGlmIChlbC5uZXh0U2libGluZykge1xuICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWwubmV4dFNpYmxpbmcsIG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGVuZENoaWxkKGVsLnBhcmVudCwgbm9kZSk7XG4gICAgfVxuICB9XG4gIHNldElubmVySFRNTChlbCwgdmFsdWUpIHtcbiAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgIHZhciBjb250ZW50ID0gcGFyc2VyLnBhcnNlRnJhZ21lbnQodmFsdWUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cmVlQWRhcHRlci5hcHBlbmRDaGlsZChlbCwgY29udGVudC5jaGlsZE5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbiAgZ2V0VGV4dChlbCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkpIHtcbiAgICAgIHJldHVybiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhlbC5jaGlsZE5vZGVzKSB8fCBlbC5jaGlsZE5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ZXh0Q29udGVudCArPSB0aGlzLmdldFRleHQoZWwuY2hpbGROb2Rlc1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQ7XG4gICAgfVxuICB9XG4gIHNldFRleHQoZWwsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSkge1xuICAgICAgZWwuZGF0YSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykgdHJlZUFkYXB0ZXIuaW5zZXJ0VGV4dChlbCwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXRWYWx1ZShlbCk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbCwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWwpOiBib29sZWFuIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH1cbiAgc2V0Q2hlY2tlZChlbCwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVDb21tZW50Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KGh0bWwpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRlbXBsYXRlLCBjb250ZW50KTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk6IEhUTUxFbGVtZW50IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgY3JlYXRlVGV4dE5vZGUodGV4dDogc3RyaW5nKTogVGV4dCB7XG4gICAgdmFyIHQgPSA8YW55PnRoaXMuY3JlYXRlQ29tbWVudCh0ZXh0KTtcbiAgICB0LnR5cGUgPSAndGV4dCc7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgY3JlYXRlU2NyaXB0VGFnKGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbe25hbWU6IGF0dHJOYW1lLCB2YWx1ZTogYXR0clZhbHVlfV0pO1xuICB9XG4gIGNyZWF0ZVN0eWxlRWxlbWVudChjc3M6IHN0cmluZyk6IEhUTUxTdHlsZUVsZW1lbnQge1xuICAgIHZhciBzdHlsZSA9IHRoaXMuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLnNldFRleHQoc3R5bGUsIGNzcyk7XG4gICAgcmV0dXJuIDxIVE1MU3R5bGVFbGVtZW50PnN0eWxlO1xuICB9XG4gIGNyZWF0ZVNoYWRvd1Jvb3QoZWwpOiBIVE1MRWxlbWVudCB7XG4gICAgZWwuc2hhZG93Um9vdCA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBlbC5zaGFkb3dSb290LnBhcmVudCA9IGVsO1xuICAgIHJldHVybiBlbC5zaGFkb3dSb290O1xuICB9XG4gIGdldFNoYWRvd1Jvb3QoZWwpOiBFbGVtZW50IHsgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7IH1cbiAgZ2V0SG9zdChlbCk6IHN0cmluZyB7IHJldHVybiBlbC5ob3N0OyB9XG4gIGdldERpc3RyaWJ1dGVkTm9kZXMoZWw6IGFueSk6IE5vZGVbXSB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0RGlzdHJpYnV0ZWROb2RlcycpOyB9XG4gIGNsb25lKG5vZGU6IE5vZGUpOiBOb2RlIHtcbiAgICB2YXIgX3JlY3Vyc2l2ZSA9IChub2RlKSA9PiB7XG4gICAgICB2YXIgbm9kZUNsb25lID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2Yobm9kZSkpO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlKSB7XG4gICAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihub2RlLCBwcm9wKTtcbiAgICAgICAgaWYgKGRlc2MgJiYgJ3ZhbHVlJyBpbiBkZXNjICYmIHR5cGVvZiBkZXNjLnZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIG5vZGVDbG9uZVtwcm9wXSA9IG5vZGVbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGVDbG9uZS5wYXJlbnQgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLnByZXYgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLm5leHQgPSBudWxsO1xuICAgICAgbm9kZUNsb25lLmNoaWxkcmVuID0gbnVsbDtcblxuICAgICAgbWFwUHJvcHMuZm9yRWFjaChtYXBOYW1lID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChub2RlW21hcE5hbWVdKSkge1xuICAgICAgICAgIG5vZGVDbG9uZVttYXBOYW1lXSA9IHt9O1xuICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gbm9kZVttYXBOYW1lXSkge1xuICAgICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdW3Byb3BdID0gbm9kZVttYXBOYW1lXVtwcm9wXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFyIGNOb2RlcyA9IG5vZGUuY2hpbGRyZW47XG4gICAgICBpZiAoY05vZGVzKSB7XG4gICAgICAgIHZhciBjTm9kZXNDbG9uZSA9IG5ldyBBcnJheShjTm9kZXMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gY05vZGVzW2ldO1xuICAgICAgICAgIHZhciBjaGlsZE5vZGVDbG9uZSA9IF9yZWN1cnNpdmUoY2hpbGROb2RlKTtcbiAgICAgICAgICBjTm9kZXNDbG9uZVtpXSA9IGNoaWxkTm9kZUNsb25lO1xuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgY2hpbGROb2RlQ2xvbmUucHJldiA9IGNOb2Rlc0Nsb25lW2kgLSAxXTtcbiAgICAgICAgICAgIGNOb2Rlc0Nsb25lW2kgLSAxXS5uZXh0ID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkTm9kZUNsb25lLnBhcmVudCA9IG5vZGVDbG9uZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBjTm9kZXNDbG9uZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlQ2xvbmU7XG4gICAgfTtcbiAgICByZXR1cm4gX3JlY3Vyc2l2ZShub2RlKTtcbiAgfVxuICBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudCwgXCIuXCIgKyBuYW1lKTtcbiAgfVxuICBnZXRFbGVtZW50c0J5VGFnTmFtZShlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xuICAgIHRocm93IF9ub3RJbXBsZW1lbnRlZCgnZ2V0RWxlbWVudHNCeVRhZ05hbWUnKTtcbiAgfVxuICBjbGFzc0xpc3QoZWxlbWVudCk6IHN0cmluZ1tdIHtcbiAgICB2YXIgY2xhc3NBdHRyVmFsdWUgPSBudWxsO1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJzO1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoXCJjbGFzc1wiKSkge1xuICAgICAgY2xhc3NBdHRyVmFsdWUgPSBhdHRyaWJ1dGVzW1wiY2xhc3NcIl07XG4gICAgfVxuICAgIHJldHVybiBjbGFzc0F0dHJWYWx1ZSA/IGNsYXNzQXR0clZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy9nKSA6IFtdO1xuICB9XG4gIGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpO1xuICAgIHZhciBpbmRleCA9IGNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICBjbGFzc0xpc3QucHVzaChjbGFzc05hbWUpO1xuICAgICAgZWxlbWVudC5hdHRyaWJzW1wiY2xhc3NcIl0gPSBlbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTGlzdC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH1cbiAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3QoZWxlbWVudCk7XG4gICAgdmFyIGluZGV4ID0gY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgY2xhc3NMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NMaXN0LmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfVxuICBoYXNDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLmNsYXNzTGlzdChlbGVtZW50KSwgY2xhc3NOYW1lKTtcbiAgfVxuICBoYXNTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lKSB8fCAnJztcbiAgICByZXR1cm4gc3R5bGVWYWx1ZSA/IHZhbHVlID09IHN0eWxlVmFsdWUgOiB2YWx1ZS5sZW5ndGggPiAwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KSB7XG4gICAgdmFyIHN0eWxlTWFwID0ge307XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnM7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShcInN0eWxlXCIpKSB7XG4gICAgICB2YXIgc3R5bGVBdHRyVmFsdWUgPSBhdHRyaWJ1dGVzW1wic3R5bGVcIl07XG4gICAgICB2YXIgc3R5bGVMaXN0ID0gc3R5bGVBdHRyVmFsdWUuc3BsaXQoLzsrL2cpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHN0eWxlTGlzdFtpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIGVsZW1zID0gc3R5bGVMaXN0W2ldLnNwbGl0KC86Ky9nKTtcbiAgICAgICAgICBzdHlsZU1hcFtlbGVtc1swXS50cmltKCldID0gZWxlbXNbMV0udHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHlsZU1hcDtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF93cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKSB7XG4gICAgdmFyIHN0eWxlQXR0clZhbHVlID0gXCJcIjtcbiAgICBmb3IgKHZhciBrZXkgaW4gc3R5bGVNYXApIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHN0eWxlTWFwW2tleV07XG4gICAgICBpZiAobmV3VmFsdWUgJiYgbmV3VmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICBzdHlsZUF0dHJWYWx1ZSArPSBrZXkgKyBcIjpcIiArIHN0eWxlTWFwW2tleV0gKyBcIjtcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbWVudC5hdHRyaWJzW1wic3R5bGVcIl0gPSBzdHlsZUF0dHJWYWx1ZTtcbiAgfVxuICBzZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdmFyIHN0eWxlTWFwID0gdGhpcy5fcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIHN0eWxlTWFwW3N0eWxlTmFtZV0gPSBzdHlsZVZhbHVlO1xuICAgIHRoaXMuX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApO1xuICB9XG4gIHJlbW92ZVN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKSB7IHRoaXMuc2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lLCBudWxsKTsgfVxuICBnZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHN0eWxlTWFwID0gdGhpcy5fcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIHJldHVybiBzdHlsZU1hcC5oYXNPd25Qcm9wZXJ0eShzdHlsZU5hbWUpID8gc3R5bGVNYXBbc3R5bGVOYW1lXSA6IFwiXCI7XG4gIH1cbiAgdGFnTmFtZShlbGVtZW50KTogc3RyaW5nIHsgcmV0dXJuIGVsZW1lbnQudGFnTmFtZSA9PSBcInN0eWxlXCIgPyBcIlNUWUxFXCIgOiBlbGVtZW50LnRhZ05hbWU7IH1cbiAgYXR0cmlidXRlTWFwKGVsZW1lbnQpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICB2YXIgcmVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICB2YXIgZWxBdHRycyA9IHRyZWVBZGFwdGVyLmdldEF0dHJMaXN0KGVsZW1lbnQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxBdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGF0dHJpYiA9IGVsQXR0cnNbaV07XG4gICAgICByZXMuc2V0KGF0dHJpYi5uYW1lLCBhdHRyaWIudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGhhc0F0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbGVtZW50LmF0dHJpYnMgJiYgZWxlbWVudC5hdHRyaWJzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSk7XG4gIH1cbiAgZ2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZWxlbWVudC5hdHRyaWJzICYmIGVsZW1lbnQuYXR0cmlicy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpID9cbiAgICAgICAgICAgICAgIGVsZW1lbnQuYXR0cmlic1thdHRyaWJ1dGVdIDpcbiAgICAgICAgICAgICAgIG51bGw7XG4gIH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcbiAgICAgIGlmIChhdHRyaWJ1dGUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgcmVtb3ZlQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUoZWxlbWVudC5hdHRyaWJzLCBhdHRyaWJ1dGUpO1xuICAgIH1cbiAgfVxuICB0ZW1wbGF0ZUF3YXJlUm9vdChlbCk6IGFueSB7IHJldHVybiB0aGlzLmlzVGVtcGxhdGVFbGVtZW50KGVsKSA/IHRoaXMuY29udGVudChlbCkgOiBlbDsgfVxuICBjcmVhdGVIdG1sRG9jdW1lbnQoKTogRG9jdW1lbnQge1xuICAgIHZhciBuZXdEb2MgPSB0cmVlQWRhcHRlci5jcmVhdGVEb2N1bWVudCgpO1xuICAgIG5ld0RvYy50aXRsZSA9IFwiZmFrZSB0aXRsZVwiO1xuICAgIHZhciBoZWFkID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcImhlYWRcIiwgbnVsbCwgW10pO1xuICAgIHZhciBib2R5ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcImJvZHlcIiwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBbXSk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChuZXdEb2MsIGhlYWQpO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobmV3RG9jLCBib2R5KTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChuZXdEb2MsIFwiaGVhZFwiLCBoZWFkKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChuZXdEb2MsIFwiYm9keVwiLCBib2R5KTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChuZXdEb2MsIFwiX3dpbmRvd1wiLCBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpKTtcbiAgICByZXR1cm4gbmV3RG9jO1xuICB9XG4gIGRlZmF1bHREb2MoKTogRG9jdW1lbnQge1xuICAgIGlmIChkZWZEb2MgPT09IG51bGwpIHtcbiAgICAgIGRlZkRvYyA9IHRoaXMuY3JlYXRlSHRtbERvY3VtZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBkZWZEb2M7XG4gIH1cbiAgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsKTogYW55IHsgcmV0dXJuIHtsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDB9OyB9XG4gIGdldFRpdGxlKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmRlZmF1bHREb2MoKS50aXRsZSB8fCBcIlwiOyB9XG4gIHNldFRpdGxlKG5ld1RpdGxlOiBzdHJpbmcpIHsgdGhpcy5kZWZhdWx0RG9jKCkudGl0bGUgPSBuZXdUaXRsZTsgfVxuICBpc1RlbXBsYXRlRWxlbWVudChlbDogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbGVtZW50Tm9kZShlbCkgJiYgdGhpcy50YWdOYW1lKGVsKSA9PT0gXCJ0ZW1wbGF0ZVwiO1xuICB9XG4gIGlzVGV4dE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdHJlZUFkYXB0ZXIuaXNUZXh0Tm9kZShub2RlKTsgfVxuICBpc0NvbW1lbnROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRyZWVBZGFwdGVyLmlzQ29tbWVudE5vZGUobm9kZSk7IH1cbiAgaXNFbGVtZW50Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlID8gdHJlZUFkYXB0ZXIuaXNFbGVtZW50Tm9kZShub2RlKSA6IGZhbHNlOyB9XG4gIGhhc1NoYWRvd1Jvb3Qobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KG5vZGUuc2hhZG93Um9vdCk7IH1cbiAgaXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0U2hhZG93Um9vdChub2RlKSA9PSBub2RlOyB9XG4gIGltcG9ydEludG9Eb2Mobm9kZSk6IGFueSB7IHJldHVybiB0aGlzLmNsb25lKG5vZGUpOyB9XG4gIGFkb3B0Tm9kZShub2RlKTogYW55IHsgcmV0dXJuIG5vZGU7IH1cbiAgZ2V0SHJlZihlbCk6IHN0cmluZyB7IHJldHVybiBlbC5ocmVmOyB9XG4gIHJlc29sdmVBbmRTZXRIcmVmKGVsLCBiYXNlVXJsOiBzdHJpbmcsIGhyZWY6IHN0cmluZykge1xuICAgIGlmIChocmVmID09IG51bGwpIHtcbiAgICAgIGVsLmhyZWYgPSBiYXNlVXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5ocmVmID0gYmFzZVVybCArICcvLi4vJyArIGhyZWY7XG4gICAgfVxuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2J1aWxkUnVsZXMocGFyc2VkUnVsZXMsIGNzcz8pIHtcbiAgICB2YXIgcnVsZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGFyc2VkUnVsZSA9IHBhcnNlZFJ1bGVzW2ldO1xuICAgICAgdmFyIHJ1bGU6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwiY3NzVGV4dFwiLCBjc3MpO1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJzdHlsZVwiLCB7Y29udGVudDogXCJcIiwgY3NzVGV4dDogXCJcIn0pO1xuICAgICAgaWYgKHBhcnNlZFJ1bGUudHlwZSA9PSBcInJ1bGVcIikge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInR5cGVcIiwgMSk7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwic2VsZWN0b3JUZXh0XCIsIHBhcnNlZFJ1bGUuc2VsZWN0b3JzLmpvaW4oXCIsIFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csIFwiIFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqflxccyovZywgXCIgfiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKlxcK1xccyovZywgXCIgKyBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKj5cXHMqL2csIFwiID4gXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcWyhcXHcrKT0oXFx3KylcXF0vZywgJ1skMT1cIiQyXCJdJykpO1xuICAgICAgICBpZiAoaXNCbGFuayhwYXJzZWRSdWxlLmRlY2xhcmF0aW9ucykpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgdmFyIGRlY2xhcmF0aW9uID0gcGFyc2VkUnVsZS5kZWNsYXJhdGlvbnNbal07XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQoU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgXCJzdHlsZVwiKSwgZGVjbGFyYXRpb24ucHJvcGVydHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb24udmFsdWUpO1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZ2V0KHJ1bGUsIFwic3R5bGVcIikuY3NzVGV4dCArPVxuICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5wcm9wZXJ0eSArIFwiOiBcIiArIGRlY2xhcmF0aW9uLnZhbHVlICsgXCI7XCI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VkUnVsZS50eXBlID09IFwibWVkaWFcIikge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInR5cGVcIiwgNCk7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwibWVkaWFcIiwge21lZGlhVGV4dDogcGFyc2VkUnVsZS5tZWRpYX0pO1xuICAgICAgICBpZiAocGFyc2VkUnVsZS5ydWxlcykge1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwiY3NzUnVsZXNcIiwgdGhpcy5fYnVpbGRSdWxlcyhwYXJzZWRSdWxlLnJ1bGVzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgfVxuICAgIHJldHVybiBydWxlcztcbiAgfVxuICBzdXBwb3J0c0RPTUV2ZW50cygpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHN1cHBvcnRzTmF0aXZlU2hhZG93RE9NKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGFyZ2V0OiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICh0YXJnZXQgPT0gXCJ3aW5kb3dcIikge1xuICAgICAgcmV0dXJuICg8YW55PnRoaXMuZGVmYXVsdERvYygpKS5fd2luZG93O1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09IFwiZG9jdW1lbnRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpO1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09IFwiYm9keVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCkuYm9keTtcbiAgICB9XG4gIH1cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgcmVzZXRCYXNlRWxlbWVudCgpOiB2b2lkIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0SGlzdG9yeSgpOiBIaXN0b3J5IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0TG9jYXRpb24oKTogTG9jYXRpb24geyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHsgcmV0dXJuIFwiRmFrZSB1c2VyIGFnZW50XCI7IH1cbiAgZ2V0RGF0YShlbCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKGVsLCAnZGF0YS0nICsgbmFtZSk7IH1cbiAgZ2V0Q29tcHV0ZWRTdHlsZShlbCk6IGFueSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHNldERhdGEoZWwsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyB0aGlzLnNldEF0dHJpYnV0ZShlbCwgJ2RhdGEtJyArIG5hbWUsIHZhbHVlKTsgfVxuICAvLyBUT0RPKHRib3NjaCk6IG1vdmUgdGhpcyBpbnRvIGEgc2VwYXJhdGUgZW52aXJvbm1lbnQgY2xhc3Mgb25jZSB3ZSBoYXZlIGl0XG4gIHNldEdsb2JhbFZhcihwYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgc2V0VmFsdWVPblBhdGgoZ2xvYmFsLCBwYXRoLCB2YWx1ZSk7IH1cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKTogbnVtYmVyIHsgcmV0dXJuIHNldFRpbWVvdXQoY2FsbGJhY2ssIDApOyB9XG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkOiBudW1iZXIpIHsgY2xlYXJUaW1lb3V0KGlkKTsgfVxuICBwZXJmb3JtYW5jZU5vdygpOiBudW1iZXIgeyByZXR1cm4gRGF0ZVdyYXBwZXIudG9NaWxsaXMoRGF0ZVdyYXBwZXIubm93KCkpOyB9XG4gIGdldEFuaW1hdGlvblByZWZpeCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbiAgZ2V0VHJhbnNpdGlvbkVuZCgpOiBzdHJpbmcgeyByZXR1cm4gJ3RyYW5zaXRpb25lbmQnOyB9XG4gIHN1cHBvcnRzQW5pbWF0aW9uKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIHJlcGxhY2VDaGlsZChlbCwgbmV3Tm9kZSwgb2xkTm9kZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIHBhcnNlKHRlbXBsYXRlSHRtbDogc3RyaW5nKSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgaW52b2tlKGVsOiBFbGVtZW50LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBnZXRFdmVudEtleShldmVudCk6IHN0cmluZyB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbn1cblxuLy8gVE9ETzogYnVpbGQgYSBwcm9wZXIgbGlzdCwgdGhpcyBvbmUgaXMgYWxsIHRoZSBrZXlzIG9mIGEgSFRNTElucHV0RWxlbWVudFxudmFyIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdCA9IFtcbiAgXCJ3ZWJraXRFbnRyaWVzXCIsXG4gIFwiaW5jcmVtZW50YWxcIixcbiAgXCJ3ZWJraXRkaXJlY3RvcnlcIixcbiAgXCJzZWxlY3Rpb25EaXJlY3Rpb25cIixcbiAgXCJzZWxlY3Rpb25FbmRcIixcbiAgXCJzZWxlY3Rpb25TdGFydFwiLFxuICBcImxhYmVsc1wiLFxuICBcInZhbGlkYXRpb25NZXNzYWdlXCIsXG4gIFwidmFsaWRpdHlcIixcbiAgXCJ3aWxsVmFsaWRhdGVcIixcbiAgXCJ3aWR0aFwiLFxuICBcInZhbHVlQXNOdW1iZXJcIixcbiAgXCJ2YWx1ZUFzRGF0ZVwiLFxuICBcInZhbHVlXCIsXG4gIFwidXNlTWFwXCIsXG4gIFwiZGVmYXVsdFZhbHVlXCIsXG4gIFwidHlwZVwiLFxuICBcInN0ZXBcIixcbiAgXCJzcmNcIixcbiAgXCJzaXplXCIsXG4gIFwicmVxdWlyZWRcIixcbiAgXCJyZWFkT25seVwiLFxuICBcInBsYWNlaG9sZGVyXCIsXG4gIFwicGF0dGVyblwiLFxuICBcIm5hbWVcIixcbiAgXCJtdWx0aXBsZVwiLFxuICBcIm1pblwiLFxuICBcIm1pbkxlbmd0aFwiLFxuICBcIm1heExlbmd0aFwiLFxuICBcIm1heFwiLFxuICBcImxpc3RcIixcbiAgXCJpbmRldGVybWluYXRlXCIsXG4gIFwiaGVpZ2h0XCIsXG4gIFwiZm9ybVRhcmdldFwiLFxuICBcImZvcm1Ob1ZhbGlkYXRlXCIsXG4gIFwiZm9ybU1ldGhvZFwiLFxuICBcImZvcm1FbmN0eXBlXCIsXG4gIFwiZm9ybUFjdGlvblwiLFxuICBcImZpbGVzXCIsXG4gIFwiZm9ybVwiLFxuICBcImRpc2FibGVkXCIsXG4gIFwiZGlyTmFtZVwiLFxuICBcImNoZWNrZWRcIixcbiAgXCJkZWZhdWx0Q2hlY2tlZFwiLFxuICBcImF1dG9mb2N1c1wiLFxuICBcImF1dG9jb21wbGV0ZVwiLFxuICBcImFsdFwiLFxuICBcImFsaWduXCIsXG4gIFwiYWNjZXB0XCIsXG4gIFwib25hdXRvY29tcGxldGVlcnJvclwiLFxuICBcIm9uYXV0b2NvbXBsZXRlXCIsXG4gIFwib253YWl0aW5nXCIsXG4gIFwib252b2x1bWVjaGFuZ2VcIixcbiAgXCJvbnRvZ2dsZVwiLFxuICBcIm9udGltZXVwZGF0ZVwiLFxuICBcIm9uc3VzcGVuZFwiLFxuICBcIm9uc3VibWl0XCIsXG4gIFwib25zdGFsbGVkXCIsXG4gIFwib25zaG93XCIsXG4gIFwib25zZWxlY3RcIixcbiAgXCJvbnNlZWtpbmdcIixcbiAgXCJvbnNlZWtlZFwiLFxuICBcIm9uc2Nyb2xsXCIsXG4gIFwib25yZXNpemVcIixcbiAgXCJvbnJlc2V0XCIsXG4gIFwib25yYXRlY2hhbmdlXCIsXG4gIFwib25wcm9ncmVzc1wiLFxuICBcIm9ucGxheWluZ1wiLFxuICBcIm9ucGxheVwiLFxuICBcIm9ucGF1c2VcIixcbiAgXCJvbm1vdXNld2hlZWxcIixcbiAgXCJvbm1vdXNldXBcIixcbiAgXCJvbm1vdXNlb3ZlclwiLFxuICBcIm9ubW91c2VvdXRcIixcbiAgXCJvbm1vdXNlbW92ZVwiLFxuICBcIm9ubW91c2VsZWF2ZVwiLFxuICBcIm9ubW91c2VlbnRlclwiLFxuICBcIm9ubW91c2Vkb3duXCIsXG4gIFwib25sb2Fkc3RhcnRcIixcbiAgXCJvbmxvYWRlZG1ldGFkYXRhXCIsXG4gIFwib25sb2FkZWRkYXRhXCIsXG4gIFwib25sb2FkXCIsXG4gIFwib25rZXl1cFwiLFxuICBcIm9ua2V5cHJlc3NcIixcbiAgXCJvbmtleWRvd25cIixcbiAgXCJvbmludmFsaWRcIixcbiAgXCJvbmlucHV0XCIsXG4gIFwib25mb2N1c1wiLFxuICBcIm9uZXJyb3JcIixcbiAgXCJvbmVuZGVkXCIsXG4gIFwib25lbXB0aWVkXCIsXG4gIFwib25kdXJhdGlvbmNoYW5nZVwiLFxuICBcIm9uZHJvcFwiLFxuICBcIm9uZHJhZ3N0YXJ0XCIsXG4gIFwib25kcmFnb3ZlclwiLFxuICBcIm9uZHJhZ2xlYXZlXCIsXG4gIFwib25kcmFnZW50ZXJcIixcbiAgXCJvbmRyYWdlbmRcIixcbiAgXCJvbmRyYWdcIixcbiAgXCJvbmRibGNsaWNrXCIsXG4gIFwib25jdWVjaGFuZ2VcIixcbiAgXCJvbmNvbnRleHRtZW51XCIsXG4gIFwib25jbG9zZVwiLFxuICBcIm9uY2xpY2tcIixcbiAgXCJvbmNoYW5nZVwiLFxuICBcIm9uY2FucGxheXRocm91Z2hcIixcbiAgXCJvbmNhbnBsYXlcIixcbiAgXCJvbmNhbmNlbFwiLFxuICBcIm9uYmx1clwiLFxuICBcIm9uYWJvcnRcIixcbiAgXCJzcGVsbGNoZWNrXCIsXG4gIFwiaXNDb250ZW50RWRpdGFibGVcIixcbiAgXCJjb250ZW50RWRpdGFibGVcIixcbiAgXCJvdXRlclRleHRcIixcbiAgXCJpbm5lclRleHRcIixcbiAgXCJhY2Nlc3NLZXlcIixcbiAgXCJoaWRkZW5cIixcbiAgXCJ3ZWJraXRkcm9wem9uZVwiLFxuICBcImRyYWdnYWJsZVwiLFxuICBcInRhYkluZGV4XCIsXG4gIFwiZGlyXCIsXG4gIFwidHJhbnNsYXRlXCIsXG4gIFwibGFuZ1wiLFxuICBcInRpdGxlXCIsXG4gIFwiY2hpbGRFbGVtZW50Q291bnRcIixcbiAgXCJsYXN0RWxlbWVudENoaWxkXCIsXG4gIFwiZmlyc3RFbGVtZW50Q2hpbGRcIixcbiAgXCJjaGlsZHJlblwiLFxuICBcIm9ud2Via2l0ZnVsbHNjcmVlbmVycm9yXCIsXG4gIFwib253ZWJraXRmdWxsc2NyZWVuY2hhbmdlXCIsXG4gIFwibmV4dEVsZW1lbnRTaWJsaW5nXCIsXG4gIFwicHJldmlvdXNFbGVtZW50U2libGluZ1wiLFxuICBcIm9ud2hlZWxcIixcbiAgXCJvbnNlbGVjdHN0YXJ0XCIsXG4gIFwib25zZWFyY2hcIixcbiAgXCJvbnBhc3RlXCIsXG4gIFwib25jdXRcIixcbiAgXCJvbmNvcHlcIixcbiAgXCJvbmJlZm9yZXBhc3RlXCIsXG4gIFwib25iZWZvcmVjdXRcIixcbiAgXCJvbmJlZm9yZWNvcHlcIixcbiAgXCJzaGFkb3dSb290XCIsXG4gIFwiZGF0YXNldFwiLFxuICBcImNsYXNzTGlzdFwiLFxuICBcImNsYXNzTmFtZVwiLFxuICBcIm91dGVySFRNTFwiLFxuICBcImlubmVySFRNTFwiLFxuICBcInNjcm9sbEhlaWdodFwiLFxuICBcInNjcm9sbFdpZHRoXCIsXG4gIFwic2Nyb2xsVG9wXCIsXG4gIFwic2Nyb2xsTGVmdFwiLFxuICBcImNsaWVudEhlaWdodFwiLFxuICBcImNsaWVudFdpZHRoXCIsXG4gIFwiY2xpZW50VG9wXCIsXG4gIFwiY2xpZW50TGVmdFwiLFxuICBcIm9mZnNldFBhcmVudFwiLFxuICBcIm9mZnNldEhlaWdodFwiLFxuICBcIm9mZnNldFdpZHRoXCIsXG4gIFwib2Zmc2V0VG9wXCIsXG4gIFwib2Zmc2V0TGVmdFwiLFxuICBcImxvY2FsTmFtZVwiLFxuICBcInByZWZpeFwiLFxuICBcIm5hbWVzcGFjZVVSSVwiLFxuICBcImlkXCIsXG4gIFwic3R5bGVcIixcbiAgXCJhdHRyaWJ1dGVzXCIsXG4gIFwidGFnTmFtZVwiLFxuICBcInBhcmVudEVsZW1lbnRcIixcbiAgXCJ0ZXh0Q29udGVudFwiLFxuICBcImJhc2VVUklcIixcbiAgXCJvd25lckRvY3VtZW50XCIsXG4gIFwibmV4dFNpYmxpbmdcIixcbiAgXCJwcmV2aW91c1NpYmxpbmdcIixcbiAgXCJsYXN0Q2hpbGRcIixcbiAgXCJmaXJzdENoaWxkXCIsXG4gIFwiY2hpbGROb2Rlc1wiLFxuICBcInBhcmVudE5vZGVcIixcbiAgXCJub2RlVHlwZVwiLFxuICBcIm5vZGVWYWx1ZVwiLFxuICBcIm5vZGVOYW1lXCIsXG4gIFwiY2xvc3VyZV9sbV83MTQ2MTdcIixcbiAgXCJfX2pzYWN0aW9uXCJcbl07XG4iXX0=