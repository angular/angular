/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone, ɵglobal as global} from '@angular/core';
import {ɵgetDOM as getDOM} from '@angular/platform-browser';

export let browserDetection: BrowserDetection;

export class BrowserDetection {
  private _overrideUa: string|null;
  private get _ua(): string {
    if (typeof this._overrideUa === 'string') {
      return this._overrideUa;
    }

    return getDOM() ? getDOM().getUserAgent() : '';
  }

  static setup() { browserDetection = new BrowserDetection(null); }

  constructor(ua: string|null) { this._overrideUa = ua; }

  get isFirefox(): boolean { return this._ua.indexOf('Firefox') > -1; }

  get isAndroid(): boolean {
    return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 &&
        this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1 &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isEdge(): boolean { return this._ua.indexOf('Edge') > -1; }

  get isIE(): boolean { return this._ua.indexOf('Trident') > -1; }

  get isWebkit(): boolean {
    return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1 &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isIOS7(): boolean {
    return (this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1) &&
        this._ua.indexOf('IEMobile') == -1;
  }

  get isSlow(): boolean { return this.isAndroid || this.isIE || this.isIOS7; }

  // The Intl API is only natively supported in Chrome, Firefox, IE11 and Edge.
  // This detector is needed in tests to make the difference between:
  // 1) IE11/Edge: they have a native Intl API, but with some discrepancies
  // 2) IE9/IE10: they use the polyfill, and so no discrepancies
  get supportsNativeIntlApi(): boolean {
    return !!(<any>global).Intl && (<any>global).Intl !== (<any>global).IntlPolyfill;
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

  get supportsCustomElements() { return (typeof(<any>global).customElements !== 'undefined'); }

  get supportsDeprecatedCustomCustomElementsV0() {
    return (typeof(document as any).registerElement !== 'undefined');
  }

  get supportsShadowDom() {
    const testEl = document.createElement('div');
    return (typeof testEl.attachShadow !== 'undefined');
  }

  get supportsDeprecatedShadowDomV0() {
    const testEl = document.createElement('div') as any;
    return (typeof testEl.createShadowRoot !== 'undefined');
  }
}

BrowserDetection.setup();

export function dispatchEvent(element: any, eventType: any): void {
  getDOM().dispatchEvent(element, getDOM().createEvent(eventType));
}

export function el(html: string): HTMLElement {
  return <HTMLElement>getDOM().firstChild(getDOM().content(getDOM().createTemplate(html)));
}

export function normalizeCSS(css: string): string {
  return css.replace(/\s+/g, ' ')
      .replace(/:\s/g, ':')
      .replace(/'/g, '"')
      .replace(/ }/g, '}')
      .replace(/url\((\"|\s)(.+)(\"|\s)\)(\s*)/g, (...match: string[]) => `url("${match[2]}")`)
      .replace(/\[(.+)=([^"\]]+)\]/g, (...match: string[]) => `[${match[1]}="${match[2]}"]`);
}

const _singleTagWhitelist = ['br', 'hr', 'input'];
export function stringifyElement(el: any /** TODO #9100 */): string {
  let result = '';
  if (getDOM().isElementNode(el)) {
    const tagName = getDOM().tagName(el).toLowerCase();

    // Opening tag
    result += `<${tagName}`;

    // Attributes in an ordered way
    const attributeMap = getDOM().attributeMap(el);
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
    const childrenRoot = getDOM().templateAwareRoot(el);
    const children = childrenRoot ? getDOM().childNodes(childrenRoot) : [];
    for (let j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }

    // Closing tag
    if (_singleTagWhitelist.indexOf(tagName) == -1) {
      result += `</${tagName}>`;
    }
  } else if (getDOM().isCommentNode(el)) {
    result += `<!--${getDOM().nodeValue(el)}-->`;
  } else {
    result += getDOM().getText(el);
  }

  return result;
}

export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true});
}
