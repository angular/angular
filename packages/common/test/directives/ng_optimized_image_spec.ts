/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {IMAGE_LOADER, ImageLoader, ImageLoaderConfig, NgOptimizedImage} from '@angular/common/src/directives/ng_optimized_image';
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
              'NG02950: The NgOptimizedImage directive (activated on an <img> element with the ' +
              '`rawSrc="path/img.png"`) has detected that the `src` is also set (to `path/img2.png`). ' +
              'Please remove the `src` attribute from this image. The NgOptimizedImage directive will use ' +
              'the `rawSrc` to compute the final image URL and set the `src` itself.');
    });

    it('should throw if `rawSrc` contains a Base64-encoded image (that starts with `data:`)', () => {
      setupTestingModule();

      expect(() => {
        const template = '<img rawSrc="' + ANGULAR_LOGO_BASE64 + '" width="50" height="50">';
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG02951: The NgOptimizedImage directive has detected that the `rawSrc` was set ' +
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
            /NG02951: The NgOptimizedImage directive has detected that the `rawSrc` was set to a blob URL \(blob:/;
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
              'NG02953: The NgOptimizedImage directive (activated on an <img> ' +
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
              'NG02951: The NgOptimizedImage directive has detected that the `width` ' +
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
              'NG02953: The NgOptimizedImage directive (activated on an <img> ' +
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
              'NG02951: The NgOptimizedImage directive has detected that the `height` ' +
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
              'NG02951: The NgOptimizedImage directive has detected that the `rawSrc` ' +
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
              'NG02951: The NgOptimizedImage directive has detected that the `rawSrc` ' +
              'has an invalid value: expecting a non-empty string, but got: `  ` (empty string).');
    });

    const inputs = [
      ['rawSrc', 'new-img.png'],  //
      ['width', 10],              //
      ['height', 20],             //
      ['priority', true]
    ];
    inputs.forEach(([inputName, value]) => {
      it(`should throw if inputs got changed after directive init (the \`${inputName}\` input)`,
         () => {
           setupTestingModule();

           const template =
               '<img [rawSrc]="rawSrc" [width]="width" [height]="height" [priority]="priority">';
           expect(() => {
             // Initial render
             const fixture = createTestComponent(template);
             fixture.detectChanges();

             // Update input (expect to throw)
             (fixture.componentInstance as unknown as
              {[key: string]: unknown})[inputName as string] = value;
             fixture.detectChanges();
           })
               .toThrowError(
                   `NG02952: The NgOptimizedImage directive (activated on an <img> element ` +
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

      const template = '<img rawSrc="path/img.png" width="100" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src.trim()).toBe('/path/img.png');
    });

    it('should set `src` using the image loader provided via the `IMAGE_LOADER` token to compose src URL',
       () => {
         const imageLoader = (config: ImageLoaderConfig) => `path/${config.src}`;
         setupTestingModule({imageLoader});

         const template = `
        <img rawSrc="img.png" width="150" height="50">
        <img rawSrc="img-2.png" width="150" height="50">
      `;
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         const nativeElement = fixture.nativeElement as HTMLElement;
         const imgs = nativeElement.querySelectorAll('img')!;
         expect(imgs[0].src.trim()).toBe('/path/img.png');
         expect(imgs[1].src.trim()).toBe('/path/img-2.png');
       });

    it('should set`src` to an image URL that does not include a default width parameter', () => {
      const imageLoader = (config: ImageLoaderConfig) => {
        const widthStr = config.width ? `?w=${config.width}` : ``;
        return `path/${config.src}${widthStr}`;
      };
      setupTestingModule({imageLoader});

      const template = '<img rawSrc="img.png" width="150" height="50">';
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src.trim()).toBe('/path/img.png');
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
    imports: [CommonModule, NgOptimizedImage],
    providers,
  });
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
