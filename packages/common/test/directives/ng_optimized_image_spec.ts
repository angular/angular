/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, PLATFORM_ID, Provider, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {isBrowser, isNode, withHead} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';
import {CommonModule, DOCUMENT, IMAGE_CONFIG, ImageConfig} from '../../index';
import {RuntimeErrorCode} from '../../src/errors';
import {PLATFORM_SERVER_ID} from '../../src/platform_id';

import {PRELOADED_IMAGES} from '../..//src/directives/ng_optimized_image/tokens';
import {
  createImageLoader,
  IMAGE_LOADER,
  ImageLoader,
  ImageLoaderConfig,
} from '../../src/directives/ng_optimized_image/image_loaders/image_loader';
import {
  ABSOLUTE_SRCSET_DENSITY_CAP,
  assertValidNgSrcset,
  DATA_URL_ERROR_LIMIT,
  DATA_URL_WARN_LIMIT,
  NgOptimizedImage,
  RECOMMENDED_SRCSET_DENSITY_CAP,
  resetImagePriorityCount,
} from '../../src/directives/ng_optimized_image/ng_optimized_image';
import {PRECONNECT_CHECK_BLOCKLIST} from '../../src/directives/ng_optimized_image/preconnect_link_checker';

describe('Image directive', () => {
  const PLACEHOLDER_BLUR_AMOUNT = 15;

  describe('preload <link> element on a server', () => {
    describe('server', () => {
      beforeEach(() => {
        globalThis['ngServerMode'] = true;
      });

      afterEach(() => {
        globalThis['ngServerMode'] = undefined;
      });

      it('should create `<link>` element when the image priority attr is true', () => {
        // Only run this test in a browser since the Node-based DOM mocks don't
        // allow to override `HTMLImageElement.prototype.setAttribute` easily.
        if (!isBrowser) return;

        const src = 'preload1/img.png';

        setupTestingModule({
          extraProviders: [
            {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
            {
              provide: IMAGE_LOADER,
              useValue: (config: ImageLoaderConfig) =>
                config.width
                  ? `https://angular.io/${config.src}?width=${config.width}`
                  : `https://angular.io/${config.src}`,
            },
          ],
        });

        const template = `<img ngSrc="${src}" width="150" height="50" priority sizes="10vw" ngSrcset="100w">`;
        TestBed.overrideComponent(TestComponent, {set: {template: template}});

        const _document = TestBed.inject(DOCUMENT);
        const _window = _document.defaultView!;
        const setAttributeSpy = spyOn(
          _window.HTMLLinkElement.prototype,
          'setAttribute',
        ).and.callThrough();

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const head = _document.head;

        const rewrittenSrc = `https://angular.io/${src}`;

        const preloadLink = head.querySelector(`link[href="${rewrittenSrc}"]`);

        expect(preloadLink).toBeTruthy();

        const [name, value] = setAttributeSpy.calls.argsFor(0);

        expect(name).toEqual('as');
        expect(value).toEqual('image');

        expect(preloadLink!.getAttribute('rel')).toEqual('preload');
        expect(preloadLink!.getAttribute('as')).toEqual('image');
        expect(preloadLink!.getAttribute('imagesizes')).toEqual('10vw');
        expect(preloadLink!.getAttribute('imagesrcset')).toEqual(`${rewrittenSrc}?width=100 100w`);
        expect(preloadLink!.getAttribute('fetchpriority')).toEqual('high');

        preloadLink!.remove();
      });

      it('should not create a preload `<link>` element when src is already preloaded.', () => {
        // Only run this test in a browser since the Node-based DOM mocks don't
        // allow to override `HTMLImageElement.prototype.setAttribute` easily.
        if (!isBrowser) return;

        const src = `preload2/img.png`;

        const rewrittenSrc = `https://angular.io/${src}`;

        setupTestingModule({
          extraProviders: [
            {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
            {
              provide: IMAGE_LOADER,
              useValue: (config: ImageLoaderConfig) => `https://angular.io/${config.src}`,
            },
          ],
        });

        const template = `<img ngSrc="${src}" width="150" height="50" priority><img ngSrc="${src}" width="150" height="50" priority>`;
        TestBed.overrideComponent(TestComponent, {set: {template: template}});

        const _document = TestBed.inject(DOCUMENT);

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const head = _document.head;

        const preloadImages = TestBed.inject(PRELOADED_IMAGES);

        expect(preloadImages.has(rewrittenSrc)).toBeTruthy();

        const preloadLinks = head.querySelectorAll(`link[href="${rewrittenSrc}"]`);

        expect(preloadLinks.length).toEqual(1);

        preloadLinks[0]!.remove();
      });

      it('should warn when the number of preloaded images is larger than the limit', () => {
        // Only run this test in a browser since the Node-based DOM mocks don't
        // allow to override `HTMLImageElement.prototype.setAttribute` easily.
        if (!isBrowser) return;

        setupTestingModule({
          extraProviders: [
            {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
            {
              provide: IMAGE_LOADER,
              useValue: (config: ImageLoaderConfig) => `https://angular.io/${config.src}`,
            },
          ],
        });

        const template = `
          <img ngSrc="preloaderror2/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror3/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderro4/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror5/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror6/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror7/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror8/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror9/img.png" width="150" height="50" priority>
          <img ngSrc="preloaderror10/img.png" width="150" height="50" priority>
        `;

        const consoleWarnSpy = spyOn(console, 'warn');
        const fixture = createTestComponent(template);
        fixture.detectChanges();
        expect(consoleWarnSpy.calls.count()).toBe(1);
        expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
          /NG02961: The `NgOptimizedImage` directive has detected that more than 5 images were marked as priority/,
        );
      });
    });

    it('should not hit max preload limit when not on the server', () => {
      // Only run this test in a browser since the Node-based DOM mocks don't
      // allow to override `HTMLImageElement.prototype.setAttribute` easily.
      if (!isBrowser) return;

      setupTestingModule({
        extraProviders: [
          {
            provide: IMAGE_LOADER,
            useValue: (config: ImageLoaderConfig) => `https://angular.io/${config.src}`,
          },
        ],
      });

      const template = `
                <img ngSrc="preloadbrowser1/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser2/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser3/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser4/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser5/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser6/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser7/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser8/img.png" width="150" height="50" priority>
                <img ngSrc="preloadbrowser9/img.png" width="150" height="50" priority>
                `;

      TestBed.overrideComponent(TestComponent, {set: {template: template}});

      const _document = TestBed.inject(DOCUMENT);

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const head = _document.head;

      const preloadImages = TestBed.inject(PRELOADED_IMAGES);

      const preloadLinks = head.querySelectorAll(`link[preload]`);

      expect(preloadImages.size).toEqual(0);
      expect(preloadLinks.length).toEqual(0);
    });
  });

  it('should set `loading` and `fetchpriority` attributes before `src`', () => {
    // Only run this test in a browser since the Node-based DOM mocks don't
    // allow to override `HTMLImageElement.prototype.setAttribute` easily.
    if (!isBrowser) return;

    setupTestingModule();

    const template = '<img ngSrc="path/img.png" width="150" height="50" priority>';
    TestBed.overrideComponent(TestComponent, {set: {template: template}});

    const _document = TestBed.inject(DOCUMENT);
    const _window = _document.defaultView!;
    const setAttributeSpy = spyOn(
      _window.HTMLImageElement.prototype,
      'setAttribute',
    ).and.callThrough();

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    const img = nativeElement.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('eager');

    let _imgInstance = null;
    let _loadingAttrId = -1;
    let _fetchpriorityAttrId = -1;
    let _srcAttrId = -1;
    const count = setAttributeSpy.calls.count();
    for (let i = 0; i < count; i++) {
      if (!_imgInstance) {
        _imgInstance = setAttributeSpy.calls.thisFor(i);
      } else if (_imgInstance !== setAttributeSpy.calls.thisFor(i)) {
        // Verify that the <img> instance is the same during the test.
        fail('Unexpected instance of a second <img> instance present in a test.');
      }

      // Note: spy.calls.argsFor(i) returns args as an array: ['src', 'eager']
      const attrName = setAttributeSpy.calls.argsFor(i)[0];
      if (attrName == 'loading') _loadingAttrId = i;
      if (attrName == 'fetchpriority') _fetchpriorityAttrId = i;
      if (attrName == 'src') _srcAttrId = i;
    }
    // Verify that both `loading` and `fetchpriority` are set *before* `src`:
    expect(_loadingAttrId).toBeGreaterThan(-1); // was actually set
    expect(_loadingAttrId).toBeLessThan(_srcAttrId); // was set after `src`

    expect(_fetchpriorityAttrId).toBeGreaterThan(-1); // was actually set
    expect(_fetchpriorityAttrId).toBeLessThan(_srcAttrId); // was set after `src`
  });

  it('should always reflect the width/height attributes if bound', () => {
    setupTestingModule();

    const template = '<img ngSrc="path/img.png" [width]="width" [height]="height">';
    const fixture = createTestComponent(template);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const img = nativeElement.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('100');
    expect(img.getAttribute('height')).toBe('50');
  });

  describe('setup error handling', () => {
    it('should throw if both `src` and `ngSrc` are present', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" src="path/img2.png" width="100" height="50">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02950: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="path/img.png"`) has detected that both ' +
          '`src` and `ngSrc` have been set. Supplying both of these attributes ' +
          'breaks lazy loading. The NgOptimizedImage directive sets `src` ' +
          'itself based on the value of `ngSrc`. To fix this, please remove ' +
          'the `src` attribute.',
      );
    });

    it('should throw if both `ngSrcet` and `srcset` is present', () => {
      setupTestingModule();

      const template =
        '<img ngSrc="img-100.png" ngSrcset="100w, 200w" srcset="img-100.png 100w, img-200.png 200w" width="100" height="50">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02951: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img-100.png"`) has detected that both ' +
          '`srcset` and `ngSrcset` have been set. Supplying both of these ' +
          'attributes breaks lazy loading. ' +
          'The NgOptimizedImage directive sets `srcset` itself based ' +
          'on the value of `ngSrcset`. To fix this, please remove the `srcset` ' +
          'attribute.',
      );
    });

    it('should throw if `ngSrc` contains a Base64-encoded image (that starts with `data:`)', () => {
      setupTestingModule();

      expect(() => {
        const template = '<img ngSrc="' + ANGULAR_LOGO_BASE64 + '" width="50" height="50">';
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive has detected that `ngSrc` ' +
          'is a Base64-encoded string (data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDov...). ' +
          'NgOptimizedImage does not support Base64-encoded strings. ' +
          'To fix this, disable the NgOptimizedImage directive for this element ' +
          'by removing `ngSrc` and using a standard `src` attribute instead.',
      );
    });

    it('should throw if `ngSrc` contains a `blob:` URL', (done) => {
      // Domino does not support canvas elements properly,
      // so run this test only in a browser.
      if (!isBrowser) {
        done();
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.toBlob(function (blob) {
        const blobURL = URL.createObjectURL(blob!);

        setupTestingModule();

        // Note: use RegExp to partially match the error message, since the blob URL
        // is created dynamically, so it might be different for each invocation.
        const errorMessageRegExp =
          /NG02952: The NgOptimizedImage directive (.*?) has detected that `ngSrc` was set to a blob URL \(blob:/;
        expect(() => {
          const template = '<img ngSrc="' + blobURL + '" width="50" height="50">';
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(errorMessageRegExp);
        done();
      });
    });

    it('should throw if `width` and `height` are not set', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02954: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that these ' +
          'required attributes are missing: "width", "height". Including "width" and ' +
          '"height" attributes will prevent image-related layout shifts. ' +
          'To fix this, include "width" and "height" attributes on the image tag or turn on ' +
          '"fill" mode with the `fill` attribute.',
      );
    });

    it('should throw if `width` is not set', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02954: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that these ' +
          'required attributes are missing: "width". Including "width" and ' +
          '"height" attributes will prevent image-related layout shifts. ' +
          'To fix this, include "width" and "height" attributes on the image tag or turn on ' +
          '"fill" mode with the `fill` attribute.',
      );
    });

    it('should throw if `width` is 0', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" width="0" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that `width` ' +
          'has an invalid value. To fix this, provide `width` as ' +
          'a number greater than 0.',
      );
    });

    it('should throw if `width` has an invalid value', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" width="10px" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that `width` ' +
          'has an invalid value. To fix this, provide `width` ' +
          'as a number greater than 0.',
      );
    });

    it('should throw if `height` is not set', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" width="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02954: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that these required ' +
          'attributes are missing: "height". Including "width" and "height" ' +
          'attributes will prevent image-related layout shifts. ' +
          'To fix this, include "width" and "height" attributes on the image tag or turn on ' +
          '"fill" mode with the `fill` attribute.',
      );
    });

    it('should throw if `height` is 0', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" width="10" height="0">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc="img.png"`) has detected that `height` ' +
          'has an invalid value. To fix this, provide `height` as a number ' +
          'greater than 0.',
      );
    });

    it('should throw if `height` has an invalid value', () => {
      setupTestingModule();

      const template = '<img ngSrc="img.png" width="10" height="10%">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element ' +
          'with the `ngSrc="img.png"`) has detected that `height` has an invalid ' +
          'value. To fix this, provide `height` as a number greater than 0.',
      );
    });

    it('should throw if `ngSrc` value is not provided', () => {
      setupTestingModule();

      const template = '<img ngSrc>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> ' +
          'element with the `ngSrc=""`) has detected that `ngSrc` has an ' +
          'invalid value (``). ' +
          'To fix this, change the value to a non-empty string.',
      );
    });

    it('should throw if `ngSrc` value is set to an empty string', () => {
      setupTestingModule();

      const template = '<img ngSrc="  ">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element ' +
          'with the `ngSrc="  "`) has detected that `ngSrc` has an invalid value ' +
          '(`  `). To fix this, change the value to a non-empty string.',
      );
    });

    describe('invalid `ngSrcset` values', () => {
      const mockDirectiveInstance = {ngSrc: 'img.png'} as NgOptimizedImage;

      it('should throw for empty ngSrcSet', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return window.location.origin + `/path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img ngSrc="img" ngSrcset="" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          'NG02952: The NgOptimizedImage directive (activated on an <img> ' +
            'element with the `ngSrc="img"`) has detected that `ngSrcset` ' +
            'has an invalid value (``). ' +
            'To fix this, change the value to a non-empty string.',
        );
      });

      it('should throw for invalid ngSrcSet', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return window.location.origin + `/path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img ngSrc="img" ngSrcset="100q, 200q" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          'NG02952: The NgOptimizedImage directive (activated on an <img> element ' +
            'with the `ngSrc="img"`) has detected that `ngSrcset` has an invalid value ' +
            '(`100q, 200q`). To fix this, supply `ngSrcset` using a comma-separated list ' +
            'of one or more width descriptors (e.g. "100w, 200w") or density descriptors ' +
            '(e.g. "1x, 2x").',
        );
      });

      it('should throw if ngSrcset exceeds the density cap', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return window.location.origin + `/path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img ngSrc="img" ngSrcset="1x, 2x, 3x, 4x, 5x" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          `NG0${RuntimeErrorCode.INVALID_INPUT}: The NgOptimizedImage directive (activated on an <img> element with the \`ngSrc="img"\`) ` +
            `has detected that the \`ngSrcset\` contains an unsupported image density:` +
            `\`1x, 2x, 3x, 4x, 5x\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`,
        );
      });

      it('should throw if ngSrcset exceeds the density cap with multiple digits', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return window.location.origin + `/path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img ngSrc="img" ngSrcset="1x, 200x" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          `NG0${RuntimeErrorCode.INVALID_INPUT}: The NgOptimizedImage directive (activated on an <img> element with the \`ngSrc="img"\`) ` +
            `has detected that the \`ngSrcset\` contains an unsupported image density:` +
            `\`1x, 200x\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`,
        );
      });

      it('should throw if width srcset is missing a comma', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '100w 200w');
        }).toThrowError();
      });

      it('should throw if density srcset is missing a comma', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '1x 2x');
        }).toThrowError();
      });

      it('should throw if density srcset has too many digits', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '100x, 2x');
        }).toThrowError();
      });

      it('should throw if width srcset includes a file name', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, 'a.png 100w, b.png 200w');
        }).toThrowError();
      });

      it('should throw if density srcset includes a file name', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, 'a.png 1x, b.png 2x');
        }).toThrowError();
      });

      it('should throw if srcset starts with a letter', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, 'a100w, 200w');
        }).toThrowError();
      });

      it('should throw if srcset starts with another non-digit', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '--100w, 200w');
        }).toThrowError();
      });

      it('should throw if first descriptor in srcset is junk', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, 'foo, 1x');
        }).toThrowError();
      });

      it('should throw if later descriptors in srcset are junk', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '100w, foo');
        }).toThrowError();
      });

      it('should throw if srcset has a density descriptor after a width descriptor', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '100w, 1x');
        }).toThrowError();
      });

      it('should throw if srcset has a width descriptor after a density descriptor', () => {
        expect(() => {
          assertValidNgSrcset(mockDirectiveInstance, '1x, 200w');
        }).toThrowError();
      });
    });

    const inputs = [
      ['width', 10],
      ['height', 20],
      ['priority', true],
      ['fill', true],
      ['loading', true],
      ['sizes', '90vw'],
      ['disableOptimizedSrcset', true],
      ['loaderParams', '{foo: "test1"}'],
    ];
    inputs.forEach(([inputName, value]) => {
      it(`should throw if the \`${inputName}\` input changed after directive initialized the input`, () => {
        @Component({
          selector: 'test-cmp',
          template: `<img
            [ngSrc]="ngSrc"
            [width]="width"
            [height]="height"
            [priority]="priority"
            [fill]="fill"
            [loading]="loading"
            [sizes]="sizes"
            [disableOptimizedSrcset]="disableOptimizedSrcset"
            [loaderParams]="loaderParams"
          />`,
          standalone: false,
        })
        class TestComponent {
          width = 100;
          height = 50;
          ngSrc = 'img.png';
          priority = false;
          fill = false;
          loading = false;
          sizes = '100vw';
          disableOptimizedSrcset = false;
          loaderParams = {bar: 'test2'};
        }

        setupTestingModule({component: TestComponent});

        // Initial render
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const expectedErrorMessage = //
          `NG02953: The NgOptimizedImage directive (.*)? ` +
          `has detected that \`${inputName}\` was updated after initialization`;
        expect(() => {
          // Update input (expect to throw)
          (fixture.componentInstance as unknown as {[key: string]: unknown})[inputName as string] =
            value;
          fixture.detectChanges();
        }).toThrowError(new RegExp(expectedErrorMessage));
      });
    });
    it(`should not throw if ngSrc changed after directive is initialized`, () => {
      @Component({
        selector: 'test-cmp',
        template: `<img
          [ngSrc]="ngSrc"
          [width]="width"
          [height]="height"
          [loading]="loading"
          [sizes]="sizes"
        />`,
        standalone: false,
      })
      class TestComponent {
        width = 100;
        height = 50;
        ngSrc = 'img.png';
        loading = false;
        sizes = '100vw';
      }

      setupTestingModule({component: TestComponent});

      // Initial render
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(() => {
        fixture.componentInstance.ngSrc = 'newImg.png';
        fixture.detectChanges();
      }).not.toThrowError(new RegExp('was updated after initialization'));
    });
    it('should accept a safeUrl ngSrc value', () => {
      @Component({
        selector: 'test-cmp',
        template: `<img [ngSrc]="bypassImage" width="400" height="600" />`,
        standalone: false,
      })
      class TestComponent {
        rawImage = `javascript:alert("Hi there")`;
        bypassImage: SafeResourceUrl;
        constructor(private sanitizer: DomSanitizer) {
          this.bypassImage = sanitizer.bypassSecurityTrustResourceUrl(this.rawImage);
        }
      }
      setupTestingModule({component: TestComponent});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      let nativeElement = fixture.nativeElement as HTMLElement;
      let img = nativeElement.querySelector('img')!;
      expect(img.src).toContain(`${IMG_BASE_URL}/javascript:alert`);
    });
  });

  describe('lazy loading', () => {
    it('should eagerly load priority images', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50" priority>';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('should lazily load non-priority images', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  describe('loading attribute', () => {
    it('should override the default loading behavior for non-priority images', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50" loading="eager">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('should throw if used with priority images', () => {
      setupTestingModule();

      const template =
        '<img ngSrc="path/img.png" width="150" height="50" loading="eager" priority>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element ' +
          'with the `ngSrc="path/img.png"`) has detected that the `loading` attribute ' +
          'was used on an image that was marked "priority". Setting `loading` on priority ' +
          'images is not allowed because these images will always be eagerly loaded. ' +
          'To fix this, remove the “loading” attribute from the priority image.',
      );
    });

    it('should support setting loading priority to "auto"', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50" loading="auto">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('auto');
    });

    it('should throw for invalid loading inputs', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="150" loading="fast">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element ' +
          'with the `ngSrc="path/img.png"`) has detected that the `loading` attribute ' +
          'has an invalid value (`fast`). To fix this, provide a valid value ("lazy", ' +
          '"eager", or "auto").',
      );
    });
  });

  describe('fetch priority', () => {
    it('should be "high" for priority images', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50" priority>';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('fetchpriority')).toBe('high');
    });

    it('should be "auto" for non-priority images', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('fetchpriority')).toBe('auto');
    });

    it(
      'should log a warning if the priority attribute is used too often',
      withHead('<link rel="preconnect" href="https://angular.io/">', async () => {
        // This test is running both on server and in the browser.
        globalThis['ngServerMode'] = !isBrowser;

        // We need to reset the count as previous test might have incremented it already
        resetImagePriorityCount();

        const imageLoader = () => {
          // We need something different from the `localhost` (as we don't want to produce
          // a preconnect warning for local environments).
          return 'https://angular.io/assets/images/logos/path/img.png';
        };

        setupTestingModule({imageLoader});

        // 11 priority attributes, threshold is 10
        const template = `
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      <img ngSrc="path/img.png" width="150" height="50" priority>
      `;
        const consoleWarnSpy = spyOn(console, 'warn');

        const fixture = createTestComponent(template);
        fixture.detectChanges();

        await fixture.whenStable();

        // trick to wait for the whenStable() to fire in the directive
        await Promise.resolve();

        if (isBrowser) {
          expect(consoleWarnSpy.calls.count()).toBe(1);
          expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
            new RegExp(`NG0${RuntimeErrorCode.TOO_MANY_PRIORITY_ATTRIBUTES}`),
          );
        } else {
          // The warning is only logged on browsers
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }

        globalThis['ngServerMode'] = undefined;
      }),
    );
  });

  describe('meta data', () => {
    it('should add a data attribute to the element for identification', () => {
      setupTestingModule();
      const template = '<img ngSrc="a.png" width="100" height="50">';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('ng-img')).not.toBeNull();
    });
    it('should add a data attribute to the element for identification, when ngSrc bound', () => {
      setupTestingModule();
      const template = `<img [ngSrc]="'a.png'" width="100" height="50">`;

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('ng-img')).not.toBeNull();
    });
  });

  describe('fill mode', () => {
    it('should allow unsized images in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" fill>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).not.toThrow();
    });
    it('should throw if width is provided for fill mode image', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" width="500" fill>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element with the ' +
          '`ngSrc="path/img.png"`) has detected that the attributes `height` and/or `width` ' +
          'are present along with the `fill` attribute. Because `fill` mode causes an image ' +
          'to fill its containing element, the size attributes have no effect and should be removed.',
      );
    });
    it('should throw if height is provided for fill mode image', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" height="500" fill>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        'NG02952: The NgOptimizedImage directive (activated on an <img> element with the ' +
          '`ngSrc="path/img.png"`) has detected that the attributes `height` and/or `width` ' +
          'are present along with the `fill` attribute. Because `fill` mode causes an image ' +
          'to fill its containing element, the size attributes have no effect and should be removed.',
      );
    });
    it('should apply appropriate styles in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" fill>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('style')?.replace(/\s/g, '')).toMatch(
        'position:absolute;width:100%;height:100%;inset:0',
      );
    });
    it('should augment existing styles in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" style="border-radius: 5px; padding: 10px" fill>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('style')?.replace(/\s/g, '')).toMatch(
        'border-radius:5px;padding:10px;position:absolute;width:100%;height:100%;inset:0',
      );
    });
    it('should not add fill styles if not in fill mode', () => {
      setupTestingModule();

      const template =
        '<img ngSrc="path/img.png" width="400" height="300" style="position: relative; border-radius: 5px">';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('style')?.replace(/\s/g, '')).toBe(
        'position:relative;border-radius:5px;',
      );
    });
    it('should add default sizes value in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" fill priority>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('sizes')).toBe('100vw');
    });
    it('should add auto sizes to default in fill mode when lazy', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" fill>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('sizes')).toBe('auto, 100vw');
    });
    it('should not overwrite sizes value in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" sizes="50vw" fill loading="eager">';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('sizes')).toBe('50vw');
    });
    it('should prepend "auto" to sizes in fill mode when lazy', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" sizes="50vw" fill>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('sizes')).toBe('auto, 50vw');
    });
    it('should cause responsive srcset to be generated in fill mode', () => {
      setupTestingModule();

      const template = '<img ngSrc="path/img.png" fill>';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('srcset')).toBe(
        `${IMG_BASE_URL}/path/img.png 640w, ${IMG_BASE_URL}/path/img.png 750w, ${IMG_BASE_URL}/path/img.png 828w, ` +
          `${IMG_BASE_URL}/path/img.png 1080w, ${IMG_BASE_URL}/path/img.png 1200w, ${IMG_BASE_URL}/path/img.png 1920w, ` +
          `${IMG_BASE_URL}/path/img.png 2048w, ${IMG_BASE_URL}/path/img.png 3840w`,
      );
    });
  });

  describe('placeholder attribute', () => {
    const imageLoader = (config: ImageLoaderConfig) => {
      let paramsString = '';
      if (config.isPlaceholder) {
        paramsString = 'ph=true';
      }
      let queryString = `${config.width ? 'w=' + config.width + '&' : ''}${paramsString}`;
      return `${IMG_BASE_URL}/${config.src}?${queryString}`;
    };

    it('should add background size, position, and repeat styling if the placeholder attribute is present', () => {
      setupTestingModule();
      const template =
        '<img ngSrc="path/img.png" width="400" height="300" placeholder="path/img.png" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      expect(styles.get('background-size')).toBe('cover');
      expect(styles.get('background-position')).toBe('50%50%');
      expect(styles.get('background-repeat')).toBe('no-repeat');
    });

    it('should not add background styles if the placeholder attribute is not present', () => {
      setupTestingModule();
      const template = '<img ngSrc="path/img.png" width="400" height="300">';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      expect(styles.get('background-size')).toBeUndefined();
      expect(styles.get('background-position')).toBeUndefined();
      expect(styles.get('background-repeat')).toBeUndefined();
      expect(styles.get('background-image')).toBeUndefined();
    });

    it('should add a background-image tag when placeholder is provided as a boolean', () => {
      setupTestingModule({imageLoader});
      const template = '<img ngSrc="path/img.png" width="400" height="300" placeholder="true" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      // Double quotes removed to account for different browser behavior.
      expect(styles.get('background-image')?.replace(/"/g, '')).toBe(
        `url(${IMG_BASE_URL}/path/img.png?w=30&ph=true)`,
      );
    });

    if (!isNode) {
      // DataURLs get stripped from background-image attribute in Node, but not browsers.
      it('should add a background-image tag when placeholder is provided as a data URL', () => {
        setupTestingModule({imageLoader});
        const template =
          '<img ngSrc="path/img.png" width="400" height="300" placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEU" />';

        const fixture = createTestComponent(template);
        fixture.detectChanges();
        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        // Double quotes removed to account for different browser behavior.
        expect(img.getAttribute('style')?.replace(/"/g, '').replace(/\s/g, '')).toBe(
          `background-size:cover;background-position:50%50%;background-repeat:no-repeat;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEU);filter:blur(${PLACEHOLDER_BLUR_AMOUNT}px);`,
        );
      });
    }

    it('should add a background-image tag when placeholder is provided as a URL', () => {
      setupTestingModule({imageLoader});
      const template =
        '<img ngSrc="path/img.png" width="400" height="300" placeholder="https://mysite.com/assets/my-image.png" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      // Double quotes removed to account for different browser behavior.
      expect(img.getAttribute('style')?.replace(/"/g, '').replace(/\s/g, '')).toBe(
        `background-size:cover;background-position:50%50%;background-repeat:no-repeat;background-image:url(https://mysite.com/assets/my-image.png);filter:blur(${PLACEHOLDER_BLUR_AMOUNT}px);`,
      );
    });

    // DataURLs get stripped from background-image attribute in Node, but not browsers.
    it('should add a background-image tag when placeholder is provided as relative URL', () => {
      setupTestingModule({imageLoader});
      const template =
        '<img ngSrc="path/img.png" width="400" height="300" placeholder="../../assets/my-image.png" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      // Double quotes removed to account for different browser behavior.
      expect(img.getAttribute('style')?.replace(/"/g, '').replace(/\s/g, '')).toBe(
        `background-size:cover;background-position:50%50%;background-repeat:no-repeat;background-image:url(../../assets/my-image.png);filter:blur(${PLACEHOLDER_BLUR_AMOUNT}px);`,
      );
    });

    it('should add a background-image tag when placeholder is provided without value', () => {
      setupTestingModule({imageLoader});
      const template = '<img ngSrc="path/img.png" width="400" height="300" placeholder />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      // Double quotes removed to account for different browser behavior.
      expect(styles.get('background-image')?.replace(/"/g, '')).toBe(
        `url(${IMG_BASE_URL}/path/img.png?w=30&ph=true)`,
      );
    });

    it('should replace the placeholder with the actual image on load', () => {
      setupTestingModule();
      const template = '<img ngSrc="path/img.png" width="400" height="300" placeholder="true" />';
      const fixture = createTestComponent(template, ChangeDetectionStrategy.OnPush);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(parseInlineStyles(img).has('background-image')).toBe(true);
      img.dispatchEvent(new Event('load'));
      fixture.detectChanges();
      expect(parseInlineStyles(img).has('background-image')).toBe(false);
    });

    it('should use the placeholderResolution set in imageConfig', () => {
      const imageConfig = {
        placeholderResolution: 30,
      };
      setupTestingModule({imageLoader, imageConfig});
      const template = '<img ngSrc="path/img.png" width="400" height="300" placeholder />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      // Double quotes removed to account for different browser behavior.
      expect(styles.get('background-image')?.replace(/"/g, '')).toBe(
        `url(${IMG_BASE_URL}/path/img.png?w=30&ph=true)`,
      );
    });

    it('should apply a background blur to images with a placeholder', () => {
      setupTestingModule({imageLoader});
      const template =
        '<img ngSrc="path/img.png" width="400" height="300" placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEU" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      expect(styles.get('filter')).toBe(`blur(${PLACEHOLDER_BLUR_AMOUNT}px)`);
    });

    it('should not apply a background blur to placeholders with blur=false', () => {
      setupTestingModule({imageLoader});
      const template =
        '<img ngSrc="path/img.png" width="400" height="300" placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEU" [placeholderConfig]="{blur: false}" />';

      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      const styles = parseInlineStyles(img);
      expect(styles.get('filter')).toBeUndefined();
    });

    it('should throw if placeholderConfig is provided without placeholder', () => {
      setupTestingModule();

      const template =
        '<img ngSrc="path/img.png" width="400" height="300" [placeholderConfig]="{blur: false}">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        `NG02952: The NgOptimizedImage directive has detected that \`placeholderConfig\` options were ` +
          `provided for an image that does not use the \`placeholder\` attribute, and will have no effect.`,
      );
    });

    it('should throw if placeholderConfig with blur=true is provided without placeholder', () => {
      setupTestingModule();

      const template =
        '<img ngSrc="path/img.png" width="400" height="300" [placeholderConfig]="{blur: true}">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        `NG02952: The NgOptimizedImage directive has detected that \`placeholderConfig\` options were ` +
          `provided for an image that does not use the \`placeholder\` attribute, and will have no effect.`,
      );
    });

    it('should throw if there is no image loader but `ngSrcset` is present', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="img.png" width="150" height="50" placeholder="true">`;
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        `NG0${RuntimeErrorCode.MISSING_NECESSARY_LOADER}: The NgOptimizedImage directive (activated on an <img> element with the \`ngSrc="img.png"\`) ` +
          `has detected that the \`placeholder\` attribute is set to true but no image loader is configured (i.e. the default one is being used), which ` +
          `would result in the same image being used for the primary image and its placeholder. To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`,
      );
    });

    it('should throw if a very large inline placeholder is supplied', () => {
      setupTestingModule();

      const template = `<img ngSrc="path/img.png" width="400" height="300" placeholder="data:image/png;base64,${'a'.repeat(
        DATA_URL_ERROR_LIMIT + 100,
      )}">`;
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      }).toThrowError(
        `NG0${RuntimeErrorCode.OVERSIZED_PLACEHOLDER}: The NgOptimizedImage directive (activated on an <img> element with the \`ngSrc="path/img.png"\`) ` +
          `has detected that the \`placeholder\` attribute is set to a data URL which is longer than ${DATA_URL_ERROR_LIMIT} characters. This is strongly ` +
          `discouraged, as large inline placeholders directly increase the bundle size of Angular and hurt page load performance. To fix this, generate a smaller data URL placeholder.`,
      );
    });
    it('should warn if a large inline placeholder is supplied', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="path/img.png" width="400" height="300" placeholder="data:image/png;base64,${'a'.repeat(
        DATA_URL_WARN_LIMIT + 100,
      )}">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
        `NG0${RuntimeErrorCode.OVERSIZED_PLACEHOLDER}: The NgOptimizedImage directive (activated on an <img> element with the \`ngSrc="path/img.png"\`) ` +
          `has detected that the \`placeholder\` attribute is set to a data URL which is longer than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, ` +
          `as large inline placeholders directly increase the bundle size of Angular and hurt page load performance. For better loading ` +
          `performance, generate a smaller data URL placeholder.`,
      );
    });

    if (isBrowser) {
      describe('browser', () => {
        beforeEach(() => {
          globalThis['ngServerMode'] = false;
        });

        afterEach(() => {
          globalThis['ngServerMode'] = undefined;
        });

        it('should throw if the placeholder height exceeds the threshold', () => {
          setUpModuleNoLoader();

          const template = `<img ngSrc="path/img.png" width="100" height="100" style="width:1001px; height: 300px" placeholder="data:image/png;base64,${'a'.repeat(
            100,
          )}">`;

          const consoleWarnSpy = spyOn(console, 'warn');
          const fixture = createTestComponent(template);
          fixture.detectChanges();
          expect(consoleWarnSpy.calls.count()).toBe(1);
          expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
            new RegExp(`NG0${RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED}:`),
          );
        });

        it('should throw if the placeholder width exceeds the threshold', () => {
          setUpModuleNoLoader();

          const template = `<img ngSrc="path/img.png" width="100" height="100" style="height:1001px; width: 300px" placeholder="data:image/png;base64,${'a'.repeat(
            100,
          )}">`;

          const consoleWarnSpy = spyOn(console, 'warn');
          const fixture = createTestComponent(template);
          fixture.detectChanges();
          expect(consoleWarnSpy.calls.count()).toBe(1);
          expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
            new RegExp(`NG0${RuntimeErrorCode.PLACEHOLDER_DIMENSION_LIMIT_EXCEEDED}:`),
          );
        });
      });
    }
  });

  describe('preconnect detector', () => {
    const imageLoader = () => {
      // We need something different from the `localhost` (as we don't want to produce
      // a preconnect warning for local environments).
      return 'https://angular.io/assets/images/logos/angular/angular.svg';
    };

    it(
      'should log a warning if there is no preconnect link for a priority image',
      withHead('', () => {
        // The warning is only logged on the client
        if (!isBrowser) return;

        setupTestingModule({imageLoader});

        const consoleWarnSpy = spyOn(console, 'warn');
        const template = '<img ngSrc="a.png" width="100" height="50" priority>';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        expect(consoleWarnSpy.calls.count()).toBe(1);
        expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
          'NG02956: The NgOptimizedImage directive (activated on an <img> element ' +
            'with the `ngSrc="a.png"`) has detected that there is no preconnect tag ' +
            'present for this image. Preconnecting to the origin(s) that serve ' +
            'priority images ensures that these images are delivered as soon as ' +
            'possible. To fix this, please add the following element into the <head> ' +
            'of the document:' +
            '\n  <link rel="preconnect" href="https://angular.io">',
        );
      }),
    );

    it(
      'should not log a warning if there is no preconnect link, but the image is not set as a priority',
      withHead('', () => {
        setupTestingModule({imageLoader});

        const consoleWarnSpy = spyOn(console, 'warn');
        const template = '<img ngSrc="a.png" width="100" height="50">';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        // Expect no warnings in the console.
        expect(consoleWarnSpy.calls.count()).toBe(0);
      }),
    );

    it(
      "should log a warning if there is a preconnect, but it doesn't match the priority image",
      withHead('<link rel="preconnect" href="http://angular.io">', () => {
        // The warning is only logged on the client
        if (!isBrowser) return;

        setupTestingModule({imageLoader});

        const consoleWarnSpy = spyOn(console, 'warn');
        const template = '<img ngSrc="a.png" width="100" height="50" priority>';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        expect(consoleWarnSpy.calls.count()).toBe(1);
        expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
          'NG02956: The NgOptimizedImage directive (activated on an <img> element ' +
            'with the `ngSrc="a.png"`) has detected that there is no preconnect tag ' +
            'present for this image. Preconnecting to the origin(s) that serve priority ' +
            'images ensures that these images are delivered as soon as possible. ' +
            'To fix this, please add the following element into the <head> of the document:' +
            '\n  <link rel="preconnect" href="https://angular.io">',
        );
      }),
    );

    it(
      'should log a warning if there is no matching preconnect link for a priority image, but there is a preload tag',
      withHead(
        '<link rel="preload" href="https://angular.io/assets/images/logos/angular/angular.svg" as="image">',
        () => {
          // The warning is only logged on the client
          if (!isBrowser) return;

          setupTestingModule({imageLoader});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          expect(consoleWarnSpy.calls.count()).toBe(1);
          expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
            'NG02956: The NgOptimizedImage directive (activated on an <img> element ' +
              'with the `ngSrc="a.png"`) has detected that there is no preconnect tag ' +
              'present for this image. Preconnecting to the origin(s) that serve priority ' +
              'images ensures that these images are delivered as soon as possible. ' +
              'To fix this, please add the following element into the <head> of the document:' +
              '\n  <link rel="preconnect" href="https://angular.io">',
          );
        },
      ),
    );

    it(
      'should not log a warning if there is a matching preconnect link for a priority image (with an extra `/` at the end)',
      withHead('<link rel="preconnect" href="https://angular.io/">', () => {
        setupTestingModule({imageLoader});

        const consoleWarnSpy = spyOn(console, 'warn');
        const template = '<img ngSrc="a.png" width="100" height="50" priority>';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        // Expect no warnings in the console.
        expect(consoleWarnSpy.calls.count()).toBe(0);
      }),
    );

    ['localhost', '127.0.0.1', '0.0.0.0'].forEach((blocklistedHostname) => {
      it(
        `should not log a warning if an origin domain is blocklisted ` +
          `(checking ${blocklistedHostname})`,
        withHead('', () => {
          const imageLoader = () => {
            return `http://${blocklistedHostname}/a.png`;
          };
          setupTestingModule({imageLoader});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          // Expect no warnings in the console.
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }),
      );
    });

    describe('PRECONNECT_CHECK_BLOCKLIST token', () => {
      it(
        `should allow passing host names`,
        withHead('', () => {
          const providers = [{provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'angular.io'}];
          setupTestingModule({imageLoader, extraProviders: providers});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          // Expect no warnings in the console.
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }),
      );

      it(
        `should allow passing origins`,
        withHead('', () => {
          const providers = [{provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://angular.io'}];
          setupTestingModule({imageLoader, extraProviders: providers});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          // Expect no warnings in the console.
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }),
      );

      it(
        `should allow passing arrays of host names`,
        withHead('', () => {
          const providers = [
            {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: ['https://angular.io']},
          ];
          setupTestingModule({imageLoader, extraProviders: providers});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          // Expect no warnings in the console.
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }),
      );

      it(
        `should allow passing nested arrays of host names`,
        withHead('', () => {
          const providers = [
            {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [['https://angular.io']]},
          ];
          setupTestingModule({imageLoader, extraProviders: providers});

          const consoleWarnSpy = spyOn(console, 'warn');
          const template = '<img ngSrc="a.png" width="100" height="50" priority>';
          const fixture = createTestComponent(template);
          fixture.detectChanges();

          // Expect no warnings in the console.
          expect(consoleWarnSpy.calls.count()).toBe(0);
        }),
      );
    });
  });

  describe('loaders', () => {
    const imageLoaderWithData = (config: ImageLoaderConfig) => {
      let paramsString = '';
      if (config.loaderParams) {
        paramsString = Object.entries(config.loaderParams)
          .map((entry) => `${entry[0]}=${entry[1]}`)
          .join('&');
      }
      let queryString = `${config.width ? 'w=' + config.width + '&' : ''}${paramsString}`;
      return `${config.src}?${queryString}`;
    };

    // Test complex loaderParams schema with nesting:
    // loaderParams = {
    //   transforms1: {example1: "foo"},
    //   transforms2: {example2: "bar"}
    // }
    const nestedImageLoader = (config: ImageLoaderConfig) => {
      return `${config.src}/${config.loaderParams?.['transforms1'].example1}/${config.loaderParams?.['transforms2'].example2}`;
    };

    it('should set `src` to match `ngSrc` if image loader is not provided', () => {
      setupTestingModule();

      const template = `<img ngSrc="${IMG_BASE_URL}/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
    });

    it('should warn if there is no image loader but using Imgix URL', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="https://some.imgix.net/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
        /your images may be hosted on the Imgix CDN/,
      );
    });

    it('should warn if there is no image loader but using ImageKit URL', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="https://some.imagekit.io/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
        /your images may be hosted on the ImageKit CDN/,
      );
    });

    it('should warn if there is no image loader but using Cloudinary URL', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="https://some.cloudinary.com/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
        /your images may be hosted on the Cloudinary CDN/,
      );
    });

    it('should warn if there is no image loader but using Netlify URL', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="https://example.netlify.app/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toMatch(
        /your images may be hosted on the Netlify CDN/,
      );
    });

    it('should NOT warn if there is a custom loader but using CDN URL', () => {
      setupTestingModule();

      const template = `<img ngSrc="https://some.cloudinary.com/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(0);
    });

    it('should warn if there is no image loader but `ngSrcset` is present', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="img.png" ngSrcset="100w, 200w" width="150" height="50">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
        `NG0${RuntimeErrorCode.MISSING_NECESSARY_LOADER}: The NgOptimizedImage directive (activated on an <img> element ` +
          'with the `ngSrc="img.png"`) has detected that the `ngSrcset` attribute is ' +
          'present but no image loader is configured (i.e. the default one is being used), ' +
          `which would result in the same image being used for all configured sizes. ` +
          'To fix this, provide a loader or remove the `ngSrcset` attribute from the image.',
      );
    });

    it('should warn if there is no image loader but `loaderParams` is present', () => {
      setUpModuleNoLoader();

      const template = `<img ngSrc="img.png" width="150" height="50" [loaderParams]="{foo: 'test'}">`;
      const fixture = createTestComponent(template);
      const consoleWarnSpy = spyOn(console, 'warn');
      fixture.detectChanges();

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toBe(
        `NG0${RuntimeErrorCode.MISSING_NECESSARY_LOADER}: The NgOptimizedImage directive (activated on an <img> element ` +
          'with the `ngSrc="img.png"`) has detected that the `loaderParams` attribute is ' +
          'present but no image loader is configured (i.e. the default one is being used), ' +
          `which means that the loaderParams data will not be consumed and will not affect the URL. ` +
          'To fix this, provide a custom loader or remove the `loaderParams` attribute from the image.',
      );
    });

    it('should set `src` using the image loader provided via the `IMAGE_LOADER` token to compose src URL', () => {
      const imageLoader = (config: ImageLoaderConfig) => `${IMG_BASE_URL}/${config.src}`;
      setupTestingModule({imageLoader});

      const template = `
         <img ngSrc="img.png" width="150" height="50">
         <img ngSrc="img-2.png" width="150" height="50">
       `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src.trim()).toBe(`${IMG_BASE_URL}/img.png`);
      expect(imgs[1].src.trim()).toBe(`${IMG_BASE_URL}/img-2.png`);
    });

    it('should use the image loader to update `src` if `ngSrc` updated', () => {
      @Component({
        selector: 'test-cmp',
        template: `<img [ngSrc]="ngSrc" width="300" height="300" />`,
        standalone: false,
      })
      class TestComponent {
        ngSrc = `img.png`;
      }
      const imageLoader = (config: ImageLoaderConfig) => `${IMG_BASE_URL}/${config.src}`;
      setupTestingModule({imageLoader, component: TestComponent});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      let nativeElement = fixture.nativeElement as HTMLElement;
      let imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src).toBe(`${IMG_BASE_URL}/img.png`);

      fixture.componentInstance.ngSrc = 'updatedImg.png';
      fixture.detectChanges();
      expect(imgs[0].src).toBe(`${IMG_BASE_URL}/updatedImg.png`);
    });

    it('should use the image loader to update `srcset` if `ngSrc` updated', () => {
      @Component({
        selector: 'test-cmp',
        template: `<img [ngSrc]="ngSrc" width="300" height="300" sizes="100vw" />`,
        standalone: false,
      })
      class TestComponent {
        ngSrc = `img.png`;
      }
      const imageLoader = (config: ImageLoaderConfig) => {
        const width = config.width ? `?w=${config.width}` : ``;
        return `${IMG_BASE_URL}/${config.src}${width}`;
      };
      setupTestingModule({imageLoader, component: TestComponent});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      let nativeElement = fixture.nativeElement as HTMLElement;
      let imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].getAttribute('srcset')).toBe(
        `${IMG_BASE_URL}/img.png?w=640 640w, ${IMG_BASE_URL}/img.png?w=750 750w, ${IMG_BASE_URL}/img.png?w=828 828w, ${IMG_BASE_URL}/img.png?w=1080 1080w, ${IMG_BASE_URL}/img.png?w=1200 1200w, ${IMG_BASE_URL}/img.png?w=1920 1920w, ${IMG_BASE_URL}/img.png?w=2048 2048w, ${IMG_BASE_URL}/img.png?w=3840 3840w`,
      );

      fixture.componentInstance.ngSrc = 'updatedImg.png';
      nativeElement = fixture.nativeElement as HTMLElement;
      imgs = nativeElement.querySelectorAll('img')!;
      fixture.detectChanges();
      expect(imgs[0].getAttribute('srcset')).toBe(
        `${IMG_BASE_URL}/updatedImg.png?w=640 640w, ${IMG_BASE_URL}/updatedImg.png?w=750 750w, ${IMG_BASE_URL}/updatedImg.png?w=828 828w, ${IMG_BASE_URL}/updatedImg.png?w=1080 1080w, ${IMG_BASE_URL}/updatedImg.png?w=1200 1200w, ${IMG_BASE_URL}/updatedImg.png?w=1920 1920w, ${IMG_BASE_URL}/updatedImg.png?w=2048 2048w, ${IMG_BASE_URL}/updatedImg.png?w=3840 3840w`,
      );
    });

    it('should pass absolute URLs defined in the `ngSrc` to custom image loaders provided via the `IMAGE_LOADER` token', () => {
      const imageLoader = (config: ImageLoaderConfig) => `${config.src}?rewritten=true`;
      setupTestingModule({imageLoader});

      const template = `
            <img ngSrc="${IMG_BASE_URL}/img.png" width="150" height="50">
          `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src.trim()).toBe(`${IMG_BASE_URL}/img.png?rewritten=true`);
    });

    it('should pass data payload from loaderParams to custom image loaders', () => {
      setupTestingModule({imageLoader: imageLoaderWithData});
      const template = `
        <img ngSrc="${IMG_BASE_URL}/img.png" width="150" height="50"
          [loaderParams]="{testProp1: 'testValue1', testProp2: 'testValue2'}" />
      `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src).toBe(`${IMG_BASE_URL}/img.png?testProp1=testValue1&testProp2=testValue2`);
    });

    it('should pass nested data payloads from loaderParams to custom image loaders', () => {
      @Component({
        selector: 'test-cmp',
        template: `<img
          [ngSrc]="ngSrc"
          [width]="width"
          [height]="height"
          [loaderParams]="params"
        />`,
        standalone: false,
      })
      class TestComponent {
        ngSrc = `${IMG_BASE_URL}/img.png`;
        width = 300;
        height = 300;
        params = {transforms1: {example1: 'foo'}, transforms2: {example2: 'bar'}};
      }
      setupTestingModule({imageLoader: nestedImageLoader, component: TestComponent});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src).toBe(`${IMG_BASE_URL}/img.png/foo/bar`);
    });

    it('should pass data payload from loaderParams to loader when generating srcsets', () => {
      setupTestingModule({imageLoader: imageLoaderWithData});
      const template = `
        <img ngSrc="${IMG_BASE_URL}/img.png" width="150" height="50"
          [loaderParams]="{testProp1: 'testValue1', testProp2: 'testValue2'}" />
      `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].srcset).toBe(
        `${IMG_BASE_URL}/img.png?w=150&testProp1=testValue1&testProp2=testValue2 1x, ${IMG_BASE_URL}/img.png?w=300&testProp1=testValue1&testProp2=testValue2 2x`,
      );
    });

    it('should pass data payload from loaderParams to loader when generating responsive srcsets', () => {
      setupTestingModule({imageLoader: imageLoaderWithData});
      const template = `
        <img ngSrc="${IMG_BASE_URL}/img.png" width="150" height="50" sizes="100vw"
          [loaderParams]="{testProp1: 'testValue1', testProp2: 'testValue2'}" />
      `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].srcset).toBe(
        `${IMG_BASE_URL}/img.png?w=640&testProp1=testValue1&testProp2=testValue2 640w, ${IMG_BASE_URL}/img.png?w=750&testProp1=testValue1&testProp2=testValue2 750w, ${IMG_BASE_URL}/img.png?w=828&testProp1=testValue1&testProp2=testValue2 828w, ${IMG_BASE_URL}/img.png?w=1080&testProp1=testValue1&testProp2=testValue2 1080w, ${IMG_BASE_URL}/img.png?w=1200&testProp1=testValue1&testProp2=testValue2 1200w, ${IMG_BASE_URL}/img.png?w=1920&testProp1=testValue1&testProp2=testValue2 1920w, ${IMG_BASE_URL}/img.png?w=2048&testProp1=testValue1&testProp2=testValue2 2048w, ${IMG_BASE_URL}/img.png?w=3840&testProp1=testValue1&testProp2=testValue2 3840w`,
      );
    });

    it('should set `src` to an image URL that does not include a default width parameter', () => {
      const imageLoader = (config: ImageLoaderConfig) => {
        const widthStr = config.width ? `?w=${config.width}` : ``;
        return `${IMG_BASE_URL}/${config.src}${widthStr}`;
      };
      setupTestingModule({imageLoader});

      const template = '<img ngSrc="img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
    });

    it(
      `should allow providing image loaders via Component providers`,
      withHead('', () => {
        const createImgUrl = (path: string, config: ImageLoaderConfig) => `${path}/${config.src}`;
        const loaderWithPath = createImageLoader(createImgUrl);

        @Component({
          selector: 'test-cmp',
          template: '<img ngSrc="a.png" width="100" height="50" priority>',
          providers: [loaderWithPath('https://component.io')],
          standalone: false,
        })
        class TestComponent {}

        setupTestingModule({
          component: TestComponent,
          extraProviders: [loaderWithPath('https://default.io')],
        });

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const defaultLoader = TestBed.inject(IMAGE_LOADER);
        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;

        expect(defaultLoader({src: 'a.png'})).toBe('https://default.io/a.png');
        expect(img.src).toBe('https://component.io/a.png');
      }),
    );

    it('should pass height to custom image loaders', () => {
      @Component({
        selector: 'test-cmp',
        standalone: false,
        template: `<img [ngSrc]="ngSrc" width="300" height="150" sizes="100vw" />`,
      })
      class TestComponent {
        ngSrc = `img.png`;
      }
      const imageLoader = (config: ImageLoaderConfig) => {
        const params: string[] = [];
        if (config.width) {
          params.push(`w=${config.width}`);
        }
        if (config.height) {
          params.push(`h=${config.height}`);
        }
        const query = params.length ? `?${params.join('&')}` : '';
        return `${IMG_BASE_URL}/${config.src}${query}`;
      };
      setupTestingModule({imageLoader, component: TestComponent});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      let nativeElement = fixture.nativeElement as HTMLElement;
      let imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].getAttribute('srcset')).toBe(
        `${IMG_BASE_URL}/img.png?w=640&h=320 640w, ${IMG_BASE_URL}/img.png?w=750&h=375 750w, ${IMG_BASE_URL}/img.png?w=828&h=414 828w, ${IMG_BASE_URL}/img.png?w=1080&h=540 1080w, ${IMG_BASE_URL}/img.png?w=1200&h=600 1200w, ${IMG_BASE_URL}/img.png?w=1920&h=960 1920w, ${IMG_BASE_URL}/img.png?w=2048&h=1024 2048w, ${IMG_BASE_URL}/img.png?w=3840&h=1920 3840w`,
      );
    });

    describe('`ngSrcset` values', () => {
      let imageLoader!: ImageLoader;

      beforeEach(() => {
        imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `?w=${config.width}` : ``;
          return `${IMG_BASE_URL}/${config.src}${width}`;
        };
      });

      it('should set the `srcset` using the `ngSrcset` value with width descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="100w, 200w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=100 100w, ${IMG_BASE_URL}/img.png?w=200 200w`,
        );
      });

      it('should set the `srcset` using the `ngSrcset` value with density descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="1x, 2x" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=100 1x, ${IMG_BASE_URL}/img.png?w=200 2x`,
        );
      });

      it('should set the `srcset` if `ngSrcset` has only one src defined', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="100w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src.trim()).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset.trim()).toBe(`${IMG_BASE_URL}/img.png?w=100 100w`);
      });

      it('should set the `srcset` if `ngSrcSet` has extra spaces', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="  100w,  200w   " width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=100 100w, ${IMG_BASE_URL}/img.png?w=200 200w`,
        );
      });

      it('should set the `srcset` if `ngSrcSet` has a trailing comma', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="1x, 2x," width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=100 1x, ${IMG_BASE_URL}/img.png?w=200 2x`,
        );
      });

      it('should set the `srcset` if `ngSrcSet` has 3+ srcs', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="100w, 200w, 300w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=100 100w, ` +
            `${IMG_BASE_URL}/img.png?w=200 200w, ` +
            `${IMG_BASE_URL}/img.png?w=300 300w`,
        );
      });

      it('should set the `srcset` if `ngSrcSet` has decimal density descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="1.75x, 2.5x, 3x" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset).toBe(
          `${IMG_BASE_URL}/img.png?w=175 1.75x, ` +
            `${IMG_BASE_URL}/img.png?w=250 2.5x, ` +
            `${IMG_BASE_URL}/img.png?w=300 3x`,
        );
      });
      it('should automatically set a default sizes attribute when ngSrcset is used with a responsive srcset and is lazy', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="100w, 200w, 300w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.sizes).toBe(`auto, 100vw`);
      });
      it('should not automatically set a default sizes attribute when ngSrcset is used with a responsive srcset and is not lazy', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img ngSrc="img.png" ngSrcset="100w, 200w, 300w" width="100" height="50" priority>
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.sizes).toBe('');
      });
    });

    describe('sizes attribute', () => {
      it('should pass through the sizes attribute', () => {
        setupTestingModule();

        const template =
          '<img ngSrc="path/img.png" width="150" height="50" ' +
          'sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority>';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;

        expect(img.getAttribute('sizes')).toBe(
          '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        );
      });

      it('should prepend sizes="auto" to a lazy-loaded image', () => {
        setupTestingModule();

        const template =
          '<img ngSrc="path/img.png" width="150" height="50" ' +
          'sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">';
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;

        expect(img.getAttribute('sizes')).toBe(
          'auto, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        );
      });

      it('should throw if a complex `sizes` is used', () => {
        setupTestingModule();

        const template =
          '<img ngSrc="path/img.png" width="100" height="50" sizes="(min-width: 768px) 500px, 100vw">';
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          'NG02952: The NgOptimizedImage directive has detected that `sizes` was set to a string including pixel values. ' +
            'For automatic `srcset` generation, `sizes` must only include responsive values, such as `sizes="50vw"` or ' +
            '`sizes="(min-width: 768px) 50vw, 100vw"`. To fix this, modify the `sizes` attribute, or provide your own `ngSrcset` value directly.',
        );
      });
      it('should throw if a complex `sizes` is used with srcset', () => {
        setupTestingModule();

        const template =
          '<img ngSrc="path/img.png" width="100" height="50" sizes="(min-width: 768px) 500px, 100vw" srcset="www.example.com/img.png?w=500 768w, www.example.com/img.png?w=2000" >';
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(
          'NG02952: The NgOptimizedImage directive has detected that `sizes` was set to a string including pixel values. ' +
            'For automatic `srcset` generation, `sizes` must only include responsive values, such as `sizes="50vw"` or ' +
            '`sizes="(min-width: 768px) 50vw, 100vw"`. To fix this, modify the `sizes` attribute, or provide your own `ngSrcset` value directly.',
        );
      });
      it('should not throw if a complex `sizes` is used with ngSrcset', () => {
        setupTestingModule();

        const template =
          '<img ngSrc="path/img.png" width="100" height="50" sizes="(min-width: 768px) 500px, 100vw" ngSrcset="100w, 200w">';
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).not.toThrow();
      });
    });

    describe('automatic srcset generation', () => {
      const imageLoader = (config: ImageLoaderConfig) => {
        const width = config.width ? `?w=${config.width}` : ``;
        return `${IMG_BASE_URL}/${config.src}${width}`;
      };

      it('should not generate a srcset if the default noop loader is used', () => {
        setupTestingModule({noLoader: true});

        const template = `
          <img ngSrc="img" width="100" height="50" sizes="100vw">
        `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBeNull();
      });

      it('should add a responsive srcset to the img element if sizes attribute exists', () => {
        setupTestingModule({imageLoader});

        const template = `
      <img ngSrc="img" width="100" height="50" sizes="100vw">
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=750 750w, ${IMG_BASE_URL}/img?w=828 828w, ${IMG_BASE_URL}/img?w=1080 1080w, ${IMG_BASE_URL}/img?w=1200 1200w, ${IMG_BASE_URL}/img?w=1920 1920w, ${IMG_BASE_URL}/img?w=2048 2048w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should use the long responsive srcset if sizes attribute exists and is less than 100vw', () => {
        setupTestingModule({imageLoader});

        const template = `
      <img ngSrc="img" width="100" height="50" sizes="2vw">
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=16 16w, ${IMG_BASE_URL}/img?w=32 32w, ${IMG_BASE_URL}/img?w=48 48w, ${IMG_BASE_URL}/img?w=64 64w, ${IMG_BASE_URL}/img?w=96 96w, ${IMG_BASE_URL}/img?w=128 128w, ${IMG_BASE_URL}/img?w=256 256w, ${IMG_BASE_URL}/img?w=384 384w, ${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=750 750w, ${IMG_BASE_URL}/img?w=828 828w, ${IMG_BASE_URL}/img?w=1080 1080w, ${IMG_BASE_URL}/img?w=1200 1200w, ${IMG_BASE_URL}/img?w=1920 1920w, ${IMG_BASE_URL}/img?w=2048 2048w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should add a fixed srcset to the img element if sizes attribute does not exist', () => {
        setupTestingModule({imageLoader});

        const template = `
      <img ngSrc="img" width="100" height="50">
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=100 1x, ${IMG_BASE_URL}/img?w=200 2x`,
        );
      });

      it('should not add a fixed srcset to the img element if height is too large', () => {
        setupTestingModule({imageLoader});

        const template = `<img ngSrc="img" width="1100" height="2400">`;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBeNull();
      });

      it('should not add a fixed srcset to the img element if width is too large', () => {
        setupTestingModule({imageLoader});

        const template = `<img ngSrc="img" width="3000" height="400">`;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBeNull();
      });

      it('should add a responsive srcset to the img element if height is too large', () => {
        setupTestingModule({imageLoader});

        const template = `<img ngSrc="img" width="1100" height="2400" sizes="100vw">`;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=750 750w, ${IMG_BASE_URL}/img?w=828 828w, ${IMG_BASE_URL}/img?w=1080 1080w, ${IMG_BASE_URL}/img?w=1200 1200w, ${IMG_BASE_URL}/img?w=1920 1920w, ${IMG_BASE_URL}/img?w=2048 2048w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should add a responsive srcset to the img element if width is too large', () => {
        setupTestingModule({imageLoader});

        const template = `<img ngSrc="img" width="3000" height="400" sizes="100vw">`;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=750 750w, ${IMG_BASE_URL}/img?w=828 828w, ${IMG_BASE_URL}/img?w=1080 1080w, ${IMG_BASE_URL}/img?w=1200 1200w, ${IMG_BASE_URL}/img?w=1920 1920w, ${IMG_BASE_URL}/img?w=2048 2048w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should use a custom breakpoint set if one is provided', () => {
        const imageConfig = {
          breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 1280, 3840],
        };
        setupTestingModule({imageLoader, imageConfig});

        const template = `
      <img ngSrc="img" width="100" height="50" sizes="2vw">
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();
        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=16 16w, ${IMG_BASE_URL}/img?w=32 32w, ${IMG_BASE_URL}/img?w=48 48w, ${IMG_BASE_URL}/img?w=64 64w, ${IMG_BASE_URL}/img?w=96 96w, ${IMG_BASE_URL}/img?w=128 128w, ${IMG_BASE_URL}/img?w=256 256w, ${IMG_BASE_URL}/img?w=384 384w, ${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=1280 1280w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should sort custom breakpoint set', () => {
        const imageConfig = {
          breakpoints: [48, 16, 3840, 640, 1280],
        };
        setupTestingModule({imageLoader, imageConfig});

        const template = `
      <img ngSrc="img" width="100" height="50" sizes="2vw">
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();
        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBe(
          `${IMG_BASE_URL}/img?w=16 16w, ${IMG_BASE_URL}/img?w=48 48w, ${IMG_BASE_URL}/img?w=640 640w, ${IMG_BASE_URL}/img?w=1280 1280w, ${IMG_BASE_URL}/img?w=3840 3840w`,
        );
      });

      it('should disable automatic srcset generation if "disableOptimizedSrcset" attribute is set', () => {
        setupTestingModule({imageLoader});

        const template = `
      <img ngSrc="img" width="100" height="50" sizes="50vw" disableOptimizedSrcset>
    `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();
        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.getAttribute('srcset')).toBeNull();
      });
    });
  });
});

