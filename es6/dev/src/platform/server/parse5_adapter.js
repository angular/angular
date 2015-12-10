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
    getText(el, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
            return "";
        }
        else {
            var textContent = "";
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    }
    setText(el, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
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
    createElementNS(ns, tagName) { return treeAdapter.createElement(tagName, ns, []); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbIl9ub3RJbXBsZW1lbnRlZCIsIlBhcnNlNURvbUFkYXB0ZXIiLCJQYXJzZTVEb21BZGFwdGVyLm1ha2VDdXJyZW50IiwiUGFyc2U1RG9tQWRhcHRlci5oYXNQcm9wZXJ0eSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0UHJvcGVydHkiLCJQYXJzZTVEb21BZGFwdGVyLmdldFByb3BlcnR5IiwiUGFyc2U1RG9tQWRhcHRlci5sb2dFcnJvciIsIlBhcnNlNURvbUFkYXB0ZXIubG9nIiwiUGFyc2U1RG9tQWRhcHRlci5sb2dHcm91cCIsIlBhcnNlNURvbUFkYXB0ZXIubG9nR3JvdXBFbmQiLCJQYXJzZTVEb21BZGFwdGVyLmdldFhIUiIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0clRvUHJvcE1hcCIsIlBhcnNlNURvbUFkYXB0ZXIucXVlcnkiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3IiLCJQYXJzZTVEb21BZGFwdGVyLnF1ZXJ5U2VsZWN0b3JBbGwiLCJQYXJzZTVEb21BZGFwdGVyLmVsZW1lbnRNYXRjaGVzIiwiUGFyc2U1RG9tQWRhcHRlci5vbiIsIlBhcnNlNURvbUFkYXB0ZXIub25BbmRDYW5jZWwiLCJQYXJzZTVEb21BZGFwdGVyLmRpc3BhdGNoRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZU1vdXNlRXZlbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUV2ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5wcmV2ZW50RGVmYXVsdCIsIlBhcnNlNURvbUFkYXB0ZXIuaXNQcmV2ZW50ZWQiLCJQYXJzZTVEb21BZGFwdGVyLmdldElubmVySFRNTCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0T3V0ZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5ub2RlTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIubm9kZVZhbHVlIiwiUGFyc2U1RG9tQWRhcHRlci50eXBlIiwiUGFyc2U1RG9tQWRhcHRlci5jb250ZW50IiwiUGFyc2U1RG9tQWRhcHRlci5maXJzdENoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5uZXh0U2libGluZyIsIlBhcnNlNURvbUFkYXB0ZXIucGFyZW50RWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2hpbGROb2Rlc0FzTGlzdCIsIlBhcnNlNURvbUFkYXB0ZXIuY2xlYXJOb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuYXBwZW5kQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZUNoaWxkIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmUiLCJQYXJzZTVEb21BZGFwdGVyLmluc2VydEJlZm9yZSIsIlBhcnNlNURvbUFkYXB0ZXIuaW5zZXJ0QWxsQmVmb3JlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnNlcnRBZnRlciIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0SW5uZXJIVE1MIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUZXh0IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRWYWx1ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0VmFsdWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLnNldENoZWNrZWQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZUNvbW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRlbXBsYXRlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVFbGVtZW50TlMiLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVRleHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5jcmVhdGVTY3JpcHRUYWciLCJQYXJzZTVEb21BZGFwdGVyLmNyZWF0ZVN0eWxlRWxlbWVudCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0U2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0SG9zdCIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0RGlzdHJpYnV0ZWROb2RlcyIsIlBhcnNlNURvbUFkYXB0ZXIuY2xvbmUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lIiwiUGFyc2U1RG9tQWRhcHRlci5jbGFzc0xpc3QiLCJQYXJzZTVEb21BZGFwdGVyLmFkZENsYXNzIiwiUGFyc2U1RG9tQWRhcHRlci5yZW1vdmVDbGFzcyIsIlBhcnNlNURvbUFkYXB0ZXIuaGFzQ2xhc3MiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1N0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5fcmVhZFN0eWxlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5fd3JpdGVTdHlsZUF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0U3R5bGUiLCJQYXJzZTVEb21BZGFwdGVyLnJlbW92ZVN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRTdHlsZSIsIlBhcnNlNURvbUFkYXB0ZXIudGFnTmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuYXR0cmlidXRlTWFwIiwiUGFyc2U1RG9tQWRhcHRlci5oYXNBdHRyaWJ1dGUiLCJQYXJzZTVEb21BZGFwdGVyLmdldEF0dHJpYnV0ZSIsIlBhcnNlNURvbUFkYXB0ZXIuc2V0QXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRBdHRyaWJ1dGVOUyIsIlBhcnNlNURvbUFkYXB0ZXIucmVtb3ZlQXR0cmlidXRlIiwiUGFyc2U1RG9tQWRhcHRlci50ZW1wbGF0ZUF3YXJlUm9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuY3JlYXRlSHRtbERvY3VtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5kZWZhdWx0RG9jIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRpdGxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRUaXRsZSIsIlBhcnNlNURvbUFkYXB0ZXIuaXNUZW1wbGF0ZUVsZW1lbnQiLCJQYXJzZTVEb21BZGFwdGVyLmlzVGV4dE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzQ29tbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmlzRWxlbWVudE5vZGUiLCJQYXJzZTVEb21BZGFwdGVyLmhhc1NoYWRvd1Jvb3QiLCJQYXJzZTVEb21BZGFwdGVyLmlzU2hhZG93Um9vdCIsIlBhcnNlNURvbUFkYXB0ZXIuaW1wb3J0SW50b0RvYyIsIlBhcnNlNURvbUFkYXB0ZXIuYWRvcHROb2RlIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNvbHZlQW5kU2V0SHJlZiIsIlBhcnNlNURvbUFkYXB0ZXIuX2J1aWxkUnVsZXMiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzRE9NRXZlbnRzIiwiUGFyc2U1RG9tQWRhcHRlci5zdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0R2xvYmFsRXZlbnRUYXJnZXQiLCJQYXJzZTVEb21BZGFwdGVyLmdldEJhc2VIcmVmIiwiUGFyc2U1RG9tQWRhcHRlci5yZXNldEJhc2VFbGVtZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRIaXN0b3J5IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRMb2NhdGlvbiIsIlBhcnNlNURvbUFkYXB0ZXIuZ2V0VXNlckFnZW50IiwiUGFyc2U1RG9tQWRhcHRlci5nZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5nZXRDb21wdXRlZFN0eWxlIiwiUGFyc2U1RG9tQWRhcHRlci5zZXREYXRhIiwiUGFyc2U1RG9tQWRhcHRlci5zZXRHbG9iYWxWYXIiLCJQYXJzZTVEb21BZGFwdGVyLnJlcXVlc3RBbmltYXRpb25GcmFtZSIsIlBhcnNlNURvbUFkYXB0ZXIuY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJQYXJzZTVEb21BZGFwdGVyLnBlcmZvcm1hbmNlTm93IiwiUGFyc2U1RG9tQWRhcHRlci5nZXRBbmltYXRpb25QcmVmaXgiLCJQYXJzZTVEb21BZGFwdGVyLmdldFRyYW5zaXRpb25FbmQiLCJQYXJzZTVEb21BZGFwdGVyLnN1cHBvcnRzQW5pbWF0aW9uIiwiUGFyc2U1RG9tQWRhcHRlci5yZXBsYWNlQ2hpbGQiLCJQYXJzZTVEb21BZGFwdGVyLnBhcnNlIiwiUGFyc2U1RG9tQWRhcHRlci5pbnZva2UiLCJQYXJzZTVEb21BZGFwdGVyLmdldEV2ZW50S2V5Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztPQUU5QixFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNqRixFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDhCQUE4QjtPQUNuRSxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsTUFBTSxFQUVOLGNBQWMsRUFDZCxXQUFXLEVBQ1osTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNwRSxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQjtBQUU3QyxJQUFJLGNBQWMsR0FBNEI7SUFDNUMsT0FBTyxFQUFFLFdBQVc7SUFDcEIsV0FBVyxFQUFFLFdBQVc7SUFDeEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsVUFBVSxF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LEdBQUdBLElBQUlBLENBQUNBO1lBQ3hCQSxTQUFTQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUN0QkEsU0FBU0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDdEJBLFNBQVNBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1lBRTFCQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQTtnQkFDdEJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7b0JBQ3hCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDL0JBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNqREEsQ0FBQ0E7Z0JBQ0hBLENBQUNBO1lBQ0hBLENBQUNBLENBQUNBLENBQUNBO1lBQ0hBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDWEEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtvQkFDdkNBLElBQUlBLFNBQVNBLEdBQUdBLE1BQU1BLENBQUNBLENB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d0JBQXdCO0lBQ3hCLFNBQVM7SUFDVCxlQUFlO0lBQ2YsVUFBVTtJQUNWLFNBQVM7SUFDVCxPQUFPO0lBQ1AsUUFBUTtJQUNSLGVBQWU7SUFDZixhQUFhO0lBQ2IsY0FBYztJQUNkLFlBQVk7SUFDWixTQUFTO0lBQ1QsV0FBVztJQUNYLFdBQVc7SUFDWCxXQUFXO0lBQ1gsV0FBVztJQUNYLGNBQWM7SUFDZCxhQUFhO0lBQ2IsV0FBVztJQUNYLFlBQVk7SUFDWixjQUFjO0lBQ2QsYUFBYTtJQUNiLFdBQVc7SUFDWCxZQUFZO0lBQ1osY0FBYztJQUNkLGNBQWM7SUFDZCxhQUFhO0lBQ2IsV0FBVztJQUNYLFlBQVk7SUFDWixXQUFXO0lBQ1gsUUFBUTtJQUNSLGNBQWM7SUFDZCxJQUFJO0lBQ0osT0FBTztJQUNQLFlBQVk7SUFDWixTQUFTO0lBQ1QsZUFBZTtJQUNmLGFBQWE7SUFDYixTQUFTO0lBQ1QsZUFBZTtJQUNmLGFBQWE7SUFDYixpQkFBaUI7SUFDakIsV0FBVztJQUNYLFlBQVk7SUFDWixZQUFZO0lBQ1osWUFBWTtJQUNaLFVBQVU7SUFDVixXQUFXO0lBQ1gsVUFBVTtJQUNWLG1CQUFtQjtJQUNuQixZQUFZO0NBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBwYXJzZTUgPSByZXF1aXJlKCdwYXJzZTUvaW5kZXgnKTtcbnZhciBwYXJzZXIgPSBuZXcgcGFyc2U1LlBhcnNlcihwYXJzZTUuVHJlZUFkYXB0ZXJzLmh0bWxwYXJzZXIyKTtcbnZhciBzZXJpYWxpemVyID0gbmV3IHBhcnNlNS5TZXJpYWxpemVyKHBhcnNlNS5UcmVlQWRhcHRlcnMuaHRtbHBhcnNlcjIpO1xudmFyIHRyZWVBZGFwdGVyID0gcGFyc2VyLnRyZWVBZGFwdGVyO1xuXG5pbXBvcnQge01hcFdyYXBwZXIsIExpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtEb21BZGFwdGVyLCBzZXRSb290RG9tQWRhcHRlcn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vY29tbW9uX2RvbSc7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGdsb2JhbCxcbiAgVHlwZSxcbiAgc2V0VmFsdWVPblBhdGgsXG4gIERhdGVXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1NlbGVjdG9yTWF0Y2hlciwgQ3NzU2VsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zZWxlY3Rvcic7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5cbnZhciBfYXR0clRvUHJvcE1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnaW5uZXJIdG1sJzogJ2lubmVySFRNTCcsXG4gICdyZWFkb25seSc6ICdyZWFkT25seScsXG4gICd0YWJpbmRleCc6ICd0YWJJbmRleCcsXG59O1xudmFyIGRlZkRvYyA9IG51bGw7XG5cbnZhciBtYXBQcm9wcyA9IFsnYXR0cmlicycsICd4LWF0dHJpYnNOYW1lc3BhY2UnLCAneC1hdHRyaWJzUHJlZml4J107XG5cbmZ1bmN0aW9uIF9ub3RJbXBsZW1lbnRlZChtZXRob2ROYW1lKSB7XG4gIHJldHVybiBuZXcgQmFzZUV4Y2VwdGlvbignVGhpcyBtZXRob2QgaXMgbm90IGltcGxlbWVudGVkIGluIFBhcnNlNURvbUFkYXB0ZXI6ICcgKyBtZXRob2ROYW1lKTtcbn1cblxuLyogdHNsaW50OmRpc2FibGU6cmVxdWlyZVBhcmFtZXRlclR5cGUgKi9cbmV4cG9ydCBjbGFzcyBQYXJzZTVEb21BZGFwdGVyIGV4dGVuZHMgRG9tQWRhcHRlciB7XG4gIHN0YXRpYyBtYWtlQ3VycmVudCgpIHsgc2V0Um9vdERvbUFkYXB0ZXIobmV3IFBhcnNlNURvbUFkYXB0ZXIoKSk7IH1cblxuICBoYXNQcm9wZXJ0eShlbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gX0hUTUxFbGVtZW50UHJvcGVydHlMaXN0LmluZGV4T2YobmFtZSkgPiAtMTtcbiAgfVxuICAvLyBUT0RPKHRib3NjaCk6IGRvbid0IGV2ZW4gY2FsbCB0aGlzIG1ldGhvZCB3aGVuIHdlIHJ1biB0aGUgdGVzdHMgb24gc2VydmVyIHNpZGVcbiAgLy8gYnkgbm90IHVzaW5nIHRoZSBEb21SZW5kZXJlciBpbiB0ZXN0cy4gS2VlcGluZyB0aGlzIGZvciBub3cgdG8gbWFrZSB0ZXN0cyBoYXBweS4uLlxuICBzZXRQcm9wZXJ0eShlbDogLyplbGVtZW50Ki8gYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBpZiAobmFtZSA9PT0gJ2lubmVySFRNTCcpIHtcbiAgICAgIHRoaXMuc2V0SW5uZXJIVE1MKGVsLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09PSAnY2xhc3NOYW1lJykge1xuICAgICAgZWwuYXR0cmlic1tcImNsYXNzXCJdID0gZWwuY2xhc3NOYW1lID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIC8vIFRPRE8odGJvc2NoKTogZG9uJ3QgZXZlbiBjYWxsIHRoaXMgbWV0aG9kIHdoZW4gd2UgcnVuIHRoZSB0ZXN0cyBvbiBzZXJ2ZXIgc2lkZVxuICAvLyBieSBub3QgdXNpbmcgdGhlIERvbVJlbmRlcmVyIGluIHRlc3RzLiBLZWVwaW5nIHRoaXMgZm9yIG5vdyB0byBtYWtlIHRlc3RzIGhhcHB5Li4uXG4gIGdldFByb3BlcnR5KGVsOiAvKmVsZW1lbnQqLyBhbnksIG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiBlbFtuYW1lXTsgfVxuXG4gIGxvZ0Vycm9yKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyB9XG5cbiAgbG9nKGVycm9yKSB7IGNvbnNvbGUubG9nKGVycm9yKTsgfVxuXG4gIGxvZ0dyb3VwKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoZXJyb3IpOyB9XG5cbiAgbG9nR3JvdXBFbmQoKSB7fVxuXG4gIGdldFhIUigpOiBUeXBlIHsgcmV0dXJuIFhIUjsgfVxuXG4gIGdldCBhdHRyVG9Qcm9wTWFwKCkgeyByZXR1cm4gX2F0dHJUb1Byb3BNYXA7IH1cblxuICBxdWVyeShzZWxlY3RvcikgeyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ3F1ZXJ5Jyk7IH1cbiAgcXVlcnlTZWxlY3RvcihlbCwgc2VsZWN0b3I6IHN0cmluZyk6IGFueSB7IHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoZWwsIHNlbGVjdG9yKVswXTsgfVxuICBxdWVyeVNlbGVjdG9yQWxsKGVsLCBzZWxlY3Rvcjogc3RyaW5nKTogYW55W10ge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICB2YXIgX3JlY3Vyc2l2ZSA9IChyZXN1bHQsIG5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKSA9PiB7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZE5vZGVzO1xuICAgICAgaWYgKGNOb2RlcyAmJiBjTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgaWYgKHRoaXMuZWxlbWVudE1hdGNoZXMoY2hpbGROb2RlLCBzZWxlY3RvciwgbWF0Y2hlcikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNoaWxkTm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9yZWN1cnNpdmUocmVzdWx0LCBjaGlsZE5vZGUsIHNlbGVjdG9yLCBtYXRjaGVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvcikpO1xuICAgIF9yZWN1cnNpdmUocmVzLCBlbCwgc2VsZWN0b3IsIG1hdGNoZXIpO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgZWxlbWVudE1hdGNoZXMobm9kZSwgc2VsZWN0b3I6IHN0cmluZywgbWF0Y2hlciA9IG51bGwpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5pc0VsZW1lbnROb2RlKG5vZGUpICYmIHNlbGVjdG9yID09PSAnKicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKHNlbGVjdG9yICYmIHNlbGVjdG9yLmNoYXJBdCgwKSA9PSBcIiNcIikge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXRBdHRyaWJ1dGUobm9kZSwgJ2lkJykgPT0gc2VsZWN0b3Iuc3Vic3RyaW5nKDEpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IpIHtcbiAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGlmIChtYXRjaGVyID09IG51bGwpIHtcbiAgICAgICAgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvcikpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgICAgIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQodGhpcy50YWdOYW1lKG5vZGUpKTtcbiAgICAgIGlmIChub2RlLmF0dHJpYnMpIHtcbiAgICAgICAgZm9yICh2YXIgYXR0ck5hbWUgaW4gbm9kZS5hdHRyaWJzKSB7XG4gICAgICAgICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lLCBub2RlLmF0dHJpYnNbYXR0ck5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KG5vZGUpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTGlzdFtpXSk7XG4gICAgICB9XG5cbiAgICAgIG1hdGNoZXIubWF0Y2goY3NzU2VsZWN0b3IsIGZ1bmN0aW9uKHNlbGVjdG9yLCBjYikgeyByZXN1bHQgPSB0cnVlOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBvbihlbCwgZXZ0LCBsaXN0ZW5lcikge1xuICAgIHZhciBsaXN0ZW5lcnNNYXA6IHtbazogLyphbnkqLyBzdHJpbmddOiBhbnl9ID0gZWwuX2V2ZW50TGlzdGVuZXJzTWFwO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVyc01hcCkpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnNNYXA6IHtbazogLyphbnkqLyBzdHJpbmddOiBhbnl9ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgICAgIGVsLl9ldmVudExpc3RlbmVyc01hcCA9IGxpc3RlbmVyc01hcDtcbiAgICB9XG4gICAgdmFyIGxpc3RlbmVycyA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGxpc3RlbmVyc01hcCwgZXZ0KTtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnMpKSB7XG4gICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KGxpc3RlbmVyc01hcCwgZXZ0LCBsaXN0ZW5lcnMpO1xuICB9XG4gIG9uQW5kQ2FuY2VsKGVsLCBldnQsIGxpc3RlbmVyKTogRnVuY3Rpb24ge1xuICAgIHRoaXMub24oZWwsIGV2dCwgbGlzdGVuZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUoU3RyaW5nTWFwV3JhcHBlci5nZXQ8YW55W10+KGVsLl9ldmVudExpc3RlbmVyc01hcCwgZXZ0KSwgbGlzdGVuZXIpO1xuICAgIH07XG4gIH1cbiAgZGlzcGF0Y2hFdmVudChlbCwgZXZ0KSB7XG4gICAgaWYgKGlzQmxhbmsoZXZ0LnRhcmdldCkpIHtcbiAgICAgIGV2dC50YXJnZXQgPSBlbDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5fZXZlbnRMaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzOiBhbnkgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dC50eXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQobGlzdGVuZXJzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxpc3RlbmVyc1tpXShldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwucGFyZW50KSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGVsLnBhcmVudCwgZXZ0KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChlbC5fd2luZG93KSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGVsLl93aW5kb3csIGV2dCk7XG4gICAgfVxuICB9XG4gIGNyZWF0ZU1vdXNlRXZlbnQoZXZlbnRUeXBlKTogRXZlbnQgeyByZXR1cm4gdGhpcy5jcmVhdGVFdmVudChldmVudFR5cGUpOyB9XG4gIGNyZWF0ZUV2ZW50KGV2ZW50VHlwZTogc3RyaW5nKTogRXZlbnQge1xuICAgIHZhciBldnQgPSA8RXZlbnQ+e1xuICAgICAgdHlwZTogZXZlbnRUeXBlLFxuICAgICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXG4gICAgICBwcmV2ZW50RGVmYXVsdDogKCkgPT4geyBldnQuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7IH1cbiAgICB9O1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgcHJldmVudERlZmF1bHQoZXZ0KSB7IGV2dC5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9XG4gIGlzUHJldmVudGVkKGV2dCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KGV2dC5yZXR1cm5WYWx1ZSkgJiYgIWV2dC5yZXR1cm5WYWx1ZTsgfVxuICBnZXRJbm5lckhUTUwoZWwpOiBzdHJpbmcgeyByZXR1cm4gc2VyaWFsaXplci5zZXJpYWxpemUodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChlbCkpOyB9XG4gIGdldE91dGVySFRNTChlbCk6IHN0cmluZyB7XG4gICAgc2VyaWFsaXplci5odG1sID0gJyc7XG4gICAgc2VyaWFsaXplci5fc2VyaWFsaXplRWxlbWVudChlbCk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXIuaHRtbDtcbiAgfVxuICBub2RlTmFtZShub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUudGFnTmFtZTsgfVxuICBub2RlVmFsdWUobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLm5vZGVWYWx1ZTsgfVxuICB0eXBlKG5vZGU6IGFueSk6IHN0cmluZyB7IHRocm93IF9ub3RJbXBsZW1lbnRlZCgndHlwZScpOyB9XG4gIGNvbnRlbnQobm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLmNoaWxkTm9kZXNbMF07IH1cbiAgZmlyc3RDaGlsZChlbCk6IE5vZGUgeyByZXR1cm4gZWwuZmlyc3RDaGlsZDsgfVxuICBuZXh0U2libGluZyhlbCk6IE5vZGUgeyByZXR1cm4gZWwubmV4dFNpYmxpbmc7IH1cbiAgcGFyZW50RWxlbWVudChlbCk6IE5vZGUgeyByZXR1cm4gZWwucGFyZW50OyB9XG4gIGNoaWxkTm9kZXMoZWwpOiBOb2RlW10geyByZXR1cm4gZWwuY2hpbGROb2RlczsgfVxuICBjaGlsZE5vZGVzQXNMaXN0KGVsKTogYW55W10ge1xuICAgIHZhciBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcztcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGNoaWxkTm9kZXMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc1tpXSA9IGNoaWxkTm9kZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgY2xlYXJOb2RlcyhlbCkge1xuICAgIHdoaWxlIChlbC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlKGVsLmNoaWxkTm9kZXNbMF0pO1xuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRoaXMudGVtcGxhdGVBd2FyZVJvb3QoZWwpLCBub2RlKTtcbiAgfVxuICByZW1vdmVDaGlsZChlbCwgbm9kZSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5jb250YWlucyhlbC5jaGlsZE5vZGVzLCBub2RlKSkge1xuICAgICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgfVxuICB9XG4gIHJlbW92ZShlbCk6IEhUTUxFbGVtZW50IHtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50O1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHZhciBpbmRleCA9IHBhcmVudC5jaGlsZE5vZGVzLmluZGV4T2YoZWwpO1xuICAgICAgcGFyZW50LmNoaWxkTm9kZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgdmFyIG5leHQgPSBlbC5uZXh0U2libGluZztcbiAgICBpZiAocHJldikge1xuICAgICAgcHJldi5uZXh0ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQpIHtcbiAgICAgIG5leHQucHJldiA9IHByZXY7XG4gICAgfVxuICAgIGVsLnByZXYgPSBudWxsO1xuICAgIGVsLm5leHQgPSBudWxsO1xuICAgIGVsLnBhcmVudCA9IG51bGw7XG4gICAgcmV0dXJuIGVsO1xuICB9XG4gIGluc2VydEJlZm9yZShlbCwgbm9kZSkge1xuICAgIHRoaXMucmVtb3ZlKG5vZGUpO1xuICAgIHRyZWVBZGFwdGVyLmluc2VydEJlZm9yZShlbC5wYXJlbnQsIG5vZGUsIGVsKTtcbiAgfVxuICBpbnNlcnRBbGxCZWZvcmUoZWwsIG5vZGVzKSB7IG5vZGVzLmZvckVhY2gobiA9PiB0aGlzLmluc2VydEJlZm9yZShlbCwgbikpOyB9XG4gIGluc2VydEFmdGVyKGVsLCBub2RlKSB7XG4gICAgaWYgKGVsLm5leHRTaWJsaW5nKSB7XG4gICAgICB0aGlzLmluc2VydEJlZm9yZShlbC5uZXh0U2libGluZywgbm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoZWwucGFyZW50LCBub2RlKTtcbiAgICB9XG4gIH1cbiAgc2V0SW5uZXJIVE1MKGVsLCB2YWx1ZSkge1xuICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgdmFyIGNvbnRlbnQgPSBwYXJzZXIucGFyc2VGcmFnbWVudCh2YWx1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKGVsLCBjb250ZW50LmNoaWxkTm9kZXNbaV0pO1xuICAgIH1cbiAgfVxuICBnZXRUZXh0KGVsLCBpc1JlY3Vyc2l2ZT86IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlzVGV4dE5vZGUoZWwpKSB7XG4gICAgICByZXR1cm4gZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNDb21tZW50Tm9kZShlbCkpIHtcbiAgICAgIC8vIEluIHRoZSBET00sIGNvbW1lbnRzIHdpdGhpbiBhbiBlbGVtZW50IHJldHVybiBhbiBlbXB0eSBzdHJpbmcgZm9yIHRleHRDb250ZW50XG4gICAgICAvLyBIb3dldmVyLCBjb21tZW50IG5vZGUgaW5zdGFuY2VzIHJldHVybiB0aGUgY29tbWVudCBjb250ZW50IGZvciB0ZXh0Q29udGVudCBnZXR0ZXJcbiAgICAgIHJldHVybiBpc1JlY3Vyc2l2ZSA/ICcnIDogZWwuZGF0YTtcbiAgICB9IGVsc2UgaWYgKGlzQmxhbmsoZWwuY2hpbGROb2RlcykgfHwgZWwuY2hpbGROb2Rlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGV4dENvbnRlbnQgKz0gdGhpcy5nZXRUZXh0KGVsLmNoaWxkTm9kZXNbaV0sIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHRDb250ZW50O1xuICAgIH1cbiAgfVxuICBzZXRUZXh0KGVsLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkgfHwgdGhpcy5pc0NvbW1lbnROb2RlKGVsKSkge1xuICAgICAgZWwuZGF0YSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyTm9kZXMoZWwpO1xuICAgICAgaWYgKHZhbHVlICE9PSAnJykgdHJlZUFkYXB0ZXIuaW5zZXJ0VGV4dChlbCwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICBnZXRWYWx1ZShlbCk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbCwgdmFsdWU6IHN0cmluZykgeyBlbC52YWx1ZSA9IHZhbHVlOyB9XG4gIGdldENoZWNrZWQoZWwpOiBib29sZWFuIHsgcmV0dXJuIGVsLmNoZWNrZWQ7IH1cbiAgc2V0Q2hlY2tlZChlbCwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVDb21tZW50Tm9kZSh0ZXh0KTsgfVxuICBjcmVhdGVUZW1wbGF0ZShodG1sKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KGh0bWwpO1xuICAgIHRyZWVBZGFwdGVyLmFwcGVuZENoaWxkKHRlbXBsYXRlLCBjb250ZW50KTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KHRhZ05hbWUsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICB9XG4gIGNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgbnMsIFtdKTsgfVxuICBjcmVhdGVUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBUZXh0IHtcbiAgICB2YXIgdCA9IDxhbnk+dGhpcy5jcmVhdGVDb21tZW50KHRleHQpO1xuICAgIHQudHlwZSA9ICd0ZXh0JztcbiAgICByZXR1cm4gdDtcbiAgfVxuICBjcmVhdGVTY3JpcHRUYWcoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt7bmFtZTogYXR0ck5hbWUsIHZhbHVlOiBhdHRyVmFsdWV9XSk7XG4gIH1cbiAgY3JlYXRlU3R5bGVFbGVtZW50KGNzczogc3RyaW5nKTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc2V0VGV4dChzdHlsZSwgY3NzKTtcbiAgICByZXR1cm4gPEhUTUxTdHlsZUVsZW1lbnQ+c3R5bGU7XG4gIH1cbiAgY3JlYXRlU2hhZG93Um9vdChlbCk6IEhUTUxFbGVtZW50IHtcbiAgICBlbC5zaGFkb3dSb290ID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVsLnNoYWRvd1Jvb3QucGFyZW50ID0gZWw7XG4gICAgcmV0dXJuIGVsLnNoYWRvd1Jvb3Q7XG4gIH1cbiAgZ2V0U2hhZG93Um9vdChlbCk6IEVsZW1lbnQgeyByZXR1cm4gZWwuc2hhZG93Um9vdDsgfVxuICBnZXRIb3N0KGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhvc3Q7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogYW55KTogTm9kZVtdIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXREaXN0cmlidXRlZE5vZGVzJyk7IH1cbiAgY2xvbmUobm9kZTogTm9kZSk6IE5vZGUge1xuICAgIHZhciBfcmVjdXJzaXZlID0gKG5vZGUpID0+IHtcbiAgICAgIHZhciBub2RlQ2xvbmUgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihub2RlKSk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5vZGUsIHByb3ApO1xuICAgICAgICBpZiAoZGVzYyAmJiAndmFsdWUnIGluIGRlc2MgJiYgdHlwZW9mIGRlc2MudmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgbm9kZUNsb25lW3Byb3BdID0gbm9kZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUNsb25lLnBhcmVudCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUucHJldiA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUubmV4dCA9IG51bGw7XG4gICAgICBub2RlQ2xvbmUuY2hpbGRyZW4gPSBudWxsO1xuXG4gICAgICBtYXBQcm9wcy5mb3JFYWNoKG1hcE5hbWUgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KG5vZGVbbWFwTmFtZV0pKSB7XG4gICAgICAgICAgbm9kZUNsb25lW21hcE5hbWVdID0ge307XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBub2RlW21hcE5hbWVdKSB7XG4gICAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV1bcHJvcF0gPSBub2RlW21hcE5hbWVdW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgY05vZGVzID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjTm9kZXMpIHtcbiAgICAgICAgdmFyIGNOb2Rlc0Nsb25lID0gbmV3IEFycmF5KGNOb2Rlcy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBjTm9kZXNbaV07XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZUNsb25lID0gX3JlY3Vyc2l2ZShjaGlsZE5vZGUpO1xuICAgICAgICAgIGNOb2Rlc0Nsb25lW2ldID0gY2hpbGROb2RlQ2xvbmU7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wcmV2ID0gY05vZGVzQ2xvbmVbaSAtIDFdO1xuICAgICAgICAgICAgY05vZGVzQ2xvbmVbaSAtIDFdLm5leHQgPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hpbGROb2RlQ2xvbmUucGFyZW50ID0gbm9kZUNsb25lO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IGNOb2Rlc0Nsb25lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVDbG9uZTtcbiAgICB9O1xuICAgIHJldHVybiBfcmVjdXJzaXZlKG5vZGUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChlbGVtZW50LCBcIi5cIiArIG5hbWUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgdGhyb3cgX25vdEltcGxlbWVudGVkKCdnZXRFbGVtZW50c0J5VGFnTmFtZScpO1xuICB9XG4gIGNsYXNzTGlzdChlbGVtZW50KTogc3RyaW5nW10ge1xuICAgIHZhciBjbGFzc0F0dHJWYWx1ZSA9IG51bGw7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnM7XG4gICAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShcImNsYXNzXCIpKSB7XG4gICAgICBjbGFzc0F0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJjbGFzc1wiXTtcbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzQXR0clZhbHVlID8gY2xhc3NBdHRyVmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpIDogW107XG4gIH1cbiAgYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5jbGFzc0xpc3QoZWxlbWVudCk7XG4gICAgdmFyIGluZGV4ID0gY2xhc3NMaXN0LmluZGV4T2YoY2xhc3NOYW1lKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5wdXNoKGNsYXNzTmFtZSk7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NMaXN0LmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfVxuICByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBjbGFzc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1tcImNsYXNzXCJdID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIGhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmNvbnRhaW5zKHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpLCBjbGFzc05hbWUpO1xuICB9XG4gIGhhc1N0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpIHx8ICcnO1xuICAgIHJldHVybiBzdHlsZVZhbHVlID8gdmFsdWUgPT0gc3R5bGVWYWx1ZSA6IHZhbHVlLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVhZFN0eWxlQXR0cmlidXRlKGVsZW1lbnQpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB7fTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KFwic3R5bGVcIikpIHtcbiAgICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbXCJzdHlsZVwiXTtcbiAgICAgIHZhciBzdHlsZUxpc3QgPSBzdHlsZUF0dHJWYWx1ZS5zcGxpdCgvOysvZyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3R5bGVMaXN0W2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgZWxlbXMgPSBzdHlsZUxpc3RbaV0uc3BsaXQoLzorL2cpO1xuICAgICAgICAgIHN0eWxlTWFwW2VsZW1zWzBdLnRyaW0oKV0gPSBlbGVtc1sxXS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlTWFwO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dyaXRlU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVNYXApIHtcbiAgICB2YXIgc3R5bGVBdHRyVmFsdWUgPSBcIlwiO1xuICAgIGZvciAodmFyIGtleSBpbiBzdHlsZU1hcCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gc3R5bGVNYXBba2V5XTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiBuZXdWYWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN0eWxlQXR0clZhbHVlICs9IGtleSArIFwiOlwiICsgc3R5bGVNYXBba2V5XSArIFwiO1wiO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtZW50LmF0dHJpYnNbXCJzdHlsZVwiXSA9IHN0eWxlQXR0clZhbHVlO1xuICB9XG4gIHNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgc3R5bGVNYXBbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWU7XG4gICAgdGhpcy5fd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCk7XG4gIH1cbiAgcmVtb3ZlU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpIHsgdGhpcy5zZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUsIG51bGwpOyB9XG4gIGdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgc3R5bGVNYXAgPSB0aGlzLl9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gICAgcmV0dXJuIHN0eWxlTWFwLmhhc093blByb3BlcnR5KHN0eWxlTmFtZSkgPyBzdHlsZU1hcFtzdHlsZU5hbWVdIDogXCJcIjtcbiAgfVxuICB0YWdOYW1lKGVsZW1lbnQpOiBzdHJpbmcgeyByZXR1cm4gZWxlbWVudC50YWdOYW1lID09IFwic3R5bGVcIiA/IFwiU1RZTEVcIiA6IGVsZW1lbnQudGFnTmFtZTsgfVxuICBhdHRyaWJ1dGVNYXAoZWxlbWVudCk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHZhciByZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIHZhciBlbEF0dHJzID0gdHJlZUFkYXB0ZXIuZ2V0QXR0ckxpc3QoZWxlbWVudCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0cmliID0gZWxBdHRyc1tpXTtcbiAgICAgIHJlcy5zZXQoYXR0cmliLm5hbWUsIGF0dHJpYi52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgaGFzQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKTtcbiAgfVxuICBnZXRBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBlbGVtZW50LmF0dHJpYnMgJiYgZWxlbWVudC5hdHRyaWJzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSkgP1xuICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuICBzZXRBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICBlbGVtZW50LmF0dHJpYnNbYXR0cmlidXRlXSA9IHZhbHVlO1xuICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBzZXRBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZW1vdmVBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmRlbGV0ZShlbGVtZW50LmF0dHJpYnMsIGF0dHJpYnV0ZSk7XG4gICAgfVxuICB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBEb2N1bWVudCB7XG4gICAgdmFyIG5ld0RvYyA9IHRyZWVBZGFwdGVyLmNyZWF0ZURvY3VtZW50KCk7XG4gICAgbmV3RG9jLnRpdGxlID0gXCJmYWtlIHRpdGxlXCI7XG4gICAgdmFyIGhlYWQgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiaGVhZFwiLCBudWxsLCBbXSk7XG4gICAgdmFyIGJvZHkgPSB0cmVlQWRhcHRlci5jcmVhdGVFbGVtZW50KFwiYm9keVwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFtdKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgaGVhZCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChuZXdEb2MsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJoZWFkXCIsIGhlYWQpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJib2R5XCIsIGJvZHkpO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KG5ld0RvYywgXCJfd2luZG93XCIsIFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCkpO1xuICAgIHJldHVybiBuZXdEb2M7XG4gIH1cbiAgZGVmYXVsdERvYygpOiBEb2N1bWVudCB7XG4gICAgaWYgKGRlZkRvYyA9PT0gbnVsbCkge1xuICAgICAgZGVmRG9jID0gdGhpcy5jcmVhdGVIdG1sRG9jdW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZkRvYztcbiAgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWwpOiBhbnkgeyByZXR1cm4ge2xlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMH07IH1cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLnRpdGxlIHx8IFwiXCI7IH1cbiAgc2V0VGl0bGUobmV3VGl0bGU6IHN0cmluZykgeyB0aGlzLmRlZmF1bHREb2MoKS50aXRsZSA9IG5ld1RpdGxlOyB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VsZW1lbnROb2RlKGVsKSAmJiB0aGlzLnRhZ05hbWUoZWwpID09PSBcInRlbXBsYXRlXCI7XG4gIH1cbiAgaXNUZXh0Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc1RleHROb2RlKG5vZGUpOyB9XG4gIGlzQ29tbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdHJlZUFkYXB0ZXIuaXNDb21tZW50Tm9kZShub2RlKTsgfVxuICBpc0VsZW1lbnROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUgPyB0cmVlQWRhcHRlci5pc0VsZW1lbnROb2RlKG5vZGUpIDogZmFsc2U7IH1cbiAgaGFzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQobm9kZS5zaGFkb3dSb290KTsgfVxuICBpc1NoYWRvd1Jvb3Qobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRTaGFkb3dSb290KG5vZGUpID09IG5vZGU7IH1cbiAgaW1wb3J0SW50b0RvYyhub2RlKTogYW55IHsgcmV0dXJuIHRoaXMuY2xvbmUobm9kZSk7IH1cbiAgYWRvcHROb2RlKG5vZGUpOiBhbnkgeyByZXR1cm4gbm9kZTsgfVxuICBnZXRIcmVmKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLmhyZWY7IH1cbiAgcmVzb2x2ZUFuZFNldEhyZWYoZWwsIGJhc2VVcmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XG4gICAgaWYgKGhyZWYgPT0gbnVsbCkge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmhyZWYgPSBiYXNlVXJsICsgJy8uLi8nICsgaHJlZjtcbiAgICB9XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYnVpbGRSdWxlcyhwYXJzZWRSdWxlcywgY3NzPykge1xuICAgIHZhciBydWxlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VkUnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXJzZWRSdWxlID0gcGFyc2VkUnVsZXNbaV07XG4gICAgICB2YXIgcnVsZToge1trZXk6IHN0cmluZ106IGFueX0gPSBTdHJpbmdNYXBXcmFwcGVyLmNyZWF0ZSgpO1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NUZXh0XCIsIGNzcyk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInN0eWxlXCIsIHtjb250ZW50OiBcIlwiLCBjc3NUZXh0OiBcIlwifSk7XG4gICAgICBpZiAocGFyc2VkUnVsZS50eXBlID09IFwicnVsZVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCAxKTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJzZWxlY3RvclRleHRcIiwgcGFyc2VkUnVsZS5zZWxlY3RvcnMuam9pbihcIiwgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyp+XFxzKi9nLCBcIiB+IFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqXFwrXFxzKi9nLCBcIiArIFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqPlxccyovZywgXCIgPiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxbKFxcdyspPShcXHcrKVxcXS9nLCAnWyQxPVwiJDJcIl0nKSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgZGVjbGFyYXRpb24gPSBwYXJzZWRSdWxlLmRlY2xhcmF0aW9uc1tqXTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCBcInN0eWxlXCIpLCBkZWNsYXJhdGlvbi5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5nZXQocnVsZSwgXCJzdHlsZVwiKS5jc3NUZXh0ICs9XG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnByb3BlcnR5ICsgXCI6IFwiICsgZGVjbGFyYXRpb24udmFsdWUgKyBcIjtcIjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gXCJtZWRpYVwiKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwidHlwZVwiLCA0KTtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJtZWRpYVwiLCB7bWVkaWFUZXh0OiBwYXJzZWRSdWxlLm1lZGlhfSk7XG4gICAgICAgIGlmIChwYXJzZWRSdWxlLnJ1bGVzKSB7XG4gICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJjc3NSdWxlc1wiLCB0aGlzLl9idWlsZFJ1bGVzKHBhcnNlZFJ1bGUucnVsZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBnZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQ6IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKHRhcmdldCA9PSBcIndpbmRvd1wiKSB7XG4gICAgICByZXR1cm4gKDxhbnk+dGhpcy5kZWZhdWx0RG9jKCkpLl93aW5kb3c7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJkb2N1bWVudFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJib2R5XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKS5ib2R5O1xuICAgIH1cbiAgfVxuICBnZXRCYXNlSHJlZigpOiBzdHJpbmcgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICByZXNldEJhc2VFbGVtZW50KCk6IHZvaWQgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRIaXN0b3J5KCk6IEhpc3RvcnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBnZXRMb2NhdGlvbigpOiBMb2NhdGlvbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldFVzZXJBZ2VudCgpOiBzdHJpbmcgeyByZXR1cm4gXCJGYWtlIHVzZXIgYWdlbnRcIjsgfVxuICBnZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lKTsgfVxuICBnZXRDb21wdXRlZFN0eWxlKGVsKTogYW55IHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgc2V0RGF0YShlbCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7IHRoaXMuc2V0QXR0cmlidXRlKGVsLCAnZGF0YS0nICsgbmFtZSwgdmFsdWUpOyB9XG4gIC8vIFRPRE8odGJvc2NoKTogbW92ZSB0aGlzIGludG8gYSBzZXBhcmF0ZSBlbnZpcm9ubWVudCBjbGFzcyBvbmNlIHdlIGhhdmUgaXRcbiAgc2V0R2xvYmFsVmFyKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkgeyBzZXRWYWx1ZU9uUGF0aChnbG9iYWwsIHBhdGgsIHZhbHVlKTsgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spOiBudW1iZXIgeyByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgMCk7IH1cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQ6IG51bWJlcikgeyBjbGVhclRpbWVvdXQoaWQpOyB9XG4gIHBlcmZvcm1hbmNlTm93KCk6IG51bWJlciB7IHJldHVybiBEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSk7IH1cbiAgZ2V0QW5pbWF0aW9uUHJlZml4KCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuICBnZXRUcmFuc2l0aW9uRW5kKCk6IHN0cmluZyB7IHJldHVybiAndHJhbnNpdGlvbmVuZCc7IH1cbiAgc3VwcG9ydHNBbmltYXRpb24oKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgcmVwbGFjZUNoaWxkKGVsLCBuZXdOb2RlLCBvbGROb2RlKSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgcGFyc2UodGVtcGxhdGVIdG1sOiBzdHJpbmcpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBpbnZva2UoZWw6IEVsZW1lbnQsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGdldEV2ZW50S2V5KGV2ZW50KTogc3RyaW5nIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxufVxuXG4vLyBUT0RPOiBidWlsZCBhIHByb3BlciBsaXN0LCB0aGlzIG9uZSBpcyBhbGwgdGhlIGtleXMgb2YgYSBIVE1MSW5wdXRFbGVtZW50XG52YXIgX0hUTUxFbGVtZW50UHJvcGVydHlMaXN0ID0gW1xuICBcIndlYmtpdEVudHJpZXNcIixcbiAgXCJpbmNyZW1lbnRhbFwiLFxuICBcIndlYmtpdGRpcmVjdG9yeVwiLFxuICBcInNlbGVjdGlvbkRpcmVjdGlvblwiLFxuICBcInNlbGVjdGlvbkVuZFwiLFxuICBcInNlbGVjdGlvblN0YXJ0XCIsXG4gIFwibGFiZWxzXCIsXG4gIFwidmFsaWRhdGlvbk1lc3NhZ2VcIixcbiAgXCJ2YWxpZGl0eVwiLFxuICBcIndpbGxWYWxpZGF0ZVwiLFxuICBcIndpZHRoXCIsXG4gIFwidmFsdWVBc051bWJlclwiLFxuICBcInZhbHVlQXNEYXRlXCIsXG4gIFwidmFsdWVcIixcbiAgXCJ1c2VNYXBcIixcbiAgXCJkZWZhdWx0VmFsdWVcIixcbiAgXCJ0eXBlXCIsXG4gIFwic3RlcFwiLFxuICBcInNyY1wiLFxuICBcInNpemVcIixcbiAgXCJyZXF1aXJlZFwiLFxuICBcInJlYWRPbmx5XCIsXG4gIFwicGxhY2Vob2xkZXJcIixcbiAgXCJwYXR0ZXJuXCIsXG4gIFwibmFtZVwiLFxuICBcIm11bHRpcGxlXCIsXG4gIFwibWluXCIsXG4gIFwibWluTGVuZ3RoXCIsXG4gIFwibWF4TGVuZ3RoXCIsXG4gIFwibWF4XCIsXG4gIFwibGlzdFwiLFxuICBcImluZGV0ZXJtaW5hdGVcIixcbiAgXCJoZWlnaHRcIixcbiAgXCJmb3JtVGFyZ2V0XCIsXG4gIFwiZm9ybU5vVmFsaWRhdGVcIixcbiAgXCJmb3JtTWV0aG9kXCIsXG4gIFwiZm9ybUVuY3R5cGVcIixcbiAgXCJmb3JtQWN0aW9uXCIsXG4gIFwiZmlsZXNcIixcbiAgXCJmb3JtXCIsXG4gIFwiZGlzYWJsZWRcIixcbiAgXCJkaXJOYW1lXCIsXG4gIFwiY2hlY2tlZFwiLFxuICBcImRlZmF1bHRDaGVja2VkXCIsXG4gIFwiYXV0b2ZvY3VzXCIsXG4gIFwiYXV0b2NvbXBsZXRlXCIsXG4gIFwiYWx0XCIsXG4gIFwiYWxpZ25cIixcbiAgXCJhY2NlcHRcIixcbiAgXCJvbmF1dG9jb21wbGV0ZWVycm9yXCIsXG4gIFwib25hdXRvY29tcGxldGVcIixcbiAgXCJvbndhaXRpbmdcIixcbiAgXCJvbnZvbHVtZWNoYW5nZVwiLFxuICBcIm9udG9nZ2xlXCIsXG4gIFwib250aW1ldXBkYXRlXCIsXG4gIFwib25zdXNwZW5kXCIsXG4gIFwib25zdWJtaXRcIixcbiAgXCJvbnN0YWxsZWRcIixcbiAgXCJvbnNob3dcIixcbiAgXCJvbnNlbGVjdFwiLFxuICBcIm9uc2Vla2luZ1wiLFxuICBcIm9uc2Vla2VkXCIsXG4gIFwib25zY3JvbGxcIixcbiAgXCJvbnJlc2l6ZVwiLFxuICBcIm9ucmVzZXRcIixcbiAgXCJvbnJhdGVjaGFuZ2VcIixcbiAgXCJvbnByb2dyZXNzXCIsXG4gIFwib25wbGF5aW5nXCIsXG4gIFwib25wbGF5XCIsXG4gIFwib25wYXVzZVwiLFxuICBcIm9ubW91c2V3aGVlbFwiLFxuICBcIm9ubW91c2V1cFwiLFxuICBcIm9ubW91c2VvdmVyXCIsXG4gIFwib25tb3VzZW91dFwiLFxuICBcIm9ubW91c2Vtb3ZlXCIsXG4gIFwib25tb3VzZWxlYXZlXCIsXG4gIFwib25tb3VzZWVudGVyXCIsXG4gIFwib25tb3VzZWRvd25cIixcbiAgXCJvbmxvYWRzdGFydFwiLFxuICBcIm9ubG9hZGVkbWV0YWRhdGFcIixcbiAgXCJvbmxvYWRlZGRhdGFcIixcbiAgXCJvbmxvYWRcIixcbiAgXCJvbmtleXVwXCIsXG4gIFwib25rZXlwcmVzc1wiLFxuICBcIm9ua2V5ZG93blwiLFxuICBcIm9uaW52YWxpZFwiLFxuICBcIm9uaW5wdXRcIixcbiAgXCJvbmZvY3VzXCIsXG4gIFwib25lcnJvclwiLFxuICBcIm9uZW5kZWRcIixcbiAgXCJvbmVtcHRpZWRcIixcbiAgXCJvbmR1cmF0aW9uY2hhbmdlXCIsXG4gIFwib25kcm9wXCIsXG4gIFwib25kcmFnc3RhcnRcIixcbiAgXCJvbmRyYWdvdmVyXCIsXG4gIFwib25kcmFnbGVhdmVcIixcbiAgXCJvbmRyYWdlbnRlclwiLFxuICBcIm9uZHJhZ2VuZFwiLFxuICBcIm9uZHJhZ1wiLFxuICBcIm9uZGJsY2xpY2tcIixcbiAgXCJvbmN1ZWNoYW5nZVwiLFxuICBcIm9uY29udGV4dG1lbnVcIixcbiAgXCJvbmNsb3NlXCIsXG4gIFwib25jbGlja1wiLFxuICBcIm9uY2hhbmdlXCIsXG4gIFwib25jYW5wbGF5dGhyb3VnaFwiLFxuICBcIm9uY2FucGxheVwiLFxuICBcIm9uY2FuY2VsXCIsXG4gIFwib25ibHVyXCIsXG4gIFwib25hYm9ydFwiLFxuICBcInNwZWxsY2hlY2tcIixcbiAgXCJpc0NvbnRlbnRFZGl0YWJsZVwiLFxuICBcImNvbnRlbnRFZGl0YWJsZVwiLFxuICBcIm91dGVyVGV4dFwiLFxuICBcImlubmVyVGV4dFwiLFxuICBcImFjY2Vzc0tleVwiLFxuICBcImhpZGRlblwiLFxuICBcIndlYmtpdGRyb3B6b25lXCIsXG4gIFwiZHJhZ2dhYmxlXCIsXG4gIFwidGFiSW5kZXhcIixcbiAgXCJkaXJcIixcbiAgXCJ0cmFuc2xhdGVcIixcbiAgXCJsYW5nXCIsXG4gIFwidGl0bGVcIixcbiAgXCJjaGlsZEVsZW1lbnRDb3VudFwiLFxuICBcImxhc3RFbGVtZW50Q2hpbGRcIixcbiAgXCJmaXJzdEVsZW1lbnRDaGlsZFwiLFxuICBcImNoaWxkcmVuXCIsXG4gIFwib253ZWJraXRmdWxsc2NyZWVuZXJyb3JcIixcbiAgXCJvbndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2VcIixcbiAgXCJuZXh0RWxlbWVudFNpYmxpbmdcIixcbiAgXCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nXCIsXG4gIFwib253aGVlbFwiLFxuICBcIm9uc2VsZWN0c3RhcnRcIixcbiAgXCJvbnNlYXJjaFwiLFxuICBcIm9ucGFzdGVcIixcbiAgXCJvbmN1dFwiLFxuICBcIm9uY29weVwiLFxuICBcIm9uYmVmb3JlcGFzdGVcIixcbiAgXCJvbmJlZm9yZWN1dFwiLFxuICBcIm9uYmVmb3JlY29weVwiLFxuICBcInNoYWRvd1Jvb3RcIixcbiAgXCJkYXRhc2V0XCIsXG4gIFwiY2xhc3NMaXN0XCIsXG4gIFwiY2xhc3NOYW1lXCIsXG4gIFwib3V0ZXJIVE1MXCIsXG4gIFwiaW5uZXJIVE1MXCIsXG4gIFwic2Nyb2xsSGVpZ2h0XCIsXG4gIFwic2Nyb2xsV2lkdGhcIixcbiAgXCJzY3JvbGxUb3BcIixcbiAgXCJzY3JvbGxMZWZ0XCIsXG4gIFwiY2xpZW50SGVpZ2h0XCIsXG4gIFwiY2xpZW50V2lkdGhcIixcbiAgXCJjbGllbnRUb3BcIixcbiAgXCJjbGllbnRMZWZ0XCIsXG4gIFwib2Zmc2V0UGFyZW50XCIsXG4gIFwib2Zmc2V0SGVpZ2h0XCIsXG4gIFwib2Zmc2V0V2lkdGhcIixcbiAgXCJvZmZzZXRUb3BcIixcbiAgXCJvZmZzZXRMZWZ0XCIsXG4gIFwibG9jYWxOYW1lXCIsXG4gIFwicHJlZml4XCIsXG4gIFwibmFtZXNwYWNlVVJJXCIsXG4gIFwiaWRcIixcbiAgXCJzdHlsZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJ0YWdOYW1lXCIsXG4gIFwicGFyZW50RWxlbWVudFwiLFxuICBcInRleHRDb250ZW50XCIsXG4gIFwiYmFzZVVSSVwiLFxuICBcIm93bmVyRG9jdW1lbnRcIixcbiAgXCJuZXh0U2libGluZ1wiLFxuICBcInByZXZpb3VzU2libGluZ1wiLFxuICBcImxhc3RDaGlsZFwiLFxuICBcImZpcnN0Q2hpbGRcIixcbiAgXCJjaGlsZE5vZGVzXCIsXG4gIFwicGFyZW50Tm9kZVwiLFxuICBcIm5vZGVUeXBlXCIsXG4gIFwibm9kZVZhbHVlXCIsXG4gIFwibm9kZU5hbWVcIixcbiAgXCJjbG9zdXJlX2xtXzcxNDYxN1wiLFxuICBcIl9fanNhY3Rpb25cIlxuXTtcbiJdfQ==