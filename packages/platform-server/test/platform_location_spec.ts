/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '@angular/compiler';

import {PlatformLocation, ɵgetDOM as getDOM} from '@angular/common';
import {Component, destroyPlatform} from '@angular/core';
import {INITIAL_CONFIG, platformServer} from '@angular/platform-server';
import {bootstrapApplication} from '@angular/platform-browser';

(function () {
  if (getDOM().supportsDOMEvents) return; // NODE only

  describe('PlatformLocation', () => {
    @Component({
      selector: 'app',
      template: `Works!`,
    })
    class LocationApp {}

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
      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}],
        },
        {platformRef: platform},
      );

      const location = appRef.injector.get(PlatformLocation);
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

      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [
            {
              provide: INITIAL_CONFIG,
              useValue: {
                document: '<app></app>',
                url: 'http://test.com/deep/path?query#hash',
              },
            },
          ],
        },
        {platformRef: platform},
      );

      const location = appRef.injector.get(PlatformLocation);
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

      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [
            {
              provide: INITIAL_CONFIG,
              useValue: {
                document: '<app></app>',
                url: 'http://test.com:80/deep/path?query#hash',
              },
            },
          ],
        },
        {platformRef: platform},
      );

      const location = appRef.injector.get(PlatformLocation);
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

      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [
            {
              provide: INITIAL_CONFIG,
              useValue: {
                document: '<app></app>',
                url: 'http://test.com/deep/path',
              },
            },
          ],
        },
        {platformRef: platform},
      );

      const location = appRef.injector.get(PlatformLocation);
      expect(location.pathname).toBe('/deep/path');
      expect(location.search).toBe('');
      expect(location.hash).toBe('');
    });

    it('pushState causes the URL to update', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}],
        },
        {platformRef: platform},
      );
      const location = appRef.injector.get(PlatformLocation);
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

      const appRef = await bootstrapApplication(
        LocationApp,
        {
          providers: [
            {
              provide: INITIAL_CONFIG,
              useValue: {
                document: '<app></app>',
                url: 'http://test.com/deep/path?query#hash',
              },
            },
          ],
        },
        {platformRef: platform},
      );
      const location = appRef.injector.get(PlatformLocation);
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
      bootstrapApplication(
        LocationApp,
        {
          providers: [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}],
        },
        {platformRef: platform},
      ).then((appRef) => {
        const location: PlatformLocation = appRef.injector.get(PlatformLocation);
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
    });
  });
})();
