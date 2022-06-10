/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IMAGE_LOADER, ImageLoader, PRECONNECT_CHECK_BLOCKLIST} from '@angular/common/src/directives/ng_optimized_image';
import {provideCloudflareLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/cloudflare_loader';
import {provideCloudinaryLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/cloudinary_loader';
import {provideImageKitLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imagekit_loader';
import {provideImgixLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imgix_loader';
import {isValidPath} from '@angular/common/src/directives/ng_optimized_image/util';
import {createEnvironmentInjector, ValueProvider} from '@angular/core';

describe('Built-in image directive loaders', () => {
  describe('Imgix loader', () => {
    function createImgixLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector([provideImgixLoader(path)]);
      return injector.get(IMAGE_LOADER);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: 'img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should handle a trailing forward slash on the path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(`${path}/`);
      const config = {src: 'img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should handle a leading forward slash on the image src', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: '/img.png'};
      expect(loader(config)).toBe(`${path}/img.png?auto=format`);
    });

    it('should construct an image loader with the given path', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe(`${path}/img.png?auto=format&w=100`);
    });

    describe('options', () => {
      it('should configure PRECONNECT_CHECK_BLOCKLIST token by default', () => {
        const path = 'https://somesite.imgix.net';
        const providers = provideImgixLoader(path);
        expect(providers.length).toBe(2);

        const valueProvider = providers[1] as ValueProvider;
        expect(valueProvider.multi).toBeTrue();
        expect(valueProvider.useValue).toEqual([path]);
        expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
      });

      it('should configure PRECONNECT_CHECK_BLOCKLIST when the ensurePreconnect was specified',
         () => {
           const path = 'https://somesite.imgix.net';
           const providers = provideImgixLoader(path, {ensurePreconnect: true});
           expect(providers.length).toBe(2);

           const valueProvider = providers[1] as ValueProvider;
           expect(valueProvider.multi).toBeTrue();
           expect(valueProvider.useValue).toEqual([path]);
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

  describe('Cloudinary loader', () => {
    function createCloudinaryLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector([provideCloudinaryLoader(path)]);
      return injector.get(IMAGE_LOADER);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://res.cloudinary.com/mysite';
      const loader = createCloudinaryLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      expect(loader({
        src: 'marketing/img-2.png'
      })).toBe(`${path}/image/upload/f_auto,q_auto/marketing/img-2.png`);
    });

    describe('input validation', () => {
      it('should throw if the path is invalid', () => {
        expect(() => provideCloudinaryLoader('my-cloudinary-account'))
            .toThrowError(
                `NG02952: CloudinaryLoader has detected an invalid path: ` +
                `expecting a path matching one of the following formats: ` +
                `https://res.cloudinary.com/mysite, https://mysite.cloudinary.com, ` +
                `or https://subdomain.mysite.com - but got: \`my-cloudinary-account\``);
      });

      it('should handle a trailing forward slash on the path', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const loader = createCloudinaryLoader(`${path}/`);
        expect(loader({src: 'img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      });

      it('should handle a leading forward slash on the image src', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const loader = createCloudinaryLoader(path);
        expect(loader({src: '/img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      });
    });

    describe('options', () => {
      it('should configure PRECONNECT_CHECK_BLOCKLIST token by default', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const providers = provideCloudinaryLoader(path);
        expect(providers.length).toBe(2);

        const valueProvider = providers[1] as ValueProvider;
        expect(valueProvider.multi).toBeTrue();
        expect(valueProvider.useValue).toEqual([path]);
        expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
      });

      it('should configure PRECONNECT_CHECK_BLOCKLIST when the ensurePreconnect was specified',
         () => {
           const path = 'https://res.cloudinary.com/mysite';
           const providers = provideCloudinaryLoader(path, {ensurePreconnect: true});
           expect(providers.length).toBe(2);

           const valueProvider = providers[1] as ValueProvider;
           expect(valueProvider.multi).toBeTrue();
           expect(valueProvider.useValue).toEqual([path]);
           expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
         });

      it('should NOT configure PRECONNECT_CHECK_BLOCKLIST disabled with the ensurePreconnect option',
         () => {
           const providers = provideCloudinaryLoader(
               'https://res.cloudinary.com/mysite', {ensurePreconnect: false});
           expect(providers.length).toBe(1);
         });
    });
  });

  describe('ImageKit loader', () => {
    function createImageKitLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector([provideImageKitLoader(path)]);
      return injector.get(IMAGE_LOADER);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://ik.imageengine.io/imagetest';
      const loader = createImageKitLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      expect(loader({src: 'marketing/img-2.png'})).toBe(`${path}/tr:q-auto/marketing/img-2.png`);
    });

    describe('input validation', () => {
      it('should throw if the path is invalid', () => {
        expect(() => provideImageKitLoader('my-imagekit-account'))
            .toThrowError(
                `NG02952: ImageKitLoader has detected an invalid path: ` +
                `expecting a path matching one of the following formats: ` +
                `https://ik.imagekit.io/mysite or https://subdomain.mysite.com - ` +
                `but got: \`my-imagekit-account\``);
      });

      it('should handle a trailing forward slash on the path', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(`${path}/`);
        expect(loader({src: 'img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      });

      it('should handle a leading forward slash on the image src', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(path);
        expect(loader({src: '/img.png'})).toBe(`${path}/tr:q-auto/img.png`);
      });
    });

    describe('options', () => {
      it('should configure PRECONNECT_CHECK_BLOCKLIST token by default', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const providers = provideImageKitLoader(path);
        expect(providers.length).toBe(2);

        const valueProvider = providers[1] as ValueProvider;
        expect(valueProvider.multi).toBeTrue();
        expect(valueProvider.useValue).toEqual([path]);
        expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
      });

      it('should configure PRECONNECT_CHECK_BLOCKLIST when the ensurePreconnect was specified',
         () => {
           const path = 'https://ik.imageengine.io/imagetest';
           const providers = provideImageKitLoader(path, {ensurePreconnect: true});
           expect(providers.length).toBe(2);

           const valueProvider = providers[1] as ValueProvider;
           expect(valueProvider.multi).toBeTrue();
           expect(valueProvider.useValue).toEqual([path]);
           expect(valueProvider.provide).toBe(PRECONNECT_CHECK_BLOCKLIST);
         });

      it('should NOT configure PRECONNECT_CHECK_BLOCKLIST disabled with the ensurePreconnect option',
         () => {
           const providers = provideImageKitLoader(
               'https://ik.imageengine.io/imagetest', {ensurePreconnect: false});
           expect(providers.length).toBe(1);
         });
    });
  });

  describe('Cloudflare loader', () => {
    function createCloudflareLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector([provideCloudflareLoader(path)]);
      return injector.get(IMAGE_LOADER);
    }
    it('should construct an image loader with the given path', () => {
      const loader = createCloudflareLoader('https://mysite.com');
      let config = {src: 'img.png'};
      expect(loader(config)).toBe('https://mysite.com/cdn-cgi/image/format=auto/img.png');
    });
    it('should construct an image loader with the given path', () => {
      const loader = createCloudflareLoader('https://mysite.com');
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe('https://mysite.com/cdn-cgi/image/format=auto,width=100/img.png');
    });
  });

  describe('loader utils', () => {
    it('should identify valid paths', () => {
      expect(isValidPath('https://cdn.imageprovider.com/image-test')).toBe(true);
      expect(isValidPath('https://cdn.imageprovider.com')).toBe(true);
      expect(isValidPath('https://imageprovider.com')).toBe(true);
    });

    it('should reject empty paths', () => {
      expect(isValidPath('')).toBe(false);
    });

    it('should reject path if it is not a URL', () => {
      expect(isValidPath('myaccount')).toBe(false);
    });

    it('should reject path if it does not include a protocol', () => {
      expect(isValidPath('myaccount.imageprovider.com')).toBe(false);
    });

    it('should reject path if is malformed', () => {
      expect(isValidPath('somepa\th.imageprovider.com? few')).toBe(false);
    });
  });
});
