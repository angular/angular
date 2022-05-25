/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {assertValidRawSrcset, IMAGE_LOADER, ImageLoader, ImageLoaderConfig, NgOptimizedImageModule} from '@angular/common/src/directives/ng_optimized_image';
import {RuntimeErrorCode} from '@angular/common/src/errors';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('Image directive', () => {
  it('should set `loading` and `fetchpriority` attributes before `src`', () => {
    // Only run this test in a browser since the Node-based DOM mocks don't
    // allow to override `HTMLImageElement.prototype.setAttribute` easily.
    if (!isBrowser) return;

    setupTestingModule();

    const template = '<img rawSrc="path/img.png" width="150" height="50" priority>';
    TestBed.overrideComponent(TestComponent, {set: {template: template}});

    const _document = TestBed.inject(DOCUMENT);
    const _window = _document.defaultView!;
    const setAttributeSpy =
        spyOn(_window.HTMLImageElement.prototype, 'setAttribute').and.callThrough();

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
    expect(_loadingAttrId).toBeGreaterThan(-1);       // was actually set
    expect(_loadingAttrId).toBeLessThan(_srcAttrId);  // was set after `src`

    expect(_fetchpriorityAttrId).toBeGreaterThan(-1);       // was actually set
    expect(_fetchpriorityAttrId).toBeLessThan(_srcAttrId);  // was set after `src`
  });

  describe('setup error handling', () => {
    it('should throw if both `src` and `rawSrc` are present', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" src="path/img2.png" width="100" height="50">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .UNEXPECTED_SRC_ATTR}: The NgOptimizedImage directive (activated on an <img> element with the ` +
              '`rawSrc="path/img.png"`) has detected that the `src` has already been set (to `path/img2.png`). ' +
              'Please remove the `src` attribute from this image. The NgOptimizedImage directive will use ' +
              'the `rawSrc` to compute the final image URL and set the `src` itself.');
    });

    it('should throw if both `rawSrc` and `srcset` is present', () => {
      setupTestingModule();

      const template =
          '<img rawSrc="img-100.png" srcset="img-100.png 100w, img-200.png 200w" width="100" height="50">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .UNEXPECTED_SRCSET_ATTR}: The NgOptimizedImage directive (activated on an <img> element with the ` +
              '`rawSrc="img-100.png"`) has detected that the `srcset` has been set. ' +
              'Please replace the `srcset` attribute from this image with `rawSrcset`. ' +
              'The NgOptimizedImage directive uses `rawSrcset` to set the `srcset` attribute' +
              'at a time that does not disrupt lazy loading.');
    });

    it('should throw if `rawSrc` contains a Base64-encoded image (that starts with `data:`)', () => {
      setupTestingModule();

      expect(() => {
        const template = '<img rawSrc="' + ANGULAR_LOGO_BASE64 + '" width="50" height="50">';
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
              'to a Base64-encoded string (' + ANGULAR_LOGO_BASE64.substring(0, 50) + '...). ' +
              'Base64-encoded strings are not supported by the NgOptimizedImage directive. ' +
              'Use a regular `src` attribute (instead of `rawSrc`) to disable the NgOptimizedImage ' +
              'directive for this element.');
    });

    it('should throw if `rawSrc` contains a `blob:` URL', (done) => {
      // Domino does not support canvas elements properly,
      // so run this test only in a browser.
      if (!isBrowser) {
        done();
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.toBlob(function(blob) {
        const blobURL = URL.createObjectURL(blob!);

        setupTestingModule();

        // Note: use RegExp to partially match the error message, since the blob URL
        // is created dynamically, so it might be different for each invocation.
        const errorMessageRegExp =
            /NG02952: The NgOptimizedImage directive has detected that the `rawSrc` was set to a blob URL \(blob:/;
        expect(() => {
          const template = '<img rawSrc="' + blobURL + '" width="50" height="50">';
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        }).toThrowError(errorMessageRegExp);
        done();
      });
    });

    it('should throw if `width` is not set', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .REQUIRED_INPUT_MISSING}: The NgOptimizedImage directive (activated on an <img> ` +
              'element with the `rawSrc="img.png"`) has detected that the required ' +
              '`width` attribute is missing. Please specify the `width` attribute ' +
              'on the mentioned element.');
    });

    it('should throw if `width` has an invalid value', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" width="10px" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`width\` ` +
              'has an invalid value: expecting a number that represents the width ' +
              'in pixels, but got: `10px`.');
    });

    it('should throw if `height` is not set', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" width="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .REQUIRED_INPUT_MISSING}: The NgOptimizedImage directive (activated on an <img> ` +
              'element with the `rawSrc="img.png"`) has detected that the required ' +
              '`height` attribute is missing. Please specify the `height` attribute ' +
              'on the mentioned element.');
    });

    it('should throw if `height` has an invalid value', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" width="10" height="10%">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`height\` ` +
              'has an invalid value: expecting a number that represents the height ' +
              'in pixels, but got: `10%`.');
    });

    it('should throw if `rawSrc` value is not provided', () => {
      setupTestingModule();

      const template = '<img rawSrc>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrc\` ` +
              'has an invalid value: expecting a non-empty string, but got: `` (empty string).');
    });

    it('should throw if `rawSrc` value is set to an empty string', () => {
      setupTestingModule();

      const template = '<img rawSrc="  ">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrc\` ` +
              'has an invalid value: expecting a non-empty string, but got: `  ` (empty string).');
    });

    describe('invalid `rawSrcset` values', () => {
      it('should throw for empty rawSrcSet', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return `path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img rawSrc="img" rawSrcset="" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        })
            .toThrowError(
                `NG0${
                    RuntimeErrorCode
                        .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrcset\` ` +
                'has an invalid value: expecting a non-empty string, but got: `` (empty string).');
      });

      it('should throw for invalid rawSrcSet', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return `path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img rawSrc="img" rawSrcset="100q, 200q" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        })
            .toThrowError(
                `NG0${
                    RuntimeErrorCode
                        .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrcset\` has an invalid value: ` +
                `expecting width descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x"), ` +
                `but got: \`100q, 200q\``);
      });

      it('should throw if width srcset is missing a comma', () => {
        expect(() => {
          assertValidRawSrcset('100w 200w');
        }).toThrowError();
      });

      it('should throw if density srcset is missing a comma', () => {
        expect(() => {
          assertValidRawSrcset('1x 2x');
        }).toThrowError();
      });

      it('should throw if density srcset has too many digits', () => {
        expect(() => {
          assertValidRawSrcset('100x, 2x');
        }).toThrowError();
      });

      it('should throw if width srcset includes a file name', () => {
        expect(() => {
          assertValidRawSrcset('a.png 100w, b.png 200w');
        }).toThrowError();
      });

      it('should throw if density srcset includes a file name', () => {
        expect(() => {
          assertValidRawSrcset('a.png 1x, b.png 2x');
        }).toThrowError();
      });

      it('should throw if srcset starts with a letter', () => {
        expect(() => {
          assertValidRawSrcset('a100w, 200w');
        }).toThrowError();
      });

      it('should throw if srcset starts with another non-digit', () => {
        expect(() => {
          assertValidRawSrcset('--100w, 200w');
        }).toThrowError();
      });

      it('should throw if first descriptor in srcset is junk', () => {
        expect(() => {
          assertValidRawSrcset('foo, 1x');
        }).toThrowError();
      });

      it('should throw if later descriptors in srcset are junk', () => {
        expect(() => {
          assertValidRawSrcset('100w, foo');
        }).toThrowError();
      });

      it('should throw if srcset has a density descriptor after a width descriptor', () => {
        expect(() => {
          assertValidRawSrcset('100w, 1x');
        }).toThrowError();
      });

      it('should throw if srcset has a width descriptor after a density descriptor', () => {
        expect(() => {
          assertValidRawSrcset('1x, 200w');
        }).toThrowError();
      });
    });

    const inputs = [
      ['rawSrc', 'new-img.png'],  //
      ['width', 10],              //
      ['height', 20],             //
      ['priority', true]
    ];
    inputs.forEach(([inputName, value]) => {
      it(`should throw if an input changed after directive initialized the input`, () => {
        setupTestingModule();

        const template =
            '<img [rawSrc]="rawSrc" [width]="width" [height]="height" [priority]="priority">';
        // Initial render
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        expect(() => {
          // Update input (expect to throw)
          (fixture.componentInstance as unknown as {[key: string]: unknown})[inputName as string] =
              value;
          fixture.detectChanges();
        })
            .toThrowError(
                `NG0${
                    RuntimeErrorCode
                        .UNEXPECTED_INPUT_CHANGE}: The NgOptimizedImage directive (activated on an <img> element ` +
                `with the \`rawSrc="img.png"\`) has detected that the \`${inputName}\` is ` +
                `updated after the initialization. The NgOptimizedImage directive will not ` +
                `react to this input change.`);
      });
    });
  });

  describe('lazy loading', () => {
    it('should eagerly load priority images', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="50" priority>';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('should lazily load non-priority images', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="50">';
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

      const template = '<img rawSrc="path/img.png" width="150" height="50" loading="eager">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('should throw if used with priority images', () => {
      setupTestingModule();

      const template =
          '<img rawSrc="path/img.png" width="150" height="50" loading="eager" priority>';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG02951: The NgOptimizedImage directive has detected that the `loading` ' +
              'attribute was used on an image that was marked "priority". ' +
              'Images marked "priority" are always eagerly loaded and this behavior ' +
              'cannot be overwritten by using the "loading" attribute.');
    });

    it('should support setting loading priority to "auto"', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="50" loading="auto">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('auto');
    });

    it('should throw for invalid loading inputs', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="150" loading="fast">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG02951: The NgOptimizedImage directive has detected that the `loading` ' +
              'attribute has an invalid value: expecting "lazy", "eager", or "auto"' +
              ' but got: `fast`.');
    });
  });

  describe('fetch priority', () => {
    it('should be "high" for priority images', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="50" priority>';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('fetchpriority')).toBe('high');
    });

    it('should be "auto" for non-priority images', () => {
      setupTestingModule();

      const template = '<img rawSrc="path/img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.getAttribute('fetchpriority')).toBe('auto');
    });
  });

  describe('loaders', () => {
    it('should set `src` to match `rawSrc` if image loader is not provided', () => {
      setupTestingModule();

      const template = '<img rawSrc="https://somesite.imgix.net/img.png" width="100" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe('https://somesite.imgix.net/img.png');
    });

    it('should set `src` using the image loader provided via the `IMAGE_LOADER` token to compose src URL',
       () => {
         const imageLoader = (config: ImageLoaderConfig) =>
             `https://somesite.imgix.net/${config.src}`;
         setupTestingModule({imageLoader});

         const template = `
         <img rawSrc="img.png" width="150" height="50">
         <img rawSrc="img-2.png" width="150" height="50">
       `;
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         const nativeElement = fixture.nativeElement as HTMLElement;
         const imgs = nativeElement.querySelectorAll('img')!;
         expect(imgs[0].src.trim()).toBe('https://somesite.imgix.net/img.png');
         expect(imgs[1].src.trim()).toBe('https://somesite.imgix.net/img-2.png');
       });

    it('should set `src` to an image URL that does not include a default width parameter', () => {
      const imageLoader = (config: ImageLoaderConfig) => {
        const widthStr = config.width ? `?w=${config.width}` : ``;
        return `https://somesite.imgix.net/${config.src}${widthStr}`;
      };
      setupTestingModule({imageLoader});

      const template = '<img rawSrc="img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe('https://somesite.imgix.net/img.png');
    });

    describe('`rawSrcset` values', () => {
      let imageLoader!: ImageLoader;

      beforeEach(() => {
        imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `?w=${config.width}` : ``;
          return `https://somesite.imgix.net/${config.src}${width}`;
        };
      });

      it('should NOT set `srcset` if no `rawSrcset` value', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img-100.png" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img-100.png');
        expect(img.srcset).toBe('');
      });

      it('should set the `srcset` using the `rawSrcset` value with width descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="100w, 200w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 100w, https://somesite.imgix.net/img.png?w=200 200w');
      });

      it('should set the `srcset` using the `rawSrcset` value with density descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="1x, 2x" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 1x, https://somesite.imgix.net/img.png?w=200 2x');
      });

      it('should set the `srcset` if `rawSrcset` has only one src defined', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="100w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src.trim()).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset.trim()).toBe('https://somesite.imgix.net/img.png?w=100 100w');
      });

      it('should set the `srcset` if `rawSrcSet` has extra spaces', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="  100w,  200w   " width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 100w, https://somesite.imgix.net/img.png?w=200 200w');
      });

      it('should set the `srcset` if `rawSrcSet` has a trailing comma', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="1x, 2x," width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 1x, https://somesite.imgix.net/img.png?w=200 2x');
      });

      it('should set the `srcset` if `rawSrcSet` has 3+ srcs', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="100w, 200w, 300w" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 100w, https://somesite.imgix.net/img.png?w=200 200w, https://somesite.imgix.net/img.png?w=300 300w');
      });

      it('should set the `srcset` if `rawSrcSet` has decimal density descriptors', () => {
        setupTestingModule({imageLoader});

        const template = `
           <img rawSrc="img.png" rawSrcset="1x, 2.5x, 3x" width="100" height="50">
         `;
        const fixture = createTestComponent(template);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const img = nativeElement.querySelector('img')!;
        expect(img.src).toBe('https://somesite.imgix.net/img.png');
        expect(img.srcset)
            .toBe(
                'https://somesite.imgix.net/img.png?w=100 1x, https://somesite.imgix.net/img.png?w=250 2.5x, https://somesite.imgix.net/img.png?w=300 3x');
      });
    });
  });
});

// Helpers

const ANGULAR_LOGO_BASE64 =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==';

@Component({
  selector: 'test-cmp',
  template: '',
})
class TestComponent {
  width = 100;
  height = 50;
  rawSrc = 'img.png';
  priority = false;
}

function setupTestingModule(config?: {imageLoader: ImageLoader}) {
  const providers =
      config?.imageLoader ? [{provide: IMAGE_LOADER, useValue: config?.imageLoader}] : [];
  TestBed.configureTestingModule({
    declarations: [TestComponent],
    // Note: the `NgOptimizedImage` directive is experimental and is not a part of the
    // `CommonModule` yet, so it's imported separately.
    imports: [CommonModule, NgOptimizedImageModule],
    providers,
  });
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
