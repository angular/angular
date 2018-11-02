
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl} from '../../src/sanitization/bypass';
import {sanitizeHtml, sanitizeResourceUrl, sanitizeScript, sanitizeStyle, sanitizeUrl} from '../../src/sanitization/sanitization';

describe('sanitization', () => {
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
});
