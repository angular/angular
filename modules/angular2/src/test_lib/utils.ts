import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, isString, RegExpWrapper, StringWrapper, RegExp} from 'angular2/src/facade/lang';

export class Log {
  _result: List<any>;

  constructor() { this._result = []; }

  add(value): void { this._result.push(value); }

  fn(value) {
    return (a1 = null, a2 = null, a3 = null, a4 = null, a5 = null) => { this._result.push(value); }
  }

  result(): string { return ListWrapper.join(this._result, "; "); }
}

export function dispatchEvent(element, eventType) {
  DOM.dispatchEvent(element, DOM.createEvent(eventType));
}

export function el(html: string): HTMLElement {
  return <HTMLElement>DOM.firstChild(DOM.content(DOM.createTemplate(html)));
}

var _RE_SPECIAL_CHARS =
    ['-', '[', ']', '/', '{', '}', '\\', '(', ')', '*', '+', '?', '.', '^', '$', '|'];
var _ESCAPE_RE = RegExpWrapper.create(`[\\${_RE_SPECIAL_CHARS.join('\\')}]`);
export function containsRegexp(input: string): RegExp {
  return RegExpWrapper.create(
      StringWrapper.replaceAllMapped(input, _ESCAPE_RE, (match) => `\\${match[0]}`));
}

export function normalizeCSS(css: string): string {
  css = StringWrapper.replaceAll(css, /\s+/g, ' ');
  css = StringWrapper.replaceAll(css, /:\s/g, ':');
  css = StringWrapper.replaceAll(css, /'/g, '"');
  css = StringWrapper.replaceAllMapped(css, /url\(\"(.+)\\"\)/g, (match) => `url(${match[1]})`);
  css = StringWrapper.replaceAllMapped(css, /\[(.+)=([^"\]]+)\]/g,
                                       (match) => `[${match[1]}="${match[2]}"]`);
  return css;
}

var _singleTagWhitelist = ['br', 'hr', 'input'];
export function stringifyElement(el): string {
  var result = '';
  if (DOM.isElementNode(el)) {
    var tagName = StringWrapper.toLowerCase(DOM.tagName(el));

    // Opening tag
    result += `<${tagName}`;

    // Attributes in an ordered way
    var attributeMap = DOM.attributeMap(el);
    var keys = [];
    MapWrapper.forEach(attributeMap, (v, k) => { keys.push(k); });
    ListWrapper.sort(keys);
    for (let i = 0; i < keys.length; i++) {
      var key = keys[i];
      var attValue = attributeMap.get(key);
      if (!isString(attValue)) {
        result += ` ${key}`;
      } else {
        result += ` ${key}="${attValue}"`;
      }
    }
    result += '>';

    // Children
    var children = DOM.childNodes(DOM.templateAwareRoot(el));
    for (let j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }

    // Closing tag
    if (!ListWrapper.contains(_singleTagWhitelist, tagName)) {
      result += `</${tagName}>`;
    }
  } else if (DOM.isCommentNode(el)) {
    result += `<!--${DOM.nodeValue(el)}-->`;
  } else {
    result += DOM.getText(el);
  }

  return result;
}

// The Intl API is only properly supported in Chrome and Opera.
// Note: Edge is disguised as Chrome 42, so checking the "Edge" part is needed,
// see https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
export function supportsIntlApi(): boolean {
  return DOM.getUserAgent().indexOf('Chrome') > -1 && DOM.getUserAgent().indexOf('Edge') == -1;
}

// TODO(mlaval): extract all browser detection checks from all tests
export function isFirefox(): boolean {
  return DOM.getUserAgent().indexOf("Firefox") > -1;
}
