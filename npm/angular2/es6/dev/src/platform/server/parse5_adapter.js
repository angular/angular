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
    hasAttributeNS(element, ns, attribute) { throw 'not implemented'; }
    getAttribute(element, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    }
    getAttributeNS(element, ns, attribute) { throw 'not implemented'; }
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
    removeAttributeNS(element, ns, name) { throw 'not implemented'; }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1X2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoRSxJQUFJLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4RSxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO09BRTlCLEVBQWEsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ2pGLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sOEJBQThCO09BQ25FLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFDUCxNQUFNLEVBRU4sY0FBYyxFQUNkLFdBQVcsRUFDWixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxlQUFlLEVBQUUsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO0FBRTdDLElBQUksY0FBYyxHQUE0QjtJQUM1QyxPQUFPLEVBQUUsV0FBVztJQUNwQixXQUFXLEVBQUUsV0FBVztJQUN4QixVQUFVLEVBQUUsVUFBVTtJQUN0QixVQUFVLEVBQUUsVUFBVTtDQUN2QixDQUFDO0FBQ0YsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBRWxCLElBQUksUUFBUSxHQUFHLENBQUMsU0FBUyxFQUFFLG9CQUFvQixF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QVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNyQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzlDLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDckIsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQWE7UUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNsQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztJQUNILENBQUM7SUFDRCxRQUFRLENBQUMsRUFBRSxJQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN6QyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQWEsSUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFB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QVc7SUFDWCxZQUFZO0lBQ1osY0FBYztJQUNkLGFBQWE7SUFDYixXQUFXO0lBQ1gsWUFBWTtJQUNaLGNBQWM7SUFDZCxjQUFjO0lBQ2QsYUFBYTtJQUNiLFdBQVc7SUFDWCxZQUFZO0lBQ1osV0FBVztJQUNYLFFBQVE7SUFDUixjQUFjO0lBQ2QsSUFBSTtJQUNKLE9BQU87SUFDUCxZQUFZO0lBQ1osU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsU0FBUztJQUNULGVBQWU7SUFDZixhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLFdBQVc7SUFDWCxZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixVQUFVO0lBQ1YsV0FBVztJQUNYLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsWUFBWTtDQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcGFyc2U1ID0gcmVxdWlyZSgncGFyc2U1L2luZGV4Jyk7XG52YXIgcGFyc2VyID0gbmV3IHBhcnNlNS5QYXJzZXIocGFyc2U1LlRyZWVBZGFwdGVycy5odG1scGFyc2VyMik7XG52YXIgc2VyaWFsaXplciA9IG5ldyBwYXJzZTUuU2VyaWFsaXplcihwYXJzZTUuVHJlZUFkYXB0ZXJzLmh0bWxwYXJzZXIyKTtcbnZhciB0cmVlQWRhcHRlciA9IHBhcnNlci50cmVlQWRhcHRlcjtcblxuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RG9tQWRhcHRlciwgc2V0Um9vdERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBnbG9iYWwsXG4gIFR5cGUsXG4gIHNldFZhbHVlT25QYXRoLFxuICBEYXRlV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTZWxlY3Rvck1hdGNoZXIsIENzc1NlbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG52YXIgX2F0dHJUb1Byb3BNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnLFxufTtcbnZhciBkZWZEb2MgPSBudWxsO1xuXG52YXIgbWFwUHJvcHMgPSBbJ2F0dHJpYnMnLCAneC1hdHRyaWJzTmFtZXNwYWNlJywgJ3gtYXR0cmlic1ByZWZpeCddO1xuXG5mdW5jdGlvbiBfbm90SW1wbGVtZW50ZWQobWV0aG9kTmFtZSkge1xuICByZXR1cm4gbmV3IEJhc2VFeGNlcHRpb24oJ1RoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBpbiBQYXJzZTVEb21BZGFwdGVyOiAnICsgbWV0aG9kTmFtZSk7XG59XG5cbi8qIHRzbGludDpkaXNhYmxlOnJlcXVpcmVQYXJhbWV0ZXJUeXBlICovXG5leHBvcnQgY2xhc3MgUGFyc2U1RG9tQWRhcHRlciBleHRlbmRzIERvbUFkYXB0ZXIge1xuICBzdGF0aWMgbWFrZUN1cnJlbnQoKSB7IHNldFJvb3REb21BZGFwdGVyKG5ldyBQYXJzZTVEb21BZGFwdGVyKCkpOyB9XG5cbiAgaGFzUHJvcGVydHkoZWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9IVE1MRWxlbWVudFByb3BlcnR5TGlzdC5pbmRleE9mKG5hbWUpID4gLTE7XG4gIH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBkb24ndCBldmVuIGNhbGwgdGhpcyBtZXRob2Qgd2hlbiB3ZSBydW4gdGhlIHRlc3RzIG9uIHNlcnZlciBzaWRlXG4gIC8vIGJ5IG5vdCB1c2luZyB0aGUgRG9tUmVuZGVyZXIgaW4gdGVzdHMuIEtlZXBpbmcgdGhpcyBmb3Igbm93IHRvIG1ha2UgdGVzdHMgaGFwcHkuLi5cbiAgc2V0UHJvcGVydHkoZWw6IC8qZWxlbWVudCovIGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKG5hbWUgPT09ICdpbm5lckhUTUwnKSB7XG4gICAgICB0aGlzLnNldElubmVySFRNTChlbCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgIGVsLmF0dHJpYnNbXCJjbGFzc1wiXSA9IGVsLmNsYXNzTmFtZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICAvLyBUT0RPKHRib3NjaCk6IGRvbid0IGV2ZW4gY2FsbCB0aGlzIG1ldGhvZCB3aGVuIHdlIHJ1biB0aGUgdGVzdHMgb24gc2VydmVyIHNpZGVcbiAgLy8gYnkgbm90IHVzaW5nIHRoZSBEb21SZW5kZXJlciBpbiB0ZXN0cy4gS2VlcGluZyB0aGlzIGZvciBub3cgdG8gbWFrZSB0ZXN0cyBoYXBweS4uLlxuICBnZXRQcm9wZXJ0eShlbDogLyplbGVtZW50Ki8gYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gZWxbbmFtZV07IH1cblxuICBsb2dFcnJvcihlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZyhlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cblxuICBsb2dHcm91cChlcnJvcikgeyBjb25zb2xlLmVycm9yKGVycm9yKTsgfVxuXG4gIGxvZ0dyb3VwRW5kKCkge31cblxuICBnZXRYSFIoKTogVHlwZSB7IHJldHVybiBYSFI7IH1cblxuICBnZXQgYXR0clRvUHJvcE1hcCgpIHsgcmV0dXJuIF9hdHRyVG9Qcm9wTWFwOyB9XG5cbiAgcXVlcnkoc2VsZWN0b3IpIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCdxdWVyeScpOyB9XG4gIHF1ZXJ5U2VsZWN0b3IoZWwsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGVsLCBzZWxlY3RvcilbMF07IH1cbiAgcXVlcnlTZWxlY3RvckFsbChlbCwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgdmFyIF9yZWN1cnNpdmUgPSAocmVzdWx0LCBub2RlLCBzZWxlY3RvciwgbWF0Y2hlcikgPT4ge1xuICAgICAgdmFyIGNOb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICAgIGlmIChjTm9kZXMgJiYgY05vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gY05vZGVzW2ldO1xuICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRNYXRjaGVzKGNoaWxkTm9kZSwgc2VsZWN0b3IsIG1hdGNoZXIpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVjdXJzaXZlKHJlc3VsdCwgY2hpbGROb2RlLCBzZWxlY3RvciwgbWF0Y2hlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICBfcmVjdXJzaXZlKHJlcywgZWwsIHNlbGVjdG9yLCBtYXRjaGVyKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGVsZW1lbnRNYXRjaGVzKG5vZGUsIHNlbGVjdG9yOiBzdHJpbmcsIG1hdGNoZXIgPSBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbGVtZW50Tm9kZShub2RlKSAmJiBzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChzZWxlY3RvciAmJiBzZWxlY3Rvci5jaGFyQXQoMCkgPT0gXCIjXCIpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5vZGUsICdpZCcpID09IHNlbGVjdG9yLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBpZiAobWF0Y2hlciA9PSBudWxsKSB7XG4gICAgICAgIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gICAgICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KHRoaXMudGFnTmFtZShub2RlKSk7XG4gICAgICBpZiAobm9kZS5hdHRyaWJzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIG5vZGUuYXR0cmlicykge1xuICAgICAgICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZSwgbm9kZS5hdHRyaWJzW2F0dHJOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChub2RlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc0xpc3RbaV0pO1xuICAgICAgfVxuXG4gICAgICBtYXRjaGVyLm1hdGNoKGNzc1NlbGVjdG9yLCBmdW5jdGlvbihzZWxlY3RvciwgY2IpIHsgcmVzdWx0ID0gdHJ1ZTsgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgb24oZWwsIGV2dCwgbGlzdGVuZXIpIHtcbiAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IGVsLl9ldmVudExpc3RlbmVyc01hcDtcbiAgICBpZiAoaXNCbGFuayhsaXN0ZW5lcnNNYXApKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzTWFwOiB7W2s6IC8qYW55Ki8gc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBlbC5fZXZlbnRMaXN0ZW5lcnNNYXAgPSBsaXN0ZW5lcnNNYXA7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChsaXN0ZW5lcnNNYXAsIGV2dCk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChsaXN0ZW5lcnNNYXAsIGV2dCwgbGlzdGVuZXJzKTtcbiAgfVxuICBvbkFuZENhbmNlbChlbCwgZXZ0LCBsaXN0ZW5lcik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLm9uKGVsLCBldnQsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKFN0cmluZ01hcFdyYXBwZXIuZ2V0PGFueVtdPihlbC5fZXZlbnRMaXN0ZW5lcnNNYXAsIGV2dCksIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9XG4gIGRpc3BhdGNoRXZlbnQoZWwsIGV2dCkge1xuICAgIGlmIChpc0JsYW5rKGV2dC50YXJnZXQpKSB7XG4gICAgICBldnQudGFyZ2V0ID0gZWw7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwKSkge1xuICAgICAgdmFyIGxpc3RlbmVyczogYW55ID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZWwuX2V2ZW50TGlzdGVuZXJzTWFwLCBldnQudHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGxpc3RlbmVycykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsaXN0ZW5lcnNbaV0oZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGVsLnBhcmVudCkpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5wYXJlbnQsIGV2dCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoZWwuX3dpbmRvdykpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlbC5fd2luZG93LCBldnQpO1xuICAgIH1cbiAgfVxuICBjcmVhdGVNb3VzZUV2ZW50KGV2ZW50VHlwZSk6IEV2ZW50IHsgcmV0dXJuIHRoaXMuY3JlYXRlRXZlbnQoZXZlbnRUeXBlKTsgfVxuICBjcmVhdGVFdmVudChldmVudFR5cGU6IHN0cmluZyk6IEV2ZW50IHtcbiAgICB2YXIgZXZ0ID0gPEV2ZW50PntcbiAgICAgIHR5cGU6IGV2ZW50VHlwZSxcbiAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6ICgpID0+IHsgKDxhbnk+ZXZ0KS5kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTsgfVxuICAgIH07XG4gICAgcmV0dXJuIGV2dDtcbiAgfVxuICBwcmV2ZW50RGVmYXVsdChldnQpIHsgZXZ0LnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgaXNQcmV2ZW50ZWQoZXZ0KTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQoZXZ0LnJldHVyblZhbHVlKSAmJiAhZXZ0LnJldHVyblZhbHVlOyB9XG4gIGdldElubmVySFRNTChlbCk6IHN0cmluZyB7IHJldHVybiBzZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLnRlbXBsYXRlQXdhcmVSb290KGVsKSk7IH1cbiAgZ2V0T3V0ZXJIVE1MKGVsKTogc3RyaW5nIHtcbiAgICBzZXJpYWxpemVyLmh0bWwgPSAnJztcbiAgICBzZXJpYWxpemVyLl9zZXJpYWxpemVFbGVtZW50KGVsKTtcbiAgICByZXR1cm4gc2VyaWFsaXplci5odG1sO1xuICB9XG4gIG5vZGVOYW1lKG5vZGUpOiBzdHJpbmcgeyByZXR1cm4gbm9kZS50YWdOYW1lOyB9XG4gIG5vZGVWYWx1ZShub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUubm9kZVZhbHVlOyB9XG4gIHR5cGUobm9kZTogYW55KTogc3RyaW5nIHsgdGhyb3cgX25vdEltcGxlbWVudGVkKCd0eXBlJyk7IH1cbiAgY29udGVudChub2RlKTogc3RyaW5nIHsgcmV0dXJuIG5vZGUuY2hpbGROb2Rlc1swXTsgfVxuICBmaXJzdENoaWxkKGVsKTogTm9kZSB7IHJldHVybiBlbC5maXJzdENoaWxkOyB9XG4gIG5leHRTaWJsaW5nKGVsKTogTm9kZSB7IHJldHVybiBlbC5uZXh0U2libGluZzsgfVxuICBwYXJlbnRFbGVtZW50KGVsKTogTm9kZSB7IHJldHVybiBlbC5wYXJlbnQ7IH1cbiAgY2hpbGROb2RlcyhlbCk6IE5vZGVbXSB7IHJldHVybiBlbC5jaGlsZE5vZGVzOyB9XG4gIGNoaWxkTm9kZXNBc0xpc3QoZWwpOiBhbnlbXSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBlbC5jaGlsZE5vZGVzO1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoY2hpbGROb2Rlcy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzW2ldID0gY2hpbGROb2Rlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBjbGVhck5vZGVzKGVsKSB7XG4gICAgd2hpbGUgKGVsLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmUoZWwuY2hpbGROb2Rlc1swXSk7XG4gICAgfVxuICB9XG4gIGFwcGVuZENoaWxkKGVsLCBub2RlKSB7XG4gICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQodGhpcy50ZW1wbGF0ZUF3YXJlUm9vdChlbCksIG5vZGUpO1xuICB9XG4gIHJlbW92ZUNoaWxkKGVsLCBub2RlKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmNvbnRhaW5zKGVsLmNoaWxkTm9kZXMsIG5vZGUpKSB7XG4gICAgICB0aGlzLnJlbW92ZShub2RlKTtcbiAgICB9XG4gIH1cbiAgcmVtb3ZlKGVsKTogSFRNTEVsZW1lbnQge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgdmFyIGluZGV4ID0gcGFyZW50LmNoaWxkTm9kZXMuaW5kZXhPZihlbCk7XG4gICAgICBwYXJlbnQuY2hpbGROb2Rlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICB2YXIgcHJldiA9IGVsLnByZXZpb3VzU2libGluZztcbiAgICB2YXIgbmV4dCA9IGVsLm5leHRTaWJsaW5nO1xuICAgIGlmIChwcmV2KSB7XG4gICAgICBwcmV2Lm5leHQgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCkge1xuICAgICAgbmV4dC5wcmV2ID0gcHJldjtcbiAgICB9XG4gICAgZWwucHJldiA9IG51bGw7XG4gICAgZWwubmV4dCA9IG51bGw7XG4gICAgZWwucGFyZW50ID0gbnVsbDtcbiAgICByZXR1cm4gZWw7XG4gIH1cbiAgaW5zZXJ0QmVmb3JlKGVsLCBub2RlKSB7XG4gICAgdGhpcy5yZW1vdmUobm9kZSk7XG4gICAgdHJlZUFkYXB0ZXIuaW5zZXJ0QmVmb3JlKGVsLnBhcmVudCwgbm9kZSwgZWwpO1xuICB9XG4gIGluc2VydEFsbEJlZm9yZShlbCwgbm9kZXMpIHsgbm9kZXMuZm9yRWFjaChuID0+IHRoaXMuaW5zZXJ0QmVmb3JlKGVsLCBuKSk7IH1cbiAgaW5zZXJ0QWZ0ZXIoZWwsIG5vZGUpIHtcbiAgICBpZiAoZWwubmV4dFNpYmxpbmcpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QmVmb3JlKGVsLm5leHRTaWJsaW5nLCBub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBlbmRDaGlsZChlbC5wYXJlbnQsIG5vZGUpO1xuICAgIH1cbiAgfVxuICBzZXRJbm5lckhUTUwoZWwsIHZhbHVlKSB7XG4gICAgdGhpcy5jbGVhck5vZGVzKGVsKTtcbiAgICB2YXIgY29udGVudCA9IHBhcnNlci5wYXJzZUZyYWdtZW50KHZhbHVlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRlbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQoZWwsIGNvbnRlbnQuY2hpbGROb2Rlc1tpXSk7XG4gICAgfVxuICB9XG4gIGdldFRleHQoZWwsIGlzUmVjdXJzaXZlPzogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShlbCkpIHtcbiAgICAgIHJldHVybiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0NvbW1lbnROb2RlKGVsKSkge1xuICAgICAgLy8gSW4gdGhlIERPTSwgY29tbWVudHMgd2l0aGluIGFuIGVsZW1lbnQgcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBmb3IgdGV4dENvbnRlbnRcbiAgICAgIC8vIEhvd2V2ZXIsIGNvbW1lbnQgbm9kZSBpbnN0YW5jZXMgcmV0dXJuIHRoZSBjb21tZW50IGNvbnRlbnQgZm9yIHRleHRDb250ZW50IGdldHRlclxuICAgICAgcmV0dXJuIGlzUmVjdXJzaXZlID8gJycgOiBlbC5kYXRhO1xuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhlbC5jaGlsZE5vZGVzKSB8fCBlbC5jaGlsZE5vZGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ZXh0Q29udGVudCArPSB0aGlzLmdldFRleHQoZWwuY2hpbGROb2Rlc1tpXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGV4dENvbnRlbnQ7XG4gICAgfVxuICB9XG4gIHNldFRleHQoZWwsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pc1RleHROb2RlKGVsKSB8fCB0aGlzLmlzQ29tbWVudE5vZGUoZWwpKSB7XG4gICAgICBlbC5kYXRhID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xlYXJOb2RlcyhlbCk7XG4gICAgICBpZiAodmFsdWUgIT09ICcnKSB0cmVlQWRhcHRlci5pbnNlcnRUZXh0KGVsLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGdldFZhbHVlKGVsKTogc3RyaW5nIHsgcmV0dXJuIGVsLnZhbHVlOyB9XG4gIHNldFZhbHVlKGVsLCB2YWx1ZTogc3RyaW5nKSB7IGVsLnZhbHVlID0gdmFsdWU7IH1cbiAgZ2V0Q2hlY2tlZChlbCk6IGJvb2xlYW4geyByZXR1cm4gZWwuY2hlY2tlZDsgfVxuICBzZXRDaGVja2VkKGVsLCB2YWx1ZTogYm9vbGVhbikgeyBlbC5jaGVja2VkID0gdmFsdWU7IH1cbiAgY3JlYXRlQ29tbWVudCh0ZXh0OiBzdHJpbmcpOiBDb21tZW50IHsgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUNvbW1lbnROb2RlKHRleHQpOyB9XG4gIGNyZWF0ZVRlbXBsYXRlKGh0bWwpOiBIVE1MRWxlbWVudCB7XG4gICAgdmFyIHRlbXBsYXRlID0gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICAgIHZhciBjb250ZW50ID0gcGFyc2VyLnBhcnNlRnJhZ21lbnQoaHRtbCk7XG4gICAgdHJlZUFkYXB0ZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUsIGNvbnRlbnQpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuICBjcmVhdGVFbGVtZW50KHRhZ05hbWUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBbXSk7XG4gIH1cbiAgY3JlYXRlRWxlbWVudE5TKG5zLCB0YWdOYW1lKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudCh0YWdOYW1lLCBucywgW10pOyB9XG4gIGNyZWF0ZVRleHROb2RlKHRleHQ6IHN0cmluZyk6IFRleHQge1xuICAgIHZhciB0ID0gPGFueT50aGlzLmNyZWF0ZUNvbW1lbnQodGV4dCk7XG4gICAgdC50eXBlID0gJ3RleHQnO1xuICAgIHJldHVybiB0O1xuICB9XG4gIGNyZWF0ZVNjcmlwdFRhZyhhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdHJlZUFkYXB0ZXIuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiLCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3tuYW1lOiBhdHRyTmFtZSwgdmFsdWU6IGF0dHJWYWx1ZX1dKTtcbiAgfVxuICBjcmVhdGVTdHlsZUVsZW1lbnQoY3NzOiBzdHJpbmcpOiBIVE1MU3R5bGVFbGVtZW50IHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdGhpcy5zZXRUZXh0KHN0eWxlLCBjc3MpO1xuICAgIHJldHVybiA8SFRNTFN0eWxlRWxlbWVudD5zdHlsZTtcbiAgfVxuICBjcmVhdGVTaGFkb3dSb290KGVsKTogSFRNTEVsZW1lbnQge1xuICAgIGVsLnNoYWRvd1Jvb3QgPSB0cmVlQWRhcHRlci5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZWwuc2hhZG93Um9vdC5wYXJlbnQgPSBlbDtcbiAgICByZXR1cm4gZWwuc2hhZG93Um9vdDtcbiAgfVxuICBnZXRTaGFkb3dSb290KGVsKTogRWxlbWVudCB7IHJldHVybiBlbC5zaGFkb3dSb290OyB9XG4gIGdldEhvc3QoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaG9zdDsgfVxuICBnZXREaXN0cmlidXRlZE5vZGVzKGVsOiBhbnkpOiBOb2RlW10geyB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ2dldERpc3RyaWJ1dGVkTm9kZXMnKTsgfVxuICBjbG9uZShub2RlOiBOb2RlKTogTm9kZSB7XG4gICAgdmFyIF9yZWN1cnNpdmUgPSAobm9kZSkgPT4ge1xuICAgICAgdmFyIG5vZGVDbG9uZSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5vZGUpKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gbm9kZSkge1xuICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobm9kZSwgcHJvcCk7XG4gICAgICAgIGlmIChkZXNjICYmICd2YWx1ZScgaW4gZGVzYyAmJiB0eXBlb2YgZGVzYy52YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBub2RlQ2xvbmVbcHJvcF0gPSBub2RlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlQ2xvbmUucGFyZW50ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5wcmV2ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5uZXh0ID0gbnVsbDtcbiAgICAgIG5vZGVDbG9uZS5jaGlsZHJlbiA9IG51bGw7XG5cbiAgICAgIG1hcFByb3BzLmZvckVhY2gobWFwTmFtZSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQobm9kZVttYXBOYW1lXSkpIHtcbiAgICAgICAgICBub2RlQ2xvbmVbbWFwTmFtZV0gPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG5vZGVbbWFwTmFtZV0pIHtcbiAgICAgICAgICAgIG5vZGVDbG9uZVttYXBOYW1lXVtwcm9wXSA9IG5vZGVbbWFwTmFtZV1bcHJvcF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHZhciBjTm9kZXMgPSBub2RlLmNoaWxkcmVuO1xuICAgICAgaWYgKGNOb2Rlcykge1xuICAgICAgICB2YXIgY05vZGVzQ2xvbmUgPSBuZXcgQXJyYXkoY05vZGVzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY05vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNOb2Rlc1tpXTtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlQ2xvbmUgPSBfcmVjdXJzaXZlKGNoaWxkTm9kZSk7XG4gICAgICAgICAgY05vZGVzQ2xvbmVbaV0gPSBjaGlsZE5vZGVDbG9uZTtcbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZUNsb25lLnByZXYgPSBjTm9kZXNDbG9uZVtpIC0gMV07XG4gICAgICAgICAgICBjTm9kZXNDbG9uZVtpIC0gMV0ubmV4dCA9IGNoaWxkTm9kZUNsb25lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaGlsZE5vZGVDbG9uZS5wYXJlbnQgPSBub2RlQ2xvbmU7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZUNsb25lLmNoaWxkcmVuID0gY05vZGVzQ2xvbmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZUNsb25lO1xuICAgIH07XG4gICAgcmV0dXJuIF9yZWN1cnNpdmUobm9kZSk7XG4gIH1cbiAgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnQsIFwiLlwiICsgbmFtZSk7XG4gIH1cbiAgZ2V0RWxlbWVudHNCeVRhZ05hbWUoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICB0aHJvdyBfbm90SW1wbGVtZW50ZWQoJ2dldEVsZW1lbnRzQnlUYWdOYW1lJyk7XG4gIH1cbiAgY2xhc3NMaXN0KGVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgdmFyIGNsYXNzQXR0clZhbHVlID0gbnVsbDtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW1lbnQuYXR0cmlicztcbiAgICBpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KFwiY2xhc3NcIikpIHtcbiAgICAgIGNsYXNzQXR0clZhbHVlID0gYXR0cmlidXRlc1tcImNsYXNzXCJdO1xuICAgIH1cbiAgICByZXR1cm4gY2xhc3NBdHRyVmFsdWUgPyBjbGFzc0F0dHJWYWx1ZS50cmltKCkuc3BsaXQoL1xccysvZykgOiBbXTtcbiAgfVxuICBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZykge1xuICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmNsYXNzTGlzdChlbGVtZW50KTtcbiAgICB2YXIgaW5kZXggPSBjbGFzc0xpc3QuaW5kZXhPZihjbGFzc05hbWUpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgY2xhc3NMaXN0LnB1c2goY2xhc3NOYW1lKTtcbiAgICAgIGVsZW1lbnQuYXR0cmlic1tcImNsYXNzXCJdID0gZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc0xpc3Quam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuY2xhc3NMaXN0KGVsZW1lbnQpO1xuICAgIHZhciBpbmRleCA9IGNsYXNzTGlzdC5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIGNsYXNzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZWxlbWVudC5hdHRyaWJzW1wiY2xhc3NcIl0gPSBlbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTGlzdC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH1cbiAgaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuY29udGFpbnModGhpcy5jbGFzc0xpc3QoZWxlbWVudCksIGNsYXNzTmFtZSk7XG4gIH1cbiAgaGFzU3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZyA9IG51bGwpOiBib29sZWFuIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSkgfHwgJyc7XG4gICAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9yZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCkge1xuICAgIHZhciBzdHlsZU1hcCA9IHt9O1xuICAgIHZhciBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJzO1xuICAgIGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoXCJzdHlsZVwiKSkge1xuICAgICAgdmFyIHN0eWxlQXR0clZhbHVlID0gYXR0cmlidXRlc1tcInN0eWxlXCJdO1xuICAgICAgdmFyIHN0eWxlTGlzdCA9IHN0eWxlQXR0clZhbHVlLnNwbGl0KC87Ky9nKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdHlsZUxpc3RbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBlbGVtcyA9IHN0eWxlTGlzdFtpXS5zcGxpdCgvOisvZyk7XG4gICAgICAgICAgc3R5bGVNYXBbZWxlbXNbMF0udHJpbSgpXSA9IGVsZW1zWzFdLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3R5bGVNYXA7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZU1hcCkge1xuICAgIHZhciBzdHlsZUF0dHJWYWx1ZSA9IFwiXCI7XG4gICAgZm9yICh2YXIga2V5IGluIHN0eWxlTWFwKSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBzdHlsZU1hcFtrZXldO1xuICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3R5bGVBdHRyVmFsdWUgKz0ga2V5ICsgXCI6XCIgKyBzdHlsZU1hcFtrZXldICsgXCI7XCI7XG4gICAgICB9XG4gICAgfVxuICAgIGVsZW1lbnQuYXR0cmlic1tcInN0eWxlXCJdID0gc3R5bGVBdHRyVmFsdWU7XG4gIH1cbiAgc2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZykge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICBzdHlsZU1hcFtzdHlsZU5hbWVdID0gc3R5bGVWYWx1ZTtcbiAgICB0aGlzLl93cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKTtcbiAgfVxuICByZW1vdmVTdHlsZShlbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZykgeyB0aGlzLnNldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSwgbnVsbCk7IH1cbiAgZ2V0U3R5bGUoZWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBzdHlsZU1hcCA9IHRoaXMuX3JlYWRTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVNYXAuaGFzT3duUHJvcGVydHkoc3R5bGVOYW1lKSA/IHN0eWxlTWFwW3N0eWxlTmFtZV0gOiBcIlwiO1xuICB9XG4gIHRhZ05hbWUoZWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnRhZ05hbWUgPT0gXCJzdHlsZVwiID8gXCJTVFlMRVwiIDogZWxlbWVudC50YWdOYW1lOyB9XG4gIGF0dHJpYnV0ZU1hcChlbGVtZW50KTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgdmFyIHJlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgdmFyIGVsQXR0cnMgPSB0cmVlQWRhcHRlci5nZXRBdHRyTGlzdChlbGVtZW50KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyaWIgPSBlbEF0dHJzW2ldO1xuICAgICAgcmVzLnNldChhdHRyaWIubmFtZSwgYXR0cmliLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBoYXNBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudC5hdHRyaWJzICYmIGVsZW1lbnQuYXR0cmlicy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpO1xuICB9XG4gIGhhc0F0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYXR0cmlicyAmJiBlbGVtZW50LmF0dHJpYnMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKSA/XG4gICAgICAgICAgICAgICBlbGVtZW50LmF0dHJpYnNbYXR0cmlidXRlXSA6XG4gICAgICAgICAgICAgICBudWxsO1xuICB9XG4gIGdldEF0dHJpYnV0ZU5TKGVsZW1lbnQsIG5zOiBzdHJpbmcsIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgZWxlbWVudC5hdHRyaWJzW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcbiAgICAgIGlmIChhdHRyaWJ1dGUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudCwgbnM6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgcmVtb3ZlQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUoZWxlbWVudC5hdHRyaWJzLCBhdHRyaWJ1dGUpO1xuICAgIH1cbiAgfVxuICByZW1vdmVBdHRyaWJ1dGVOUyhlbGVtZW50LCBuczogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgdGVtcGxhdGVBd2FyZVJvb3QoZWwpOiBhbnkgeyByZXR1cm4gdGhpcy5pc1RlbXBsYXRlRWxlbWVudChlbCkgPyB0aGlzLmNvbnRlbnQoZWwpIDogZWw7IH1cbiAgY3JlYXRlSHRtbERvY3VtZW50KCk6IERvY3VtZW50IHtcbiAgICB2YXIgbmV3RG9jID0gdHJlZUFkYXB0ZXIuY3JlYXRlRG9jdW1lbnQoKTtcbiAgICBuZXdEb2MudGl0bGUgPSBcImZha2UgdGl0bGVcIjtcbiAgICB2YXIgaGVhZCA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJoZWFkXCIsIG51bGwsIFtdKTtcbiAgICB2YXIgYm9keSA9IHRyZWVBZGFwdGVyLmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgW10pO1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobmV3RG9jLCBoZWFkKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKG5ld0RvYywgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcImhlYWRcIiwgaGVhZCk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcImJvZHlcIiwgYm9keSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQobmV3RG9jLCBcIl93aW5kb3dcIiwgU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKSk7XG4gICAgcmV0dXJuIG5ld0RvYztcbiAgfVxuICBkZWZhdWx0RG9jKCk6IERvY3VtZW50IHtcbiAgICBpZiAoZGVmRG9jID09PSBudWxsKSB7XG4gICAgICBkZWZEb2MgPSB0aGlzLmNyZWF0ZUh0bWxEb2N1bWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmRG9jO1xuICB9XG4gIGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbCk6IGFueSB7IHJldHVybiB7bGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwfTsgfVxuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5kZWZhdWx0RG9jKCkudGl0bGUgfHwgXCJcIjsgfVxuICBzZXRUaXRsZShuZXdUaXRsZTogc3RyaW5nKSB7IHRoaXMuZGVmYXVsdERvYygpLnRpdGxlID0gbmV3VGl0bGU7IH1cbiAgaXNUZW1wbGF0ZUVsZW1lbnQoZWw6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRWxlbWVudE5vZGUoZWwpICYmIHRoaXMudGFnTmFtZShlbCkgPT09IFwidGVtcGxhdGVcIjtcbiAgfVxuICBpc1RleHROb2RlKG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIHRyZWVBZGFwdGVyLmlzVGV4dE5vZGUobm9kZSk7IH1cbiAgaXNDb21tZW50Tm9kZShub2RlKTogYm9vbGVhbiB7IHJldHVybiB0cmVlQWRhcHRlci5pc0NvbW1lbnROb2RlKG5vZGUpOyB9XG4gIGlzRWxlbWVudE5vZGUobm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZSA/IHRyZWVBZGFwdGVyLmlzRWxlbWVudE5vZGUobm9kZSkgOiBmYWxzZTsgfVxuICBoYXNTaGFkb3dSb290KG5vZGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudChub2RlLnNoYWRvd1Jvb3QpOyB9XG4gIGlzU2hhZG93Um9vdChub2RlKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldFNoYWRvd1Jvb3Qobm9kZSkgPT0gbm9kZTsgfVxuICBpbXBvcnRJbnRvRG9jKG5vZGUpOiBhbnkgeyByZXR1cm4gdGhpcy5jbG9uZShub2RlKTsgfVxuICBhZG9wdE5vZGUobm9kZSk6IGFueSB7IHJldHVybiBub2RlOyB9XG4gIGdldEhyZWYoZWwpOiBzdHJpbmcgeyByZXR1cm4gZWwuaHJlZjsgfVxuICByZXNvbHZlQW5kU2V0SHJlZihlbCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICBlbC5ocmVmID0gYmFzZVVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuaHJlZiA9IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICAgIH1cbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIF9idWlsZFJ1bGVzKHBhcnNlZFJ1bGVzLCBjc3M/KSB7XG4gICAgdmFyIHJ1bGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJzZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhcnNlZFJ1bGUgPSBwYXJzZWRSdWxlc1tpXTtcbiAgICAgIHZhciBydWxlOiB7W2tleTogc3RyaW5nXTogYW55fSA9IFN0cmluZ01hcFdyYXBwZXIuY3JlYXRlKCk7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcImNzc1RleHRcIiwgY3NzKTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHJ1bGUsIFwic3R5bGVcIiwge2NvbnRlbnQ6IFwiXCIsIGNzc1RleHQ6IFwiXCJ9KTtcbiAgICAgIGlmIChwYXJzZWRSdWxlLnR5cGUgPT0gXCJydWxlXCIpIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJ0eXBlXCIsIDEpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcInNlbGVjdG9yVGV4dFwiLCBwYXJzZWRSdWxlLnNlbGVjdG9ycy5qb2luKFwiLCBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBcIiBcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKn5cXHMqL2csIFwiIH4gXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccypcXCtcXHMqL2csIFwiICsgXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyo+XFxzKi9nLCBcIiA+IFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFsoXFx3Kyk9KFxcdyspXFxdL2csICdbJDE9XCIkMlwiXScpKTtcbiAgICAgICAgaWYgKGlzQmxhbmsocGFyc2VkUnVsZS5kZWNsYXJhdGlvbnMpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJzZWRSdWxlLmRlY2xhcmF0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHZhciBkZWNsYXJhdGlvbiA9IHBhcnNlZFJ1bGUuZGVjbGFyYXRpb25zW2pdO1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KFN0cmluZ01hcFdyYXBwZXIuZ2V0KHJ1bGUsIFwic3R5bGVcIiksIGRlY2xhcmF0aW9uLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uLnZhbHVlKTtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmdldChydWxlLCBcInN0eWxlXCIpLmNzc1RleHQgKz1cbiAgICAgICAgICAgICAgZGVjbGFyYXRpb24ucHJvcGVydHkgKyBcIjogXCIgKyBkZWNsYXJhdGlvbi52YWx1ZSArIFwiO1wiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlZFJ1bGUudHlwZSA9PSBcIm1lZGlhXCIpIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQocnVsZSwgXCJ0eXBlXCIsIDQpO1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcIm1lZGlhXCIsIHttZWRpYVRleHQ6IHBhcnNlZFJ1bGUubWVkaWF9KTtcbiAgICAgICAgaWYgKHBhcnNlZFJ1bGUucnVsZXMpIHtcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldChydWxlLCBcImNzc1J1bGVzXCIsIHRoaXMuX2J1aWxkUnVsZXMocGFyc2VkUnVsZS5ydWxlcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gcnVsZXM7XG4gIH1cbiAgc3VwcG9ydHNET01FdmVudHMoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBzdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGdldEdsb2JhbEV2ZW50VGFyZ2V0KHRhcmdldDogc3RyaW5nKTogYW55IHtcbiAgICBpZiAodGFyZ2V0ID09IFwid2luZG93XCIpIHtcbiAgICAgIHJldHVybiAoPGFueT50aGlzLmRlZmF1bHREb2MoKSkuX3dpbmRvdztcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImRvY3VtZW50XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHREb2MoKTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImJvZHlcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdERvYygpLmJvZHk7XG4gICAgfVxuICB9XG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIHJlc2V0QmFzZUVsZW1lbnQoKTogdm9pZCB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldEhpc3RvcnkoKTogSGlzdG9yeSB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG4gIGdldExvY2F0aW9uKCk6IExvY2F0aW9uIHsgdGhyb3cgJ25vdCBpbXBsZW1lbnRlZCc7IH1cbiAgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7IHJldHVybiBcIkZha2UgdXNlciBhZ2VudFwiOyB9XG4gIGdldERhdGEoZWwsIG5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShlbCwgJ2RhdGEtJyArIG5hbWUpOyB9XG4gIGdldENvbXB1dGVkU3R5bGUoZWwpOiBhbnkgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxuICBzZXREYXRhKGVsLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHsgdGhpcy5zZXRBdHRyaWJ1dGUoZWwsICdkYXRhLScgKyBuYW1lLCB2YWx1ZSk7IH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBzZXRHbG9iYWxWYXIocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KSB7IHNldFZhbHVlT25QYXRoKGdsb2JhbCwgcGF0aCwgdmFsdWUpOyB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk6IG51bWJlciB7IHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTsgfVxuICBjYW5jZWxBbmltYXRpb25GcmFtZShpZDogbnVtYmVyKSB7IGNsZWFyVGltZW91dChpZCk7IH1cbiAgcGVyZm9ybWFuY2VOb3coKTogbnVtYmVyIHsgcmV0dXJuIERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKTsgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuICd0cmFuc2l0aW9uZW5kJzsgfVxuICBzdXBwb3J0c0FuaW1hdGlvbigpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICByZXBsYWNlQ2hpbGQoZWwsIG5ld05vZGUsIG9sZE5vZGUpIHsgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTsgfVxuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIGludm9rZShlbDogRWxlbWVudCwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IGFueSB7IHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7IH1cbiAgZ2V0RXZlbnRLZXkoZXZlbnQpOiBzdHJpbmcgeyB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpOyB9XG59XG5cbi8vIFRPRE86IGJ1aWxkIGEgcHJvcGVyIGxpc3QsIHRoaXMgb25lIGlzIGFsbCB0aGUga2V5cyBvZiBhIEhUTUxJbnB1dEVsZW1lbnRcbnZhciBfSFRNTEVsZW1lbnRQcm9wZXJ0eUxpc3QgPSBbXG4gIFwid2Via2l0RW50cmllc1wiLFxuICBcImluY3JlbWVudGFsXCIsXG4gIFwid2Via2l0ZGlyZWN0b3J5XCIsXG4gIFwic2VsZWN0aW9uRGlyZWN0aW9uXCIsXG4gIFwic2VsZWN0aW9uRW5kXCIsXG4gIFwic2VsZWN0aW9uU3RhcnRcIixcbiAgXCJsYWJlbHNcIixcbiAgXCJ2YWxpZGF0aW9uTWVzc2FnZVwiLFxuICBcInZhbGlkaXR5XCIsXG4gIFwid2lsbFZhbGlkYXRlXCIsXG4gIFwid2lkdGhcIixcbiAgXCJ2YWx1ZUFzTnVtYmVyXCIsXG4gIFwidmFsdWVBc0RhdGVcIixcbiAgXCJ2YWx1ZVwiLFxuICBcInVzZU1hcFwiLFxuICBcImRlZmF1bHRWYWx1ZVwiLFxuICBcInR5cGVcIixcbiAgXCJzdGVwXCIsXG4gIFwic3JjXCIsXG4gIFwic2l6ZVwiLFxuICBcInJlcXVpcmVkXCIsXG4gIFwicmVhZE9ubHlcIixcbiAgXCJwbGFjZWhvbGRlclwiLFxuICBcInBhdHRlcm5cIixcbiAgXCJuYW1lXCIsXG4gIFwibXVsdGlwbGVcIixcbiAgXCJtaW5cIixcbiAgXCJtaW5MZW5ndGhcIixcbiAgXCJtYXhMZW5ndGhcIixcbiAgXCJtYXhcIixcbiAgXCJsaXN0XCIsXG4gIFwiaW5kZXRlcm1pbmF0ZVwiLFxuICBcImhlaWdodFwiLFxuICBcImZvcm1UYXJnZXRcIixcbiAgXCJmb3JtTm9WYWxpZGF0ZVwiLFxuICBcImZvcm1NZXRob2RcIixcbiAgXCJmb3JtRW5jdHlwZVwiLFxuICBcImZvcm1BY3Rpb25cIixcbiAgXCJmaWxlc1wiLFxuICBcImZvcm1cIixcbiAgXCJkaXNhYmxlZFwiLFxuICBcImRpck5hbWVcIixcbiAgXCJjaGVja2VkXCIsXG4gIFwiZGVmYXVsdENoZWNrZWRcIixcbiAgXCJhdXRvZm9jdXNcIixcbiAgXCJhdXRvY29tcGxldGVcIixcbiAgXCJhbHRcIixcbiAgXCJhbGlnblwiLFxuICBcImFjY2VwdFwiLFxuICBcIm9uYXV0b2NvbXBsZXRlZXJyb3JcIixcbiAgXCJvbmF1dG9jb21wbGV0ZVwiLFxuICBcIm9ud2FpdGluZ1wiLFxuICBcIm9udm9sdW1lY2hhbmdlXCIsXG4gIFwib250b2dnbGVcIixcbiAgXCJvbnRpbWV1cGRhdGVcIixcbiAgXCJvbnN1c3BlbmRcIixcbiAgXCJvbnN1Ym1pdFwiLFxuICBcIm9uc3RhbGxlZFwiLFxuICBcIm9uc2hvd1wiLFxuICBcIm9uc2VsZWN0XCIsXG4gIFwib25zZWVraW5nXCIsXG4gIFwib25zZWVrZWRcIixcbiAgXCJvbnNjcm9sbFwiLFxuICBcIm9ucmVzaXplXCIsXG4gIFwib25yZXNldFwiLFxuICBcIm9ucmF0ZWNoYW5nZVwiLFxuICBcIm9ucHJvZ3Jlc3NcIixcbiAgXCJvbnBsYXlpbmdcIixcbiAgXCJvbnBsYXlcIixcbiAgXCJvbnBhdXNlXCIsXG4gIFwib25tb3VzZXdoZWVsXCIsXG4gIFwib25tb3VzZXVwXCIsXG4gIFwib25tb3VzZW92ZXJcIixcbiAgXCJvbm1vdXNlb3V0XCIsXG4gIFwib25tb3VzZW1vdmVcIixcbiAgXCJvbm1vdXNlbGVhdmVcIixcbiAgXCJvbm1vdXNlZW50ZXJcIixcbiAgXCJvbm1vdXNlZG93blwiLFxuICBcIm9ubG9hZHN0YXJ0XCIsXG4gIFwib25sb2FkZWRtZXRhZGF0YVwiLFxuICBcIm9ubG9hZGVkZGF0YVwiLFxuICBcIm9ubG9hZFwiLFxuICBcIm9ua2V5dXBcIixcbiAgXCJvbmtleXByZXNzXCIsXG4gIFwib25rZXlkb3duXCIsXG4gIFwib25pbnZhbGlkXCIsXG4gIFwib25pbnB1dFwiLFxuICBcIm9uZm9jdXNcIixcbiAgXCJvbmVycm9yXCIsXG4gIFwib25lbmRlZFwiLFxuICBcIm9uZW1wdGllZFwiLFxuICBcIm9uZHVyYXRpb25jaGFuZ2VcIixcbiAgXCJvbmRyb3BcIixcbiAgXCJvbmRyYWdzdGFydFwiLFxuICBcIm9uZHJhZ292ZXJcIixcbiAgXCJvbmRyYWdsZWF2ZVwiLFxuICBcIm9uZHJhZ2VudGVyXCIsXG4gIFwib25kcmFnZW5kXCIsXG4gIFwib25kcmFnXCIsXG4gIFwib25kYmxjbGlja1wiLFxuICBcIm9uY3VlY2hhbmdlXCIsXG4gIFwib25jb250ZXh0bWVudVwiLFxuICBcIm9uY2xvc2VcIixcbiAgXCJvbmNsaWNrXCIsXG4gIFwib25jaGFuZ2VcIixcbiAgXCJvbmNhbnBsYXl0aHJvdWdoXCIsXG4gIFwib25jYW5wbGF5XCIsXG4gIFwib25jYW5jZWxcIixcbiAgXCJvbmJsdXJcIixcbiAgXCJvbmFib3J0XCIsXG4gIFwic3BlbGxjaGVja1wiLFxuICBcImlzQ29udGVudEVkaXRhYmxlXCIsXG4gIFwiY29udGVudEVkaXRhYmxlXCIsXG4gIFwib3V0ZXJUZXh0XCIsXG4gIFwiaW5uZXJUZXh0XCIsXG4gIFwiYWNjZXNzS2V5XCIsXG4gIFwiaGlkZGVuXCIsXG4gIFwid2Via2l0ZHJvcHpvbmVcIixcbiAgXCJkcmFnZ2FibGVcIixcbiAgXCJ0YWJJbmRleFwiLFxuICBcImRpclwiLFxuICBcInRyYW5zbGF0ZVwiLFxuICBcImxhbmdcIixcbiAgXCJ0aXRsZVwiLFxuICBcImNoaWxkRWxlbWVudENvdW50XCIsXG4gIFwibGFzdEVsZW1lbnRDaGlsZFwiLFxuICBcImZpcnN0RWxlbWVudENoaWxkXCIsXG4gIFwiY2hpbGRyZW5cIixcbiAgXCJvbndlYmtpdGZ1bGxzY3JlZW5lcnJvclwiLFxuICBcIm9ud2Via2l0ZnVsbHNjcmVlbmNoYW5nZVwiLFxuICBcIm5leHRFbGVtZW50U2libGluZ1wiLFxuICBcInByZXZpb3VzRWxlbWVudFNpYmxpbmdcIixcbiAgXCJvbndoZWVsXCIsXG4gIFwib25zZWxlY3RzdGFydFwiLFxuICBcIm9uc2VhcmNoXCIsXG4gIFwib25wYXN0ZVwiLFxuICBcIm9uY3V0XCIsXG4gIFwib25jb3B5XCIsXG4gIFwib25iZWZvcmVwYXN0ZVwiLFxuICBcIm9uYmVmb3JlY3V0XCIsXG4gIFwib25iZWZvcmVjb3B5XCIsXG4gIFwic2hhZG93Um9vdFwiLFxuICBcImRhdGFzZXRcIixcbiAgXCJjbGFzc0xpc3RcIixcbiAgXCJjbGFzc05hbWVcIixcbiAgXCJvdXRlckhUTUxcIixcbiAgXCJpbm5lckhUTUxcIixcbiAgXCJzY3JvbGxIZWlnaHRcIixcbiAgXCJzY3JvbGxXaWR0aFwiLFxuICBcInNjcm9sbFRvcFwiLFxuICBcInNjcm9sbExlZnRcIixcbiAgXCJjbGllbnRIZWlnaHRcIixcbiAgXCJjbGllbnRXaWR0aFwiLFxuICBcImNsaWVudFRvcFwiLFxuICBcImNsaWVudExlZnRcIixcbiAgXCJvZmZzZXRQYXJlbnRcIixcbiAgXCJvZmZzZXRIZWlnaHRcIixcbiAgXCJvZmZzZXRXaWR0aFwiLFxuICBcIm9mZnNldFRvcFwiLFxuICBcIm9mZnNldExlZnRcIixcbiAgXCJsb2NhbE5hbWVcIixcbiAgXCJwcmVmaXhcIixcbiAgXCJuYW1lc3BhY2VVUklcIixcbiAgXCJpZFwiLFxuICBcInN0eWxlXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcInRhZ05hbWVcIixcbiAgXCJwYXJlbnRFbGVtZW50XCIsXG4gIFwidGV4dENvbnRlbnRcIixcbiAgXCJiYXNlVVJJXCIsXG4gIFwib3duZXJEb2N1bWVudFwiLFxuICBcIm5leHRTaWJsaW5nXCIsXG4gIFwicHJldmlvdXNTaWJsaW5nXCIsXG4gIFwibGFzdENoaWxkXCIsXG4gIFwiZmlyc3RDaGlsZFwiLFxuICBcImNoaWxkTm9kZXNcIixcbiAgXCJwYXJlbnROb2RlXCIsXG4gIFwibm9kZVR5cGVcIixcbiAgXCJub2RlVmFsdWVcIixcbiAgXCJub2RlTmFtZVwiLFxuICBcImNsb3N1cmVfbG1fNzE0NjE3XCIsXG4gIFwiX19qc2FjdGlvblwiXG5dO1xuIl19