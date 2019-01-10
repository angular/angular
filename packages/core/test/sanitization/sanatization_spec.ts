
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SECURITY_SCHEMA} from '@angular/compiler/src/schema/dom_security_schema';
import {setTNodeAndViewData} from '@angular/core/src/render3/state';

import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl} from '../../src/sanitization/bypass';
import {getUrlSanitizer, sanitizeHtml, sanitizeResourceUrl, sanitizeScript, sanitizeStyle, sanitizeUrl, sanitizeUrlOrResourceUrl} from '../../src/sanitization/sanitization';
import {SecurityContext} from '../../src/sanitization/security';

describe('sanitization', () => {
  beforeEach(() => setTNodeAndViewData(null !, [] as any));
  afterEach(() => setTNodeAndViewData(null !, null !));
  class Wrap {
    constructor(private value: string) {}
    toString() { return this.value; }
  }
  it('should sanitize html', () => {
    expect(sanitizeHtml('<div></div>')).toEqual('<div></div>');
    expect(sanitizeHtml(new Wrap('<div></div>'))).toEqual('<div></div>');
    expect(sanitizeHtml('<img src="javascript:true">'))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(sanitizeHtml(new Wrap('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(sanitizeHtml(bypassSanitizationTrustUrl('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(sanitizeHtml(bypassSanitizationTrustHtml('<img src="javascript:true">')))
        .toEqual('<img src="javascript:true">');
  });

  it('should sanitize url', () => {
    expect(sanitizeUrl('http://server')).toEqual('http://server');
    expect(sanitizeUrl(new Wrap('http://server'))).toEqual('http://server');
    expect(sanitizeUrl('javascript:true')).toEqual('unsafe:javascript:true');
    expect(sanitizeUrl(new Wrap('javascript:true'))).toEqual('unsafe:javascript:true');
    expect(sanitizeUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toEqual('unsafe:javascript:true');
    expect(sanitizeUrl(bypassSanitizationTrustUrl('javascript:true'))).toEqual('javascript:true');
  });

  it('should sanitize resourceUrl', () => {
    const ERROR = 'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)';
    expect(() => sanitizeResourceUrl('http://server')).toThrowError(ERROR);
    expect(() => sanitizeResourceUrl('javascript:true')).toThrowError(ERROR);
    expect(() => sanitizeResourceUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toThrowError(ERROR);
    expect(sanitizeResourceUrl(bypassSanitizationTrustResourceUrl('javascript:true')))
        .toEqual('javascript:true');
  });

  it('should sanitize style', () => {
    expect(sanitizeStyle('red')).toEqual('red');
    expect(sanitizeStyle(new Wrap('red'))).toEqual('red');
    expect(sanitizeStyle('url("http://server")')).toEqual('unsafe');
    expect(sanitizeStyle(new Wrap('url("http://server")'))).toEqual('unsafe');
    expect(sanitizeStyle(bypassSanitizationTrustHtml('url("http://server")'))).toEqual('unsafe');
    expect(sanitizeStyle(bypassSanitizationTrustStyle('url("http://server")')))
        .toEqual('url("http://server")');
  });

  it('should sanitize script', () => {
    const ERROR = 'unsafe value used in a script context';
    expect(() => sanitizeScript('true')).toThrowError(ERROR);
    expect(() => sanitizeScript('true')).toThrowError(ERROR);
    expect(() => sanitizeScript(bypassSanitizationTrustHtml('true'))).toThrowError(ERROR);
    expect(sanitizeScript(bypassSanitizationTrustScript('true'))).toEqual('true');
  });

  it('should select correct sanitizer for URL props', () => {
    // making sure security schema we have on compiler side is in sync with the `getUrlSanitizer`
    // runtime function definition
    const schema = SECURITY_SCHEMA();
    const contextsByProp: Map<string, Set<number>> = new Map();
    const sanitizerNameByContext: Map<number, string> = new Map([
      [SecurityContext.URL, 'sanitizeUrl'], [SecurityContext.RESOURCE_URL, 'sanitizeResourceUrl']
    ]);
    Object.keys(schema).forEach(key => {
      const context = schema[key];
      if (context === SecurityContext.URL || SecurityContext.RESOURCE_URL) {
        const [tag, prop] = key.split('|');
        const contexts = contextsByProp.get(prop) || new Set<number>();
        contexts.add(context);
        contextsByProp.set(prop, contexts);
        // check only in case a prop can be a part of both URL contexts
        if (contexts.size === 2) {
          expect(getUrlSanitizer(tag, prop).name).toEqual(sanitizerNameByContext.get(context) !);
        }
      }
    });
  });

  it('should sanitize resourceUrls via sanitizeUrlOrResourceUrl', () => {
    const ERROR = 'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)';
    expect(() => sanitizeUrlOrResourceUrl('http://server', 'iframe', 'src')).toThrowError(ERROR);
    expect(() => sanitizeUrlOrResourceUrl('javascript:true', 'iframe', 'src')).toThrowError(ERROR);
    expect(
        () => sanitizeUrlOrResourceUrl(
            bypassSanitizationTrustHtml('javascript:true'), 'iframe', 'src'))
        .toThrowError(ERROR);
    expect(sanitizeUrlOrResourceUrl(
               bypassSanitizationTrustResourceUrl('javascript:true'), 'iframe', 'src'))
        .toEqual('javascript:true');
  });

  it('should sanitize urls via sanitizeUrlOrResourceUrl', () => {
    expect(sanitizeUrlOrResourceUrl('http://server', 'a', 'href')).toEqual('http://server');
    expect(sanitizeUrlOrResourceUrl(new Wrap('http://server'), 'a', 'href'))
        .toEqual('http://server');
    expect(sanitizeUrlOrResourceUrl('javascript:true', 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(sanitizeUrlOrResourceUrl(new Wrap('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(sanitizeUrlOrResourceUrl(bypassSanitizationTrustHtml('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(sanitizeUrlOrResourceUrl(bypassSanitizationTrustUrl('javascript:true'), 'a', 'href'))
        .toEqual('javascript:true');
  });
});
