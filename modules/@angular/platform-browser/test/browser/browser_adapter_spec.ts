/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/testing_internal';
import {DomAdapter, getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';
import {parseCookieValue} from '../../src/browser/browser_adapter';

export function main() {
  describe('cookies', () => {
    it('parses cookies', () => {
      let cookie = 'other-cookie=false; xsrf-token=token-value; is_awesome=true; ffo=true;';
      expect(parseCookieValue(cookie, 'xsrf-token')).toBe('token-value');
    });
    it('handles encoded keys', () => {
      expect(parseCookieValue('whitespace%20token=token-value', 'whitespace token'))
          .toBe('token-value');
    });
    it('handles encoded values', () => {
      expect(parseCookieValue('token=whitespace%20', 'token')).toBe('whitespace ');
      expect(parseCookieValue('token=whitespace%0A', 'token')).toBe('whitespace\n');
    });
    it('sets cookie values', () => {
      getDOM().setCookie('my test cookie', 'my test value');
      getDOM().setCookie('my other cookie', 'my test value 2');
      expect(getDOM().getCookie('my test cookie')).toBe('my test value');
    });
  });

  describe('BrowserDomAdapter', () => {
    let dom: DomAdapter;
    let elem: HTMLElement;
    beforeEach(() => {
      dom = getDOM();
      elem = dom.createElement('div');
    });

    describe('setStyle', () => {
      describe('normal', () => {

        it('should add element style and not override other styles', () => {
          elem.style['display'] = 'inline';
          dom.setStyle(elem, 'color', 'red');
          expect(elem.style.cssText).toContain('display: inline;');
          expect(elem.style.cssText).toContain('color: red;');
        });

        it('should add element style', () => {
          dom.setStyle(elem, 'color', 'red');
          expect(elem.style.cssText).toEqual('color: red;');
        });

        it('should convert camelCase to dash-case style name', () => {
          dom.setStyle(elem, 'backgroundColor', 'red');
          expect(elem.style.cssText).toEqual('background-color: red;');
        });

        it('should properly handle camelCase vendor prefixes', () => {
          dom.setStyle(elem, 'webkitTransform', 'scale(1)');
          dom.setStyle(elem, 'MozTransform', 'scale(1)');
          dom.setStyle(elem, 'msTransform', 'scale(1)');
          dom.setStyle(elem, 'oTransform', 'scale(1)');
          expect(elem.style.cssText).toMatch(/transform: scale\(1\);/);
        });

        it('should override style with the same name', () => {
          elem.style['color'] = 'green';
          dom.setStyle(elem, 'color', 'red');
          expect(elem.style.cssText).toEqual('color: red;');
        });

      });

      describe('!important', () => {

        it('should add element style and not override other styles', () => {
          elem.style['display'] = 'inline';
          dom.setStyle(elem, 'color', 'red !important');
          expect(elem.style.cssText).toContain('display: inline;');
          expect(elem.style.cssText).toMatch(/color: red ! ?important;/);
        });

        it('should add element style with !important rule', () => {
          dom.setStyle(elem, 'color', 'red !important');
          expect(elem.style.cssText).toMatch(/color: red ! ?important;/);
        });

        it('should convert camelCase to dash-case style name', () => {
          dom.setStyle(elem, 'backgroundColor', 'red !important');
          expect(elem.style.cssText).toMatch(/background-color: red ! ?important;/);
        });

        it('should properly handle camelCase vendor prefixes', () => {
          const scale = 'scale(1) !important';
          dom.setStyle(elem, 'webkitTransform', scale);
          dom.setStyle(elem, 'MozTransform', scale);
          dom.setStyle(elem, 'msTransform', scale);
          dom.setStyle(elem, 'oTransform', scale);
          expect(elem.style.cssText).toMatch(/transform: scale\(1\) ! ?important;/);
        });

        it('should properly handle dash-case vendor prefixes', () => {
          const scale = 'scale(1) !important';
          dom.setStyle(elem, '-webkit-transform', scale);
          dom.setStyle(elem, '-moz-transform', scale);
          dom.setStyle(elem, '-ms-transform', scale);
          dom.setStyle(elem, '-o-transform', scale);
          expect(elem.style.cssText).toMatch(/transform: scale\(1\) ! ?important;/);
        });

        it('should override style with the same name', () => {
          elem.style['color'] = 'green';
          dom.setStyle(elem, 'color', 'red !important');
          expect(elem.style.cssText).toMatch(/color: red ! ?important;/);
          expect(elem.style.cssText).not.toContain('color: green;');
        });

      });

    });

  });
}