// Helpers

// Base URL that can be used in tests to construct absolute URLs.
const IMG_BASE_URL = {
  // Use `toString` here to delay referencing the `window` until the tests
  // execution starts, otherwise the `window` might not be defined in Node env.
  toString: () => window.location.origin,
};

const ANGULAR_LOGO_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==';

@Component({
  selector: 'test-cmp',
  template: '',
  standalone: false,
})
class TestComponent {
  width = 100;
  height = 50;
  ngSrc = 'img.png';
  priority = false;
}

function setupTestingModule(config?: {
  imageConfig?: ImageConfig;
  imageLoader?: ImageLoader;
  noLoader?: boolean;
  extraProviders?: Provider[];
  component?: Type<unknown>;
}) {
  const defaultLoader = (config: ImageLoaderConfig) => {
    const isAbsolute = /^https?:\/\//.test(config.src);
    return isAbsolute ? config.src : window.location.origin + '/' + config.src;
  };
  const loader = config?.imageLoader || defaultLoader;
  const extraProviders = config?.extraProviders || [];
  const providers: Provider[] = [
    {provide: DOCUMENT, useValue: window.document},
    ...(config?.noLoader ? [] : [{provide: IMAGE_LOADER, useValue: loader}]),
    ...extraProviders,
  ];
  if (config?.imageConfig) {
    providers.push({provide: IMAGE_CONFIG, useValue: config.imageConfig});
  }

  TestBed.configureTestingModule({
    declarations: [config?.component ?? TestComponent],
    // Note: the `NgOptimizedImage` directive is experimental and is not a part of the
    // `CommonModule` yet, so it's imported separately.
    imports: [CommonModule, NgOptimizedImage],
    providers,
  });
}

// Same as above but explicitly doesn't provide a custom loader,
// so the noopImageLoader should be used.
function setUpModuleNoLoader() {
  TestBed.configureTestingModule({
    declarations: [TestComponent],
    imports: [CommonModule, NgOptimizedImage],
    providers: [{provide: DOCUMENT, useValue: window.document}],
  });
}

function createTestComponent(
  template: string,
  changeDetection = ChangeDetectionStrategy.OnPush,
): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {
    set: {template, changeDetection},
  }).createComponent(TestComponent);
}

function parseInlineStyles(img: HTMLImageElement): Map<string, string> {
  const styles = new Map();
  const rawStyles = img.getAttribute('style')?.replace(/\s/g, '');
  if (rawStyles) {
    rawStyles.split(';').forEach((style) => {
      const styleTuple = style.split(':');
      styles.set(styleTuple[0], styleTuple.slice(1).join(':'));
    });
  }
  return styles;
}
