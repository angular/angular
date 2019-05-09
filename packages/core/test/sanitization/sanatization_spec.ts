
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
import {getUrlSanitizer, ΔsanitizeHtml, ΔsanitizeResourceUrl, ΔsanitizeScript, ΔsanitizeStyle, ΔsanitizeUrl, ΔsanitizeUrlOrResourceUrl} from '../../src/sanitization/sanitization';
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
    expect(ΔsanitizeHtml('<div></div>')).toEqual('<div></div>');
    expect(ΔsanitizeHtml(new Wrap('<div></div>'))).toEqual('<div></div>');
    expect(ΔsanitizeHtml('<img src="javascript:true">'))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ΔsanitizeHtml(new Wrap('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ΔsanitizeHtml(bypassSanitizationTrustUrl('<img src="javascript:true">')))
        .toEqual('<img src="unsafe:javascript:true">');
    expect(ΔsanitizeHtml(bypassSanitizationTrustHtml('<img src="javascript:true">')))
        .toEqual('<img src="javascript:true">');
  });

  it('should sanitize url', () => {
    expect(ΔsanitizeUrl('http://server')).toEqual('http://server');
    expect(ΔsanitizeUrl(new Wrap('http://server'))).toEqual('http://server');
    expect(ΔsanitizeUrl('javascript:true')).toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrl(new Wrap('javascript:true'))).toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrl(bypassSanitizationTrustUrl('javascript:true'))).toEqual('javascript:true');
  });

  it('should sanitize resourceUrl', () => {
    const ERROR = 'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)';
    expect(() => ΔsanitizeResourceUrl('http://server')).toThrowError(ERROR);
    expect(() => ΔsanitizeResourceUrl('javascript:true')).toThrowError(ERROR);
    expect(() => ΔsanitizeResourceUrl(bypassSanitizationTrustHtml('javascript:true')))
        .toThrowError(ERROR);
    expect(ΔsanitizeResourceUrl(bypassSanitizationTrustResourceUrl('javascript:true')))
        .toEqual('javascript:true');
  });

  it('should sanitize style', () => {
    expect(ΔsanitizeStyle('red')).toEqual('red');
    expect(ΔsanitizeStyle(new Wrap('red'))).toEqual('red');
    expect(ΔsanitizeStyle('url("http://server")')).toEqual('unsafe');
    expect(ΔsanitizeStyle(new Wrap('url("http://server")'))).toEqual('unsafe');
    expect(ΔsanitizeStyle(bypassSanitizationTrustHtml('url("http://server")'))).toEqual('unsafe');
    expect(ΔsanitizeStyle(bypassSanitizationTrustStyle('url("http://server")')))
        .toEqual('url("http://server")');
  });

  it('should sanitize script', () => {
    const ERROR = 'unsafe value used in a script context';
    expect(() => ΔsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ΔsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ΔsanitizeScript(bypassSanitizationTrustHtml('true'))).toThrowError(ERROR);
    expect(ΔsanitizeScript(bypassSanitizationTrustScript('true'))).toEqual('true');
  });

  it('should select correct sanitizer for URL props', () => {
    // making sure security schema we have on compiler side is in sync with the `getUrlSanitizer`
    // runtime function definition
    const schema = SECURITY_SCHEMA();
    const contextsByProp: Map<string, Set<number>> = new Map();
    const sanitizerNameByContext: Map<number, Function> = new Map([
      [SecurityContext.URL, ΔsanitizeUrl], [SecurityContext.RESOURCE_URL, ΔsanitizeResourceUrl]
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
    expect(() => ΔsanitizeUrlOrResourceUrl('http://server', 'iframe', 'src')).toThrowError(ERROR);
    expect(() => ΔsanitizeUrlOrResourceUrl('javascript:true', 'iframe', 'src')).toThrowError(ERROR);
    expect(
        () => ΔsanitizeUrlOrResourceUrl(
            bypassSanitizationTrustHtml('javascript:true'), 'iframe', 'src'))
        .toThrowError(ERROR);
    expect(ΔsanitizeUrlOrResourceUrl(
               bypassSanitizationTrustResourceUrl('javascript:true'), 'iframe', 'src'))
        .toEqual('javascript:true');
  });

  it('should sanitize urls via sanitizeUrlOrResourceUrl', () => {
    expect(ΔsanitizeUrlOrResourceUrl('http://server', 'a', 'href')).toEqual('http://server');
    expect(ΔsanitizeUrlOrResourceUrl(new Wrap('http://server'), 'a', 'href'))
        .toEqual('http://server');
    expect(ΔsanitizeUrlOrResourceUrl('javascript:true', 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrlOrResourceUrl(new Wrap('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrlOrResourceUrl(bypassSanitizationTrustHtml('javascript:true'), 'a', 'href'))
        .toEqual('unsafe:javascript:true');
    expect(ΔsanitizeUrlOrResourceUrl(bypassSanitizationTrustUrl('javascript:true'), 'a', 'href'))
        .toEqual('javascript:true');
  });
});
