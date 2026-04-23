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
      // Authority now comes from `publicOrigin` (trusted, operator-supplied),
      // not from the `url` field (which is sanitized to path-only because it
      // is typically populated from `req.url`).
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '<app></app>',
            publicOrigin: 'http://test.com:80',
            url: '/deep/path?query#hash',
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
            publicOrigin: 'http://test.com',
            url: '/deep/path?query#hash',
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
        const platform = platformServer([{provide: INITIAL_CONFIG, useValue: {document: '', url}}]);

        const location = platform.injector.get(PlatformLocation);
        platform.destroy();

        expect(location.hostname).withContext(`hostname for URL: "${url}"`).toBe('');
        expect(location.pathname).withContext(`pathname for URL: "${url}"`).toBe('/deep/path');
      }
    });

    it('neutralizes absolute-form request-target hostname hijack attempts', async () => {
      // GHSA-45q2-gjvg-7973 bypass: absolute-form request-target (RFC 9112 §3.2.2)
      // in `req.url` flows into `INITIAL_CONFIG.url` and previously leaked authority.
      const urls = [
        'http://attacker.example/deep/path',
        'https://attacker.example/deep/path',
        'http://169.254.169.254/latest/meta-data/',
        'http://10.0.0.1:8080/admin',
      ];

      for (const url of urls) {
        const platform = platformServer([{provide: INITIAL_CONFIG, useValue: {document: '', url}}]);

        const location = platform.injector.get(PlatformLocation);
        platform.destroy();

        const parsed = new URL(url);
        const attackerHost = parsed.hostname;
        expect(location.hostname).withContext(`hostname for URL: "${url}"`).not.toBe(attackerHost);
        // Only assert port divergence when the attacker URL specified a
        // non-default port — `new URL('http://host/').port` is `''`, which
        // would trivially equal the post-fix `location.port`.
        if (parsed.port !== '') {
          expect(location.port).withContext(`port for URL: "${url}"`).not.toBe(parsed.port);
        }
        expect(location.href).withContext(`href for URL: "${url}"`).not.toContain(attackerHost);
      }
    });

    it('publicOrigin populates authority; url supplies path', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '',
            publicOrigin: 'https://my-site.com',
            url: '/page?x=1#top',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      platform.destroy();

      expect(location.protocol).toBe('https:');
      expect(location.hostname).toBe('my-site.com');
      expect(location.port).toBe('');
      expect(location.pathname).toBe('/page');
      expect(location.search).toBe('?x=1');
      expect(location.hash).toBe('#top');
      expect(location.href).toBe('https://my-site.com/page?x=1#top');
    });

    it('publicOrigin beats an attacker-controlled absolute url', async () => {
      // With both set, authority must come from publicOrigin; the path (and
      // only the path) is carried over from url.
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '',
            publicOrigin: 'https://victim.example.com',
            url: 'http://attacker.example/admin',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      platform.destroy();

      expect(location.hostname).toBe('victim.example.com');
      expect(location.protocol).toBe('https:');
      expect(location.pathname).toBe('/admin');
      expect(location.href).not.toContain('attacker.example');
      expect(location.href).toBe('https://victim.example.com/admin');
    });

    it('publicOrigin falls back to the platform default when invalid', async () => {
      // Non-http(s) schemes, unparseable strings, and empty values all map to
      // the DOMINO default origin, matching the behavior of no publicOrigin.
      for (const publicOrigin of ['javascript:void(0)', 'data:text/html,x', 'not a url', '']) {
        const platform = platformServer([
          {
            provide: INITIAL_CONFIG,
            useValue: {document: '', publicOrigin, url: '/page'},
          },
        ]);

        const location = platform.injector.get(PlatformLocation);
        platform.destroy();

        expect(location.hostname)
          .withContext(`hostname for publicOrigin: ${JSON.stringify(publicOrigin)}`)
          .toBe('');
        expect(location.pathname)
          .withContext(`pathname for publicOrigin: ${JSON.stringify(publicOrigin)}`)
          .toBe('/page');
      }
    });

    it('non-http(s) scheme in url never leaks to location.protocol', async () => {
      // A malformed or malicious `url` carrying an opaque scheme
      // (`javascript:`, `data:`, `blob:`) must not override the protocol
      // derived from `publicOrigin`. The sanitizer discards the scheme; only
      // the path portion reaches `parseUrl`.
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '',
            publicOrigin: 'https://victim.example.com',
            url: 'javascript:alert(1)',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      platform.destroy();

      expect(location.protocol).toBe('https:');
      expect(location.hostname).toBe('victim.example.com');
      expect(location.href).not.toContain('javascript:');
    });

    it('userinfo and port in url are discarded when publicOrigin is set', async () => {
      // Parser-confusion vector: `http://attacker:443@attacker-host/admin`
      // puts `attacker:443` in userinfo and `attacker-host` as host. The
      // sanitizer must strip both — only `/admin` should cross the trust
      // boundary into `PlatformLocation`.
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '',
            publicOrigin: 'https://victim.example.com',
            url: 'http://attacker:443@attacker-host/admin',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      platform.destroy();

      expect(location.hostname).toBe('victim.example.com');
      expect(location.port).toBe('');
      expect(location.pathname).toBe('/admin');
      expect(location.href).toBe('https://victim.example.com/admin');
      expect(location.href).not.toContain('attacker');
      expect(location.href).not.toContain(':443');
    });

    it('publicOrigin discards path, query, fragment, and credentials', async () => {
      // Only scheme+host+port are retained from publicOrigin.
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {
            document: '',
            publicOrigin: 'https://user:pass@my-site.com/ignored?x=1#frag',
            url: '/page',
          },
        },
      ]);

      const location = platform.injector.get(PlatformLocation);
      platform.destroy();

      expect(location.hostname).toBe('my-site.com');
      expect(location.protocol).toBe('https:');
      expect(location.href).toBe('https://my-site.com/page');
      expect(location.href).not.toContain('user');
      expect(location.href).not.toContain('pass');
      expect(location.href).not.toContain('ignored');
      expect(location.href).not.toContain('?x=1');
      expect(location.href).not.toContain('#frag');
    });
  });
})();
