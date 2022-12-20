/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, ɵUrlService} from '@angular/common';
import {TestBed} from '@angular/core/testing';

const baseUrl = '/base';

describe('UrlService Class', () => {
  describe('stripTrailingSlash', () => {
    it('should strip single character slash', () => {
      const input = '/';
      expect(ɵUrlService.stripTrailingSlash(input)).toBe('');
    });

    it('should normalize strip a trailing slash', () => {
      const input = baseUrl + '/';
      expect(ɵUrlService.stripTrailingSlash(input)).toBe(baseUrl);
    });

    it('should ignore query params when stripping a slash', () => {
      const input = baseUrl + '/?param=1';
      expect(ɵUrlService.stripTrailingSlash(input)).toBe(baseUrl + '?param=1');
    });

    it('should not remove slashes inside query params', () => {
      const input = baseUrl + '?test/?=3';
      expect(ɵUrlService.stripTrailingSlash(input)).toBe(input);
    });

    it('should not remove slashes after a pound sign', () => {
      const input = baseUrl + '#test/?=3';
      expect(ɵUrlService.stripTrailingSlash(input)).toBe(input);
    });
  });

  describe('urlService.normalize(url) should return only route', () => {
    const basePath = '/en';
    const route = '/go/to/there';
    const url = basePath + route;
    const getBaseHref = (origin: string) => origin + basePath + '/';

    it('in case APP_BASE_HREF starts with http:', () => {
      const origin = 'http://example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const urlService = TestBed.inject(ɵUrlService);

      expect(urlService.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with https:', () => {
      const origin = 'https://example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const urlService = TestBed.inject(ɵUrlService);

      expect(urlService.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with no protocol', () => {
      const origin = '//example.com';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const urlService = TestBed.inject(ɵUrlService);

      expect(urlService.normalize(url)).toBe(route);
    });

    it('in case APP_BASE_HREF starts with no origin', () => {
      const origin = '';
      const baseHref = getBaseHref(origin);

      TestBed.configureTestingModule({providers: [{provide: APP_BASE_HREF, useValue: baseHref}]});

      const urlService = TestBed.inject(ɵUrlService);

      expect(urlService.normalize(url)).toBe(route);
    });
  });
});
