/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '@angular/compiler';

import {DOCUMENT, PlatformLocation, ɵgetDOM as getDOM} from '@angular/common';
import {destroyPlatform} from '@angular/core';
import {INITIAL_CONFIG, platformServer} from '@angular/platform-server';

(function () {
  if (getDOM().supportsDOMEvents) return; // NODE only

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

    it('should throw on hostname hijack attempts to prevent origin hijack', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<html><head></head><body></body></html>',
            url: '/\\attacker.com/deep/path',
          },
        },
      ]);

      expect(() => platform.injector.get(DOCUMENT)).toThrowError(
        `NG05703: URL /\\attacker.com/deep/path changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`,
      );
      platform.destroy();
    });

    it('should throw on protocol-relative URLs in INITIAL_CONFIG', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<html><head></head><body></body></html>',
            url: '//attacker.com/deep/path',
          },
        },
      ]);

      expect(() => platform.injector.get(DOCUMENT)).toThrowError(
        `NG05702: Protocol relative URLs are not allowed in this context. URL: //attacker.com/deep/path`,
      );
      platform.destroy();
    });

    it('should throw on replaceState with different origin', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<html><head></head><body></body></html>',
            url: 'http://test.com/deep/path',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(() => location.replaceState(null, 'Title', 'http://attacker.com/foo')).toThrowError(
        `NG05703: URL http://attacker.com/foo changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`,
      );
      platform.destroy();
    });

    it('should throw on pushState with different origin', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<html><head></head><body></body></html>',
            url: 'http://test.com/deep/path',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(() => location.pushState(null, 'Title', 'http://attacker.com/foo')).toThrowError(
        `NG05703: URL http://attacker.com/foo changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`,
      );
      platform.destroy();
    });

    it('should allow replaceState/pushState with same origin', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<html><head></head><body></body></html>',
            url: 'http://test.com/deep/path',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      expect(() => location.replaceState(null, 'Title', '/other-path')).not.toThrow();
      expect(() => location.pushState(null, 'Title', 'http://test.com/other-path')).not.toThrow();
      platform.destroy();
    });
  });
})();
