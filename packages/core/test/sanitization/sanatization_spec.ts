
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SECURITY_SCHEMA} from '@angular/compiler/src/schema/dom_security_schema';
import {HEADER_OFFSET, LView} from '@angular/core/src/render3/interfaces/view';
import {setTNodeAndViewData} from '@angular/core/src/render3/state';

import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl} from '../../src/sanitization/bypass';
import {getUrlSanitizer, ɵɵsanitizeHtml, ɵɵsanitizeResourceUrl, ɵɵsanitizeScript, ɵɵsanitizeStyle, ɵɵsanitizeUrl, ɵɵsanitizeUrlOrResourceUrl} from '../../src/sanitization/sanitization';
import {SecurityContext} from '../../src/sanitization/security';

function fakeLView(): LView {
  return [null, {}] as LView;
}

describe('sanitization', () => {
  beforeEach(() => setTNodeAndViewData(null !, fakeLView()));
  afterEach(() => setTNodeAndViewData(null !, null !));
  class Wrap {
    constructor(private value: string) {}
    toString() { return this.value; }
  }
  it('should sanitize html', () => {
    expect(ɵɵsanitizeHtml('<div></div>')).toEqual('<div></div>');
    expect(ɵɵsanitizeHtml(new Wrap('<div></div>'))).toEqual('<div></div>');
    expect(ɵɵsanitizeHtml('<img src="javascript:true">'))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ɵɵsanitizeHtml(new Wrap('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ɵɵsanitizeHtml(bypassSanitizationTrustUrl('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ɵɵsanitizeHtml(bypassSanitizationTrustHtml('<img src="javascript:true">')))
        .toEqual('<img src="javascript:true">');
  });

  it('should sanitize url', () => {
    expect(ɵɵsanitizeUrl('http://server')).toEqual('http://server');
    expect(ɵɵsanitizeUrl(new Wrap('http://server'))).toEqual('http://server');
    expect(ɵɵsanitizeUrl('javascript:true')).toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrl(new Wrap('javascript:true'))).toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrl(bypassSanitizationTrustUrl('javascript:true'))).toEqual('javascript:true');
  });

  it('should sanitize resourceUrl', () => {
    const ERROR = 'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)';
    expect(() => ɵɵsanitizeResourceUrl('http://server')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeResourceUrl('javascript:true')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeResourceUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toThrowError(ERROR);
    expect(ɵɵsanitizeResourceUrl(bypassSanitizationTrustResourceUrl('javascript:true')))
        .toEqual('javascript:true');
  });

  it('should sanitize style', () => {
    expect(ɵɵsanitizeStyle('red')).toEqual('red');
    expect(ɵɵsanitizeStyle(new Wrap('red'))).toEqual('red');
    expect(ɵɵsanitizeStyle('url("http://server")')).toEqual('unsafe');
    expect(ɵɵsanitizeStyle(new Wrap('url("http://server")'))).toEqual('unsafe');
    expect(ɵɵsanitizeStyle(bypassSanitizationTrustHtml('url("http://server")'))).toEqual('unsafe');
    expect(ɵɵsanitizeStyle(bypassSanitizationTrustStyle('url("http://server")')))
        .toEqual('url("http://server")');
  });

  it('should sanitize script', () => {
    const ERROR = 'unsafe value used in a script context';
    expect(() => ɵɵsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeScript(bypassSanitizationTrustHtml('true'))).toThrowError(ERROR);
    expect(ɵɵsanitizeScript(bypassSanitizationTrustScript('true'))).toEqual('true');
  });

  it('should select correct sanitizer for URL props', () => {
    // making sure security schema we have on compiler side is in sync with the `getUrlSanitizer`
    // runtime function definition
    const schema = SECURITY_SCHEMA();
    const contextsByProp: Map<string, Set<number>> = new Map();
    const sanitizerNameByContext: Map<number, Function> = new Map([
      [SecurityContext.URL, ɵɵsanitizeUrl], [SecurityContext.RESOURCE_URL, ɵɵsanitizeResourceUrl]
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
          expect(getUrlSanitizer(tag, prop)).toEqual(sanitizerNameByContext.get(context) !);
        }
      }
    });
  });

  it('should sanitize resourceUrls via sanitizeUrlOrResourceUrl', () => {
    const ERROR = 'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)';
    expect(() => ɵɵsanitizeUrlOrResourceUrl('http://server', 'iframe', 'src')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeUrlOrResourceUrl('javascript:true', 'iframe', 'src'))
        .toThrowError(ERROR);
    expect(
        () => ɵɵsanitizeUrlOrResourceUrl(
            bypassSanitizationTrustHtml('javascript:true'), 'iframe', 'src'))
        .toThrowError(ERROR);
    expect(ɵɵsanitizeUrlOrResourceUrl(
               bypassSanitizationTrustResourceUrl('javascript:true'), 'iframe', 'src'))
        .toEqual('javascript:true');
  });

  it('should sanitize urls via sanitizeUrlOrResourceUrl', () => {
    expect(ɵɵsanitizeUrlOrResourceUrl('http://server', 'a', 'href')).toEqual('http://server');
    expect(ɵɵsanitizeUrlOrResourceUrl(new Wrap('http://server'), 'a', 'href'))
        .toEqual('http://server');
    expect(ɵɵsanitizeUrlOrResourceUrl('javascript:true', 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrlOrResourceUrl(new Wrap('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrlOrResourceUrl(bypassSanitizationTrustHtml('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrlOrResourceUrl(bypassSanitizationTrustUrl('javascript:true'), 'a', 'href'))
        .toEqual('javascript:true');
  });
});
