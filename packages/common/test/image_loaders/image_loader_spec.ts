/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  IMAGE_LOADER,
  ImageLoader,
  ImageLoaderConfig,
  provideNetlifyLoader,
} from '../../src/directives/ng_optimized_image';
import {provideCloudflareLoader} from '../../src/directives/ng_optimized_image/image_loaders/cloudflare_loader';
import {provideCloudinaryLoader} from '../../src/directives/ng_optimized_image/image_loaders/cloudinary_loader';
import {provideImageKitLoader} from '../../src/directives/ng_optimized_image/image_loaders/imagekit_loader';
import {provideImgixLoader} from '../../src/directives/ng_optimized_image/image_loaders/imgix_loader';
import {isValidPath} from '../../src/directives/ng_optimized_image/url';
import {RuntimeErrorCode} from '../../src/errors';
import {createEnvironmentInjector, EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

const absoluteUrlError = (src: string, path: string) =>
  `NG02959: Image loader has detected a \`<img>\` tag with an invalid ` +
  `\`ngSrc\` attribute: ${src}. This image loader expects \`ngSrc\` ` +
  `to be a relative URL - however the provided value is an absolute URL. ` +
  `To fix this, provide \`ngSrc\` as a path relative to the base URL ` +
  `configured for this loader (\`${path}\`).`;

const invalidPathError = (path: string, formats: string) =>
  `NG02959: Image loader has detected an invalid path (\`${path}\`). ` +
  `To fix this, supply a path using one of the following formats: ${formats}`;

describe('Built-in image directive loaders', () => {
  describe('Imgix loader', () => {
    function createImgixLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector(
        [provideImgixLoader(path)],
        TestBed.inject(EnvironmentInjector),
      );
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

    it('should throw if an absolute URL is provided as a loader input', () => {
      const path = 'https://somesite.imgix.net';
      const src = 'https://angular.io/img.png';
      const loader = createImgixLoader(path);
      expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
    });

    it('should load a low quality image when a placeholder is requested', () => {
      const path = 'https://somesite.imgix.net';
      const loader = createImgixLoader(path);
      const config = {src: 'img.png', isPlaceholder: true};
      expect(loader(config)).toBe(`${path}/img.png?auto=format&q=20`);
    });
  });

  describe('Cloudinary loader', () => {
    function createCloudinaryLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector(
        [provideCloudinaryLoader(path)],
        TestBed.inject(EnvironmentInjector),
      );
      return injector.get(IMAGE_LOADER);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://res.cloudinary.com/mysite';
      const loader = createCloudinaryLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/image/upload/f_auto,q_auto/img.png`);
      expect(
        loader({
          src: 'marketing/img-2.png',
        }),
      ).toBe(`${path}/image/upload/f_auto,q_auto/marketing/img-2.png`);
    });

    it('should load a low quality image when a placeholder is requested', () => {
      const path = 'https://res.cloudinary.com/mysite';
      const loader = createCloudinaryLoader(path);
      const config = {src: 'img.png', isPlaceholder: true};
      expect(loader(config)).toBe(`${path}/image/upload/f_auto,q_auto:low/img.png`);
    });

    describe('input validation', () => {
      it('should throw if an absolute URL is provided as a loader input', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const src = 'https://angular.io/img.png';
        const loader = createCloudinaryLoader(path);
        expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
      });

      it('should throw if the path is invalid', () => {
        expect(() => provideCloudinaryLoader('my-cloudinary-account')).toThrowError(
          invalidPathError(
            'my-cloudinary-account',
            'https://res.cloudinary.com/mysite or https://mysite.cloudinary.com ' +
              'or https://subdomain.mysite.com',
          ),
        );
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

    describe('config validation', () => {
      it('should add the r_max cloudinary transformation to the URL when the rounded option is provided', () => {
        const path = 'https://res.cloudinary.com/mysite';
        const loader = createCloudinaryLoader(path);
        expect(loader({src: '/img.png', loaderParams: {rounded: true}})).toBe(
          `${path}/image/upload/f_auto,q_auto,r_max/img.png`,
        );
      });
    });
  });

  describe('ImageKit loader', () => {
    function createImageKitLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector(
        [provideImageKitLoader(path)],
        TestBed.inject(EnvironmentInjector),
      );
      return injector.get(IMAGE_LOADER);
    }

    it('should construct an image loader with the given path', () => {
      const path = 'https://ik.imageengine.io/imagetest';
      const loader = createImageKitLoader(path);
      expect(loader({src: 'img.png'})).toBe(`${path}/img.png`);
      expect(loader({src: 'marketing/img-2.png'})).toBe(`${path}/marketing/img-2.png`);
    });

    it('should construct an image loader with the given path', () => {
      const path = 'https://ik.imageengine.io/imagetest';
      const loader = createImageKitLoader(path);
      expect(loader({src: 'img.png', width: 100})).toBe(`${path}/tr:w-100/img.png`);
      expect(loader({src: 'marketing/img-2.png', width: 200})).toBe(
        `${path}/tr:w-200/marketing/img-2.png`,
      );
    });

    it('should load a low quality image when a placeholder is requested', () => {
      const path = 'https://ik.imageengine.io/imagetest';
      const loader = createImageKitLoader(path);

      let config: ImageLoaderConfig = {src: 'img.png', isPlaceholder: true};
      expect(loader(config)).toBe(`${path}/tr:q-20/img.png`);

      config = {src: 'img.png', isPlaceholder: true, width: 30};
      expect(loader(config)).toBe(`${path}/tr:w-30,q-20/img.png`);
    });

    describe('input validation', () => {
      it('should throw if an absolute URL is provided as a loader input', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const src = 'https://angular.io/img.png';
        const loader = createImageKitLoader(path);
        expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
      });

      it('should throw if the path is invalid', () => {
        expect(() => provideImageKitLoader('my-imagekit-account')).toThrowError(
          invalidPathError(
            'my-imagekit-account',
            'https://ik.imagekit.io/mysite or https://subdomain.mysite.com',
          ),
        );
      });

      it('should handle a trailing forward slash on the path', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(`${path}/`);
        expect(loader({src: 'img.png'})).toBe(`${path}/img.png`);
      });

      it('should handle a leading forward slash on the image src', () => {
        const path = 'https://ik.imageengine.io/imagetest';
        const loader = createImageKitLoader(path);
        expect(loader({src: '/img.png'})).toBe(`${path}/img.png`);
      });
    });
  });

  describe('Cloudflare loader', () => {
    function createCloudflareLoader(path: string): ImageLoader {
      const injector = createEnvironmentInjector(
        [provideCloudflareLoader(path)],
        TestBed.inject(EnvironmentInjector),
      );
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

    it('should throw if an absolute URL is provided as a loader input', () => {
      const path = 'https://mysite.com';
      const src = 'https://angular.io/img.png';
      const loader = createCloudflareLoader(path);
      expect(() => loader({src})).toThrowError(absoluteUrlError(src, path));
    });

    it('should load a low quality image when a placeholder is requested', () => {
      const path = 'https://mysite.com';
      const loader = createCloudflareLoader(path);
      const config = {src: 'img.png', isPlaceholder: true};
      expect(loader(config)).toBe(
        'https://mysite.com/cdn-cgi/image/format=auto,quality=20/img.png',
      );
    });
  });

  describe('Netlify loader', () => {
    function createNetlifyLoader(path?: string): ImageLoader {
      const injector = createEnvironmentInjector(
        [provideNetlifyLoader(path)],
        TestBed.inject(EnvironmentInjector),
      );
      return injector.get(IMAGE_LOADER);
    }
    it('should construct an image loader with an empty path', () => {
      const loader = createNetlifyLoader();
      let config = {src: 'img.png'};
      expect(loader(config)).toBe('/.netlify/images?url=%2Fimg.png');
    });
    it('should construct an image loader with the given path', () => {
      const loader = createNetlifyLoader('https://mysite.com');
      let config = {src: 'img.png'};
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png');
    });
    it('should construct an image loader with the given path', () => {
      const loader = createNetlifyLoader('https://mysite.com');
      const config = {src: 'img.png', width: 100};
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png&w=100');
    });

    it('should construct an image URL with custom options', () => {
      const loader = createNetlifyLoader('https://mysite.com');
      const config = {src: 'img.png', width: 100, loaderParams: {quality: 50}};
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png&w=100&q=50');
    });

    it('should construct an image with an absolute URL', () => {
      const path = 'https://mysite.com';
      const src = 'https://angular.io/img.png';
      const loader = createNetlifyLoader(path);
      expect(loader({src})).toBe(
        'https://mysite.com/.netlify/images?url=https%3A%2F%2Fangular.io%2Fimg.png',
      );
    });

    it('should warn if an unknown loader parameter is provided', () => {
      const path = 'https://mysite.com';
      const loader = createNetlifyLoader(path);
      const config = {src: 'img.png', loaderParams: {unknown: 'value'}};
      spyOn(console, 'warn');
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png');
      expect(console.warn).toHaveBeenCalledWith(
        `NG0${RuntimeErrorCode.INVALID_LOADER_ARGUMENTS}: The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`unknown\`".`,
      );
    });

    it('should load a low quality image when a placeholder is requested', () => {
      const path = 'https://mysite.com';
      const loader = createNetlifyLoader(path);
      const config = {src: 'img.png', isPlaceholder: true};
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png&q=20');
    });

    it('should not load a low quality image when a placeholder is requested with a quality param', () => {
      const path = 'https://mysite.com';
      const loader = createNetlifyLoader(path);
      const config = {src: 'img.png', isPlaceholder: true, loaderParams: {quality: 50}};
      expect(loader(config)).toBe('https://mysite.com/.netlify/images?url=%2Fimg.png&q=50');
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
