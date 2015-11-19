import { ListWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/core/dom/dom_adapter';
import { isPresent, isString, RegExpWrapper, StringWrapper } from 'angular2/src/facade/lang';
export class Log {
    constructor() {
        this._result = [];
    }
    add(value) { this._result.push(value); }
    fn(value) {
        return (a1 = null, a2 = null, a3 = null, a4 = null, a5 = null) => { this._result.push(value); };
    }
    clear() { this._result = []; }
    result() { return this._result.join("; "); }
}
export class BrowserDetection {
    constructor(ua) {
        if (isPresent(ua)) {
            this._ua = ua;
        }
        else {
            this._ua = isPresent(DOM) ? DOM.getUserAgent() : '';
        }
    }
    get isFirefox() { return this._ua.indexOf('Firefox') > -1; }
    get isAndroid() {
        return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 &&
            this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1;
    }
    get isEdge() { return this._ua.indexOf('Edge') > -1; }
    get isIE() { return this._ua.indexOf('Trident') > -1; }
    get isWebkit() {
        return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1;
    }
    get isIOS7() {
        return this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1;
    }
    get isSlow() { return this.isAndroid || this.isIE || this.isIOS7; }
    // The Intl API is only properly supported in recent Chrome and Opera.
    // Note: Edge is disguised as Chrome 42, so checking the "Edge" part is needed,
    // see https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    get supportsIntlApi() {
        return this._ua.indexOf('Chrome/4') > -1 && this._ua.indexOf('Edge') == -1;
    }
}
export var browserDetection = new BrowserDetection(null);
export function dispatchEvent(element, eventType) {
    DOM.dispatchEvent(element, DOM.createEvent(eventType));
}
export function el(html) {
    return DOM.firstChild(DOM.content(DOM.createTemplate(html)));
}
var _RE_SPECIAL_CHARS = ['-', '[', ']', '/', '{', '}', '\\', '(', ')', '*', '+', '?', '.', '^', '$', '|'];
var _ESCAPE_RE = RegExpWrapper.create(`[\\${_RE_SPECIAL_CHARS.join('\\')}]`);
export function containsRegexp(input) {
    return RegExpWrapper.create(StringWrapper.replaceAllMapped(input, _ESCAPE_RE, (match) => `\\${match[0]}`));
}
export function normalizeCSS(css) {
    css = StringWrapper.replaceAll(css, /\s+/g, ' ');
    css = StringWrapper.replaceAll(css, /:\s/g, ':');
    css = StringWrapper.replaceAll(css, /'/g, '"');
    css = StringWrapper.replaceAll(css, / }/g, '}');
    css = StringWrapper.replaceAllMapped(css, /url\((\"|\s)(.+)(\"|\s)\)(\s*)/g, (match) => `url("${match[2]}")`);
    css = StringWrapper.replaceAllMapped(css, /\[(.+)=([^"\]]+)\]/g, (match) => `[${match[1]}="${match[2]}"]`);
    return css;
}
var _singleTagWhitelist = ['br', 'hr', 'input'];
export function stringifyElement(el) {
    var result = '';
    if (DOM.isElementNode(el)) {
        var tagName = DOM.tagName(el).toLowerCase();
        // Opening tag
        result += `<${tagName}`;
        // Attributes in an ordered way
        var attributeMap = DOM.attributeMap(el);
        var keys = [];
        attributeMap.forEach((v, k) => keys.push(k));
        ListWrapper.sort(keys);
        for (let i = 0; i < keys.length; i++) {
            var key = keys[i];
            var attValue = attributeMap.get(key);
            if (!isString(attValue)) {
                result += ` ${key}`;
            }
            else {
                result += ` ${key}="${attValue}"`;
            }
        }
        result += '>';
        // Children
        var childrenRoot = DOM.templateAwareRoot(el);
        var children = isPresent(childrenRoot) ? DOM.childNodes(childrenRoot) : [];
        for (let j = 0; j < children.length; j++) {
            result += stringifyElement(children[j]);
        }
        // Closing tag
        if (!ListWrapper.contains(_singleTagWhitelist, tagName)) {
            result += `</${tagName}>`;
        }
    }
    else if (DOM.isCommentNode(el)) {
        result += `<!--${DOM.nodeValue(el)}-->`;
    }
    else {
        result += DOM.getText(el);
    }
    return result;
}
//# sourceMappingURL=utils.js.map