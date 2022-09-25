/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {NgZone, ɵglobal as global} from '@angular/core';

export class BrowserDetection {
  private _overrideUa: string|null;
  private get _ua(): string {
    if (typeof this._overrideUa === 'string') {
      return this._overrideUa;
    }

    return getDOM() ? getDOM().getUserAgent() : '';
  }

  static setup() {
    return new BrowserDetection(null);
  }

  constructor(ua: string|null) {
    this._overrideUa = ua;
  }

  get isFirefox(): boolean {
    return this._ua.indexOf('Firefox') > -1;
  }

  get isAndroid(): boolean {
    return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 &&
        this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1 &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isEdge(): boolean {
    return this._ua.indexOf('Edge') > -1;
  }

  get isWebkit(): boolean {
    return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1 &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isIOS7(): boolean {
    return (this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1) &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isSlow(): boolean {
    return this.isAndroid || this.isIOS7;
  }

  get isChromeDesktop(): boolean {
    return this._ua.indexOf('Chrome') > -1 && this._ua.indexOf('Mobile Safari') == -1 &&
        this._ua.indexOf('Edge') == -1;
  }

  // "Old Chrome" means Chrome 3X, where there are some discrepancies in the Intl API.
  // Android 4.4 and 5.X have such browsers by default (respectively 30 and 39).
  get isOldChrome(): boolean {
    return this._ua.indexOf('Chrome') > -1 && this._ua.indexOf('Chrome/3') > -1 &&
        this._ua.indexOf('Edge') == -1;
  }

  get supportsShadowDom() {
    const testEl = document.createElement('div');
    return (typeof testEl.attachShadow !== 'undefined');
  }
}

export const browserDetection: BrowserDetection = BrowserDetection.setup();

export function dispatchEvent(element: any, eventType: any): Event {
  const evt: Event = getDOM().getDefaultDocument().createEvent('Event');
  evt.initEvent(eventType, true, true);
  getDOM().dispatchEvent(element, evt);
  return evt;
}

export function createMouseEvent(eventType: string): MouseEvent {
  const evt: MouseEvent = getDOM().getDefaultDocument().createEvent('MouseEvent');
  evt.initEvent(eventType, true, true);
  return evt;
}

export function el(html: string): HTMLElement {
  return <HTMLElement>getContent(createTemplate(html)).firstChild;
}

function getAttributeMap(element: any): Map<string, string> {
  const res = new Map<string, string>();
  const elAttrs = element.attributes;
  for (let i = 0; i < elAttrs.length; i++) {
    const attrib = elAttrs.item(i);
    res.set(attrib.name, attrib.value);
  }
  return res;
}

const _selfClosingTags = ['br', 'hr', 'input'];
export function stringifyElement(el: any /** TODO #9100 */): string {
  let result = '';
  if (getDOM().isElementNode(el)) {
    const tagName = el.tagName.toLowerCase();

    // Opening tag
    result += `<${tagName}`;

    // Attributes in an ordered way
    const attributeMap = getAttributeMap(el);
    const sortedKeys = Array.from(attributeMap.keys()).sort();
    for (const key of sortedKeys) {
      const lowerCaseKey = key.toLowerCase();
      let attValue = attributeMap.get(key);

      if (typeof attValue !== 'string') {
        result += ` ${lowerCaseKey}`;
      } else {
        // Browsers order style rules differently. Order them alphabetically for consistency.
        if (lowerCaseKey === 'style') {
          attValue = attValue.split(/; ?/).filter(s => !!s).sort().map(s => `${s};`).join(' ');
        }

        result += ` ${lowerCaseKey}="${attValue}"`;
      }
    }
    result += '>';

    // Children
    const childrenRoot = templateAwareRoot(el);
    const children = childrenRoot ? childrenRoot.childNodes : [];
    for (let j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }

    // Closing tag
    if (_selfClosingTags.indexOf(tagName) == -1) {
      result += `</${tagName}>`;
    }
  } else if (isCommentNode(el)) {
    result += `<!--${el.nodeValue}-->`;
  } else {
    result += el.textContent;
  }

  return result;
}

export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true, shouldCoalesceEventChangeDetection: false});
}

export function isCommentNode(node: Node): boolean {
  return node.nodeType === Node.COMMENT_NODE;
}

export function isTextNode(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE;
}

export function getContent(node: Node): Node {
  if ('content' in node) {
    return (<any>node).content;
  } else {
    return node;
  }
}

export function templateAwareRoot(el: Node): any {
  return getDOM().isElementNode(el) && el.nodeName === 'TEMPLATE' ? getContent(el) : el;
}

export function setCookie(name: string, value: string) {
  // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
  // not clear other cookies.
  document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
}

export function hasStyle(element: any, styleName: string, styleValue?: string|null): boolean {
  const value = element.style[styleName] || '';
  return styleValue ? value == styleValue : value.length > 0;
}

export function hasClass(element: any, className: string): boolean {
  return element.classList.contains(className);
}

export function sortedClassList(element: any): any[] {
  return Array.prototype.slice.call(element.classList, 0).sort();
}

export function createTemplate(html: any): HTMLElement {
  const t = getDOM().getDefaultDocument().createElement('template');
  t.innerHTML = html;
  return t;
}

export function childNodesAsList(el: Node): any[] {
  const childNodes = el.childNodes;
  const res = [];
  for (let i = 0; i < childNodes.length; i++) {
    res[i] = childNodes[i];
  }
  return res;
}
