/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IMAGE_LOADER, ImageLoader, PRECONNECT_CHECK_BLOCKLIST} from '@angular/common/src/directives/ng_optimized_image';
import {provideImgixLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imgix_loader';
import {RuntimeErrorCode} from '@angular/common/src/errors';
import {createEnvironmentInjector, ValueProvider} from '@angular/core';

describe('Built-in image directive loaders', () => {
  describe('Imgix loader', () => {
    function createImgixLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector([provideImgixLoader(path)]);
      return injector.get(IMAGE_LOADER);
    }

    function invalidPathError(path: string): string {
      return `NG0${RuntimeErrorCode.INVALID_INPUT}: ImgixLoader has detected ` +
          `an invalid path: expecting a path like https://somepath.imgix.net/` +
          `but got: \`${path}\``;
    }

    describe('invalid paths', () => {
      it('should throw when a path is empty', () => {
        const path = '';
        expect(() => provideImgixLoader(path)).toThrowError(invalidPathError(path));
      });

      it('should throw when a path is not a URL', () => {
        const path = 'wellhellothere';
        expect(() => provideImgixLoader(path)).toThrowError(invalidPathError(path));
      });

      it('should throw when a path is missing a scheme', () => {
        const path = 'somepath.imgix.net';
        expect(() => provideImgixLoader(path)).toThrowError(invalidPathError(path));
      });

      it('should throw when a path is malformed', () => {
        const path = 'somepa\th.imgix.net? few';
        expect(() => provideImgixLoader(path)).toThrowError(invalidPathError(path));
      });
    });

    it('should construct an image loader with the given path', () => {
      const loader = createImgixLoader('https://somesite.imgix.net');
      const config = {src: 'img.png'};
      expect(loader(config)).toBe('https://somesite.imgix.net/img.png?auto=format');
    });

    it('should handle a trailing forward slash on the path', () => {
      const loader = createImgixLoader('https://somesite.imgix.net/');
      const config = {src: 'img.png'};
      expect(loader(config)).toBe('https://somesite.imgix.net/img.png?auto=format');
    });

    it('should handle a leading forward slash on the src', () => {
      const loader = createImgixLoader('https://somesite.imgix.net');
      const config = {src: '/img.png'};
      expect(loader(config)).toBe('https://somesite.imgix.net/img.png?auto=format');
    });

    it('should construct an image loader with the given path', () => {
      const loader = createImgixLoader('https://somesite.imgix.net');
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe('https://somesite.imgix.net/img.png?auto=format&w=100');
    });

    describe('options', () => {
      it('should configure PRECONNECT_CHECK_BLOCKLIST token by default', () => {
        const providers = provideImgixLoader('https://somesite.imgix.net');
        expect(providers.length).toBe(2);

        const valueProvider = providers[1] as ValueProvider;
        expect(valueProvider.multi).toBeTrue();
        expect(valueProvider.useValue).toEqual(['https://somesite.imgix.net']);
        expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
      });

      it('should configure PRECONNECT_CHECK_BLOCKLIST when the ensurePreconnect was specified',
         () => {
           const providers =
               provideImgixLoader('https://somesite.imgix.net', {ensurePreconnect: true});
           expect(providers.length).toBe(2);

           const valueProvider = providers[1] as ValueProvider;
           expect(valueProvider.multi).toBeTrue();
           expect(valueProvider.useValue).toEqual(['https://somesite.imgix.net']);
           expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
         });

      it('should NOT configure PRECONNECT_CHECK_BLOCKLIST disabled with the ensurePreconnect option',
         () => {
           const providers =
               provideImgixLoader('https://somesite.imgix.net', {ensurePreconnect: false});
           expect(providers.length).toBe(1);
         });
    });
  });
});
