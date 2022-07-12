/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {RuntimeErrorCode} from '@angular/common/src/errors';
import {Component, Provider} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {withHead} from '@angular/private/testing';

import {IMAGE_LOADER, ImageLoader, ImageLoaderConfig} from '../../src/directives/ng_optimized_image/image_loaders/image_loader';
import {ABSOLUTE_SRCSET_DENSITY_CAP, assertValidRawSrcset, NgOptimizedImageModule, RECOMMENDED_SRCSET_DENSITY_CAP} from '../../src/directives/ng_optimized_image/ng_optimized_image';
import {PRECONNECT_CHECK_BLOCKLIST} from '../../src/directives/ng_optimized_image/preconnect_link_checker';

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

    it('should throw if `width` is 0', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" width="0" height="10">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`width\` ` +
              'has an invalid value: expecting a number that represents the width ' +
              'in pixels, but got: `0`.');
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

    it('should throw if `height` is 0', () => {
      setupTestingModule();

      const template = '<img rawSrc="img.png" width="10" height="0">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              `NG0${
                  RuntimeErrorCode
                      .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`height\` ` +
              'has an invalid value: expecting a number that represents the height ' +
              'in pixels, but got: `0`.');
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
          return window.location.origin + `/path/${config.src}${width}.png`;
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
          return window.location.origin + `/path/${config.src}${width}.png`;
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

      it('should throw if rawSrcset exceeds the density cap', () => {
        const imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `-${config.width}` : ``;
          return window.location.origin + `/path/${config.src}${width}.png`;
        };
        setupTestingModule({imageLoader});

        const template = `
            <img rawSrc="img" rawSrcset="1x, 2x, 3x, 4x, 5x" width="100" height="50">
          `;
        expect(() => {
          const fixture = createTestComponent(template);
          fixture.detectChanges();
        })
            .toThrowError(
                `NG0${
                    RuntimeErrorCode
                        .INVALID_INPUT}: The NgOptimizedImage directive has detected that the \`rawSrcset\` contains an unsupported image density:` +
                `\`1x, 2x, 3x, 4x, 5x\`. NgOptimizedImage generally recommends a max image density of ` +
                `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
                `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
                `greater than ${
                    RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
                `most use cases. Images that will be pinch-zoomed are typically the primary use case for` +
                `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
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
              'NG02952: The NgOptimizedImage directive has detected that the `loading` ' +
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
              'NG02952: The NgOptimizedImage directive has detected that the `loading` ' +
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

  describe('preconnect detector', () => {
    const imageLoader = () => {
      // We need something different from the `localhost` (as we don't want to produce
      // a preconnect warning for local environments).
      return 'https://angular.io/assets/images/logos/angular/angular.svg';
    };
    it('should log a warning if there is no preconnect link for a priority image',
       withHead('', () => {
         setupTestingModule({imageLoader});

         const consoleWarnSpy = spyOn(console, 'warn');
         const template = '<img rawSrc="a.png" width="100" height="50" priority>';
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         expect(consoleWarnSpy.calls.count()).toBe(1);
         expect(consoleWarnSpy.calls.argsFor(0)[0])
             .toBe(
                 'NG02956: The NgOptimizedImage directive (activated on an <img> ' +
                 'element with the `rawSrc="a.png"`) has detected that this image ' +
                 'contains the "priority" attribute, but doesn\'t have a corresponding ' +
                 'preconnect tag. Please add the following element into the <head> of ' +
                 'the document to optimize loading of this image:' +
                 '\n  <link rel="preconnect" href="https://angular.io">');
       }));

    it('should not log a warning if there is no preconnect link, but the image is not set as a priority',
       withHead('', () => {
         setupTestingModule({imageLoader});

         const consoleWarnSpy = spyOn(console, 'warn');
         const template = '<img rawSrc="a.png" width="100" height="50">';
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         // Expect no warnings in the console.
         expect(consoleWarnSpy.calls.count()).toBe(0);
       }));

    it('should log a warning if there is a preconnect, but it doesn\'t match the priority image',
       withHead('<link rel="preconnect" href="http://angular.io">', () => {
         setupTestingModule({imageLoader});

         const consoleWarnSpy = spyOn(console, 'warn');
         const template = '<img rawSrc="a.png" width="100" height="50" priority>';
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         expect(consoleWarnSpy.calls.count()).toBe(1);
         expect(consoleWarnSpy.calls.argsFor(0)[0])
             .toBe(
                 'NG02956: The NgOptimizedImage directive (activated on an ' +
                 '<img> element with the `rawSrc="a.png"`) has detected that ' +
                 'this image contains the "priority" attribute, but doesn\'t have ' +
                 'a corresponding preconnect tag. Please add the following element ' +
                 'into the <head> of the document to optimize loading of this image:' +
                 '\n  <link rel="preconnect" href="https://angular.io">');
       }));

    it('should log a warning if there is no matching preconnect link for a priority image, but there is a preload tag',
       withHead(
           '<link rel="preload" href="https://angular.io/assets/images/logos/angular/angular.svg" as="image">',
           () => {
             setupTestingModule({imageLoader});

             const consoleWarnSpy = spyOn(console, 'warn');
             const template = '<img rawSrc="a.png" width="100" height="50" priority>';
             const fixture = createTestComponent(template);
             fixture.detectChanges();

             expect(consoleWarnSpy.calls.count()).toBe(1);
             expect(consoleWarnSpy.calls.argsFor(0)[0])
                 .toBe(
                     'NG02956: The NgOptimizedImage directive (activated on an ' +
                     '<img> element with the `rawSrc="a.png"`) has detected that ' +
                     'this image contains the "priority" attribute, but doesn\'t have ' +
                     'a corresponding preconnect tag. Please add the following element ' +
                     'into the <head> of the document to optimize loading of this image:' +
                     '\n  <link rel="preconnect" href="https://angular.io">');
           }));

    it('should not log a warning if there is a matching preconnect link for a priority image (with an extra `/` at the end)',
       withHead('<link rel="preconnect" href="https://angular.io/">', () => {
         setupTestingModule({imageLoader});

         const consoleWarnSpy = spyOn(console, 'warn');
         const template = '<img rawSrc="a.png" width="100" height="50" priority>';
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         // Expect no warnings in the console.
         expect(consoleWarnSpy.calls.count()).toBe(0);
       }));

    ['localhost', '127.0.0.1', '0.0.0.0'].forEach(blocklistedHostname => {
      it(`should not log a warning if an origin domain is blocklisted ` +
             `(checking ${blocklistedHostname})`,
         withHead('', () => {
           const imageLoader = () => {
             return `http://${blocklistedHostname}/a.png`;
           };
           setupTestingModule({imageLoader});

           const consoleWarnSpy = spyOn(console, 'warn');
           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           const fixture = createTestComponent(template);
           fixture.detectChanges();

           // Expect no warnings in the console.
           expect(consoleWarnSpy.calls.count()).toBe(0);
         }));
    });

    describe('PRECONNECT_CHECK_BLOCKLIST token', () => {
      it(`should allow passing host names`, withHead('', () => {
           const providers = [
             {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'angular.io', multi: true},
           ];
           setupTestingModule({imageLoader, extraProviders: providers});

           const consoleWarnSpy = spyOn(console, 'warn');
           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           const fixture = createTestComponent(template);
           fixture.detectChanges();

           // Expect no warnings in the console.
           expect(consoleWarnSpy.calls.count()).toBe(0);
         }));

      it(`should allow passing origins`, withHead('', () => {
           const providers = [
             {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://angular.io', multi: true},
           ];
           setupTestingModule({imageLoader, extraProviders: providers});

           const consoleWarnSpy = spyOn(console, 'warn');
           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           const fixture = createTestComponent(template);
           fixture.detectChanges();

           // Expect no warnings in the console.
           expect(consoleWarnSpy.calls.count()).toBe(0);
         }));

      it(`should allow passing arrays of host names`, withHead('', () => {
           const providers = [
             {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: ['https://angular.io'], multi: true},
           ];
           setupTestingModule({imageLoader, extraProviders: providers});

           const consoleWarnSpy = spyOn(console, 'warn');
           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           const fixture = createTestComponent(template);
           fixture.detectChanges();

           // Expect no warnings in the console.
           expect(consoleWarnSpy.calls.count()).toBe(0);
         }));

      it(`should allow passing nested arrays of host names`, withHead('', () => {
           const providers = [
             {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: [['https://angular.io']], multi: true},
           ];
           setupTestingModule({imageLoader, extraProviders: providers});

           const consoleWarnSpy = spyOn(console, 'warn');
           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           const fixture = createTestComponent(template);
           fixture.detectChanges();

           // Expect no warnings in the console.
           expect(consoleWarnSpy.calls.count()).toBe(0);
         }));

      it(`should throw when PRECONNECT_CHECK_BLOCKLIST is not a multi provider`,
         withHead('', () => {
           const providers = [
             {provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://angular.io'},
           ];
           setupTestingModule({imageLoader, extraProviders: providers});

           const template = '<img rawSrc="a.png" width="100" height="50" priority>';
           expect(() => {
             const fixture = createTestComponent(template);
             fixture.detectChanges();
           })
               .toThrowError(
                   'NG02957: The blocklist for the preconnect check was not ' +
                   'provided as an array. Check that the `PRECONNECT_CHECK_BLOCKLIST` token ' +
                   'is configured as a `multi: true` provider.');
         }));
    });
  });

  describe('loaders', () => {
    it('should set `src` to match `rawSrc` if image loader is not provided', () => {
      setupTestingModule();

      const template = `<img rawSrc="${IMG_BASE_URL}/img.png" width="100" height="50">`;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
    });

    it('should set `src` using the image loader provided via the `IMAGE_LOADER` token to compose src URL',
       () => {
         const imageLoader = (config: ImageLoaderConfig) => `${IMG_BASE_URL}/${config.src}`;
         setupTestingModule({imageLoader});

         const template = `
         <img rawSrc="img.png" width="150" height="50">
         <img rawSrc="img-2.png" width="150" height="50">
       `;
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         const nativeElement = fixture.nativeElement as HTMLElement;
         const imgs = nativeElement.querySelectorAll('img')!;
         expect(imgs[0].src.trim()).toBe(`${IMG_BASE_URL}/img.png`);
         expect(imgs[1].src.trim()).toBe(`${IMG_BASE_URL}/img-2.png`);
       });

    it('should pass absolute URLs defined in the `rawSrc` to custom image loaders provided via the `IMAGE_LOADER` token',
       () => {
         const imageLoader = (config: ImageLoaderConfig) => `${config.src}?rewritten=true`;
         setupTestingModule({imageLoader});

         const template = `
            <img rawSrc="${IMG_BASE_URL}/img.png" width="150" height="50">
          `;
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         const nativeElement = fixture.nativeElement as HTMLElement;
         const imgs = nativeElement.querySelectorAll('img')!;
         expect(imgs[0].src.trim()).toBe(`${IMG_BASE_URL}/img.png?rewritten=true`);
       });

    it('should set `src` to an image URL that does not include a default width parameter', () => {
      const imageLoader = (config: ImageLoaderConfig) => {
        const widthStr = config.width ? `?w=${config.width}` : ``;
        return `${IMG_BASE_URL}/${config.src}${widthStr}`;
      };
      setupTestingModule({imageLoader});

      const template = '<img rawSrc="img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
    });

    describe('`rawSrcset` values', () => {
      let imageLoader!: ImageLoader;

      beforeEach(() => {
        imageLoader = (config: ImageLoaderConfig) => {
          const width = config.width ? `?w=${config.width}` : ``;
          return `${IMG_BASE_URL}/${config.src}${width}`;
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img-100.png`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(`${IMG_BASE_URL}/img.png?w=100 100w, ${IMG_BASE_URL}/img.png?w=200 200w`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(`${IMG_BASE_URL}/img.png?w=100 1x, ${IMG_BASE_URL}/img.png?w=200 2x`);
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
        expect(img.src.trim()).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset.trim()).toBe(`${IMG_BASE_URL}/img.png?w=100 100w`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(`${IMG_BASE_URL}/img.png?w=100 100w, ${IMG_BASE_URL}/img.png?w=200 200w`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(`${IMG_BASE_URL}/img.png?w=100 1x, ${IMG_BASE_URL}/img.png?w=200 2x`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(
                `${IMG_BASE_URL}/img.png?w=100 100w, ` +
                `${IMG_BASE_URL}/img.png?w=200 200w, ` +
                `${IMG_BASE_URL}/img.png?w=300 300w`);
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
        expect(img.src).toBe(`${IMG_BASE_URL}/img.png`);
        expect(img.srcset)
            .toBe(
                `${IMG_BASE_URL}/img.png?w=100 1x, ` +
                `${IMG_BASE_URL}/img.png?w=250 2.5x, ` +
                `${IMG_BASE_URL}/img.png?w=300 3x`);
      });
    });
  });
});

// Helpers

// Base URL that can be used in tests to construct absolute URLs.
const IMG_BASE_URL = {
  // Use `toString` here to delay referencing the `window` until the tests
  // execution starts, otherwise the `window` might not be defined in Node env.
  toString: () => window.location.origin
};

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

function setupTestingModule(config?: {imageLoader?: ImageLoader, extraProviders?: any[]}) {
  const defaultLoader = (config: ImageLoaderConfig) => {
    const isAbsolute = /^https?:\/\//.test(config.src);
    return isAbsolute ? config.src : window.location.origin + '/' + config.src;
  };
  const loader = config?.imageLoader || defaultLoader;
  const extraProviders = config?.extraProviders || [];
  const providers: Provider[] = [
    {provide: DOCUMENT, useValue: window.document},
    {provide: IMAGE_LOADER, useValue: loader},
    ...extraProviders,
  ];

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
