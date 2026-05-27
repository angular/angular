/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SECURITY_SCHEMA} from '@angular/compiler';
import {ENVIRONMENT, LView} from '../../src/render3/interfaces/view';
import {enterView, leaveView} from '../../src/render3/state';

import {
  bypassSanitizationTrustHtml,
  bypassSanitizationTrustResourceUrl,
  bypassSanitizationTrustScript,
  bypassSanitizationTrustStyle,
  bypassSanitizationTrustUrl,
} from '../../src/sanitization/bypass';
import {
  getUrlSanitizer,
  ɵɵsanitizeHtml,
  ɵɵsanitizeResourceUrl,
  ɵɵsanitizeScript,
  ɵɵsanitizeStyle,
  ɵɵsanitizeUrl,
  ɵɵsanitizeUrlOrResourceUrl,
  ɵɵtrustConstantHtml,
  ɵɵtrustConstantResourceUrl,
} from '../../src/sanitization/sanitization';
import {SecurityContext} from '../../src/sanitization/security';

function fakeLView(): LView {
  const fake = [null, {}] as LView;
  fake[ENVIRONMENT] = {} as any;
  return fake;
}

describe('sanitization', () => {
  beforeEach(() => enterView(fakeLView()));
  afterEach(() => leaveView());
  class Wrap {
    constructor(private value: string) {}
    toString() {
      return this.value;
    }
  }
  it('should sanitize html', () => {
    expect(ɵɵsanitizeHtml('<div></div>').toString()).toEqual('<div></div>');
    expect(ɵɵsanitizeHtml(new Wrap('<div></div>')).toString()).toEqual('<div></div>');
    expect(ɵɵsanitizeHtml('<img src="javascript:true">').toString()).toEqual(
      '<img src="unsafe:javascript:true">',
    );
    expect(ɵɵsanitizeHtml(new Wrap('<img src="javascript:true">')).toString()).toEqual(
      '<img src="unsafe:javascript:true">',
    );
    expect(() =>
      ɵɵsanitizeHtml(bypassSanitizationTrustUrl('<img src="javascript:true">')),
    ).toThrowError(/Required a safe HTML, got a URL/);
    expect(
      ɵɵsanitizeHtml(bypassSanitizationTrustHtml('<img src="javascript:true">')).toString(),
    ).toEqual('<img src="javascript:true">');
  });

  it('should sanitize url', () => {
    expect(ɵɵsanitizeUrl('http://server')).toEqual('http://server');
    expect(ɵɵsanitizeUrl(new Wrap('http://server'))).toEqual('http://server');
    expect(ɵɵsanitizeUrl('javascript:true')).toEqual('unsafe:javascript:true');
    expect(ɵɵsanitizeUrl(new Wrap('javascript:true'))).toEqual('unsafe:javascript:true');
    expect(() => ɵɵsanitizeUrl(bypassSanitizationTrustHtml('javascript:true'))).toThrowError(
      /Required a safe URL, got a HTML/,
    );
    expect(ɵɵsanitizeUrl(bypassSanitizationTrustUrl('javascript:true'))).toEqual('javascript:true');
  });

  it('should sanitize resourceUrl', () => {
    const ERROR = /NG0904: unsafe value used in a resource URL context.*/;
    expect(() => ɵɵsanitizeResourceUrl('http://server')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeResourceUrl('javascript:true')).toThrowError(ERROR);
    expect(() =>
      ɵɵsanitizeResourceUrl(bypassSanitizationTrustHtml('javascript:true')),
    ).toThrowError(/Required a safe ResourceURL, got a HTML/);
    expect(
      ɵɵsanitizeResourceUrl(bypassSanitizationTrustResourceUrl('javascript:true')).toString(),
    ).toEqual('javascript:true');
  });

  it('should sanitize style', () => {
    expect(ɵɵsanitizeStyle('red')).toEqual('red');
    expect(ɵɵsanitizeStyle(new Wrap('red'))).toEqual('red');
    expect(ɵɵsanitizeStyle('url("http://server")')).toEqual('url("http://server")');
    expect(ɵɵsanitizeStyle(new Wrap('url("http://server")'))).toEqual('url("http://server")');
    expect(() => ɵɵsanitizeStyle(bypassSanitizationTrustHtml('url("http://server")'))).toThrowError(
      /Required a safe Style, got a HTML/,
    );
    expect(ɵɵsanitizeStyle(bypassSanitizationTrustStyle('url("http://server")'))).toEqual(
      'url("http://server")',
    );
  });

  it('should sanitize script', () => {
    const ERROR = 'NG0905: unsafe value used in a script context';
    expect(() => ɵɵsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeScript('true')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeScript(bypassSanitizationTrustHtml('true'))).toThrowError(
      /Required a safe Script, got a HTML/,
    );
    expect(ɵɵsanitizeScript(bypassSanitizationTrustScript('true')).toString()).toEqual('true');
  });

  it('should select correct sanitizer for URL props', () => {
    // making sure security schema we have on compiler side is in sync with the `getUrlSanitizer`
    // runtime function definition
    const schema = SECURITY_SCHEMA();
    const contextsByProp: Map<string, Set<number>> = new Map();
    const sanitizerNameByContext: Map<number, Function> = new Map([
      [SecurityContext.URL, ɵɵsanitizeUrl],
      [SecurityContext.RESOURCE_URL, ɵɵsanitizeResourceUrl],
    ]);
    Object.entries(schema).forEach(([key, context]) => {
      if (context === SecurityContext.URL || SecurityContext.RESOURCE_URL) {
        const [tag, prop] = key.split('|');
        const contexts = contextsByProp.get(prop) || new Set<number>();
        contexts.add(context);
        contextsByProp.set(prop, contexts);
        // check only in case a prop can be a part of both URL contexts
        if (contexts.size === 2) {
          expect(getUrlSanitizer(tag, prop)).toEqual(sanitizerNameByContext.get(context)!);
        }
      }
    });
  });

  it('should sanitize resourceUrls via sanitizeUrlOrResourceUrl', () => {
    const ERROR = /NG0904: unsafe value used in a resource URL context.*/;
    expect(() => ɵɵsanitizeUrlOrResourceUrl('http://server', 'iframe', 'src')).toThrowError(ERROR);
    expect(() => ɵɵsanitizeUrlOrResourceUrl('javascript:true', 'iframe', 'src')).toThrowError(
      ERROR,
    );
    expect(() =>
      ɵɵsanitizeUrlOrResourceUrl(bypassSanitizationTrustHtml('javascript:true'), 'iframe', 'src'),
    ).toThrowError(/Required a safe ResourceURL, got a HTML/);
    expect(
      ɵɵsanitizeUrlOrResourceUrl(
        bypassSanitizationTrustResourceUrl('javascript:true'),
        'iframe',
        'src',
      ).toString(),
    ).toEqual('javascript:true');
  });

  it('should sanitize urls via sanitizeUrlOrResourceUrl', () => {
    expect(ɵɵsanitizeUrlOrResourceUrl('http://server', 'a', 'href')).toEqual('http://server');
    expect(ɵɵsanitizeUrlOrResourceUrl(new Wrap('http://server'), 'a', 'href')).toEqual(
      'http://server',
    );
    expect(ɵɵsanitizeUrlOrResourceUrl('javascript:true', 'a', 'href')).toEqual(
      'unsafe:javascript:true',
    );
    expect(ɵɵsanitizeUrlOrResourceUrl(new Wrap('javascript:true'), 'a', 'href')).toEqual(
      'unsafe:javascript:true',
    );
    expect(() =>
      ɵɵsanitizeUrlOrResourceUrl(bypassSanitizationTrustHtml('javascript:true'), 'a', 'href'),
    ).toThrowError(/Required a safe URL, got a HTML/);
    expect(
      ɵɵsanitizeUrlOrResourceUrl(bypassSanitizationTrustUrl('javascript:true'), 'a', 'href'),
    ).toEqual('javascript:true');
  });

  it('should only trust constant strings from template literal tags without interpolation', () => {
    expect(ɵɵtrustConstantHtml`<h1>good</h1>`.toString()).toEqual('<h1>good</h1>');
    expect(ɵɵtrustConstantResourceUrl`http://good.com`.toString()).toEqual('http://good.com');
    expect(() => (ɵɵtrustConstantHtml as any)`<h1>${'evil'}</h1>`).toThrowError(
      /Unexpected interpolation in trusted HTML constant/,
    );
    expect(() => (ɵɵtrustConstantResourceUrl as any)`http://${'evil'}.com`).toThrowError(
      /Unexpected interpolation in trusted URL constant/,
    );
  });
});
