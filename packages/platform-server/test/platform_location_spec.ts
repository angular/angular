/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '@angular/compiler';

import {PlatformLocation, ɵgetDOM as getDOM} from '@angular/common';
import {destroyPlatform} from '@angular/core';
import {INITIAL_CONFIG, platformServer} from '@angular/platform-server';

import {parseUrl} from '../src/location';

(function () {
  if (getDOM().supportsDOMEvents) return; // NODE only

  describe('parseUrl', () => {
    it('should resolve relative paths against origin', () => {
      const url = parseUrl('/deep/path?query#hash', 'http://test.com');
      expect(url.href).toBe('http://test.com/deep/path?query#hash');
      expect(url.search).toBe('?query');
      expect(url.hash).toBe('#hash');
    });

    it('should resolve absolute URLs ignoring origin', () => {
      const url = parseUrl('http://other.com/deep/path', 'http://test.com');
      expect(url.href).toBe('http://other.com/deep/path');
      expect(url.origin).toBe('http://other.com');
    });
  });

  describe('PlatformLocation', () => {
    beforeEach(() => {
      destroyPlatform();
    });

    afterEach(() => {
      destroyPlatform();
    });

    it('is injectable', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(location.pathname).toBe('/');
      platform.destroy();
    });
    it('is configurable via INITIAL_CONFIG', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<app></app>',
            url: 'http://test.com/deep/path?query#hash',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(location.pathname).toBe('/deep/path');
      expect(location.search).toBe('?query');
      expect(location.hash).toBe('#hash');
    });

    it('parses component pieces of a URL', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<app></app>',
            url: 'http://test.com:80/deep/path?query#hash',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(location.hostname).toBe('test.com');
      expect(location.protocol).toBe('http:');
      expect(location.port).toBe('');
      expect(location.pathname).toBe('/deep/path');
      expect(location.search).toBe('?query');
      expect(location.hash).toBe('#hash');
    });

    it('handles empty search and hash portions of the url', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<app></app>',
            url: 'http://test.com/deep/path',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(location.pathname).toBe('/deep/path');
      expect(location.search).toBe('');
      expect(location.hash).toBe('');
    });

    it('pushState causes the URL to update', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      const location = platform.injector.get(PlatformLocation);
      location.pushState(null, 'Test', '/foo#bar');
      expect(location.pathname).toBe('/foo');
      expect(location.hash).toBe('#bar');
      platform.destroy();
    });

    it('replaceState causes the URL to update', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<app></app>',
            url: 'http://test.com/deep/path?query#hash',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      location.replaceState(null, 'Test', '/foo#bar');
      expect(location.pathname).toBe('/foo');
      expect(location.hash).toBe('#bar');
      expect(location.href).toBe('http://test.com/foo#bar');
      expect(location.protocol).toBe('http:');
      platform.destroy();
    });

    it('allows subscription to the hash state', (done) => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);
      const location = platform.injector.get(PlatformLocation);

      expect(location.pathname).toBe('/');
      location.onHashChange((e: any) => {
        expect(e.type).toBe('hashchange');
        expect(e.oldUrl).toBe('/');
        expect(e.newUrl).toBe('/foo#bar');
        platform.destroy();
        done();
      });
      location.pushState(null, 'Test', '/foo#bar');
    });

    it('neutralizes hostname hijack attempts', async () => {
      const urls = ['/\\attacker.com/deep/path', '//attacker.com/deep/path'];

      for (const url of urls) {
        const platform = platformServer([
          {
            provide: INITIAL_CONFIG,
            useValue: {
              document: '',
              // This should be treated as relative URL.
              // Example: `req.url: '//attacker.com/deep/path'` where request
              // to express server is 'http://localhost:4200//attacker.com/deep/path'.
              url,
            },
          },
        ]);

        const location = platform.injector.get(PlatformLocation);
        platform.destroy();

        expect(location.hostname).withContext(`hostname for URL: "${url}"`).toBe('');
        expect(location.pathname).withContext(`pathname for URL: "${url}"`).toBe(url);
      }
    });
  });
})();
