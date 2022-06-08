/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {provideImgixLoader} from '@angular/common/src/directives/ng_optimized_image/image_loaders/imgix_loader';
import {NgOptimizedImageModule} from '@angular/common/src/directives/ng_optimized_image/ng_optimized_image';
import {PRECONNECT_CHECK_BLOCKLIST} from '@angular/common/src/directives/ng_optimized_image/preconnect_link_checker';
import {RuntimeErrorCode} from '@angular/common/src/errors';
import {Component, ValueProvider} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('Built-in image directive loaders', () => {
  describe('Imgix loader', () => {
    describe('invalid paths', () => {
      it('should throw if path is empty', () => {
        expect(() => {
          setupTestingModule([provideImgixLoader('')]);
        })
            .toThrowError(
                `NG0${RuntimeErrorCode.INVALID_INPUT}: ImgixLoader has detected an invalid path: ` +
                `expecting a path like https://somepath.imgix.net/` +
                `but got: \`\``);
      });

      it('should throw if not a path', () => {
        expect(() => {
          setupTestingModule([provideImgixLoader('wellhellothere')]);
        })
            .toThrowError(
                `NG0${RuntimeErrorCode.INVALID_INPUT}: ImgixLoader has detected an invalid path: ` +
                `expecting a path like https://somepath.imgix.net/` +
                `but got: \`wellhellothere\``);
      });

      it('should throw if path is missing a scheme', () => {
        expect(() => {
          setupTestingModule([provideImgixLoader('somepath.imgix.net')]);
        })
            .toThrowError(
                `NG0${RuntimeErrorCode.INVALID_INPUT}: ImgixLoader has detected an invalid path: ` +
                `expecting a path like https://somepath.imgix.net/` +
                `but got: \`somepath.imgix.net\``);
      });

      it('should throw if path is malformed', () => {
        expect(() => {
          setupTestingModule([provideImgixLoader('somepa\th.imgix.net? few')]);
        })
            .toThrowError(
                `NG0${RuntimeErrorCode.INVALID_INPUT}: ImgixLoader has detected an invalid path: ` +
                `expecting a path like https://somepath.imgix.net/` +
                `but got: \`somepa\th.imgix.net? few\``);
      });
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

    it('should construct an image loader with the given path', () => {
      setupTestingModule([provideImgixLoader('https://somesite.imgix.net')]);

      const template = `
      <img rawSrc="img.png" width="150" height="50">
      <img rawSrc="img-2.png" width="150" height="50">
    `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const imgs = nativeElement.querySelectorAll('img')!;
      expect(imgs[0].src).toBe('https://somesite.imgix.net/img.png?auto=format');
      expect(imgs[1].src).toBe('https://somesite.imgix.net/img-2.png?auto=format');
    });

    it('should handle a trailing forward slash on the path', () => {
      setupTestingModule([provideImgixLoader('https://somesite.imgix.net/')]);

      const template = `
      <img rawSrc="img.png" width="150" height="50">
    `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe('https://somesite.imgix.net/img.png?auto=format');
    });

    it('should handle a leading forward slash on the src', () => {
      setupTestingModule([provideImgixLoader('https://somesite.imgix.net/')]);

      const template = `
      <img rawSrc="/img.png" width="150" height="50">
    `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe('https://somesite.imgix.net/img.png?auto=format');
    });

    it('should be compatible with rawSrcset', () => {
      setupTestingModule([provideImgixLoader('https://somesite.imgix.net')]);

      const template = `
      <img rawSrc="img.png" rawSrcset="100w, 200w" width="100" height="50">
    `;
      const fixture = createTestComponent(template);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const img = nativeElement.querySelector('img')!;
      expect(img.src).toBe('https://somesite.imgix.net/img.png?auto=format');
      expect(img.srcset)
          .toBe(
              'https://somesite.imgix.net/img.png?auto=format&w=100 100w, https://somesite.imgix.net/img.png?auto=format&w=200 200w');
    });
  });
});


// Helpers

@Component({
  selector: 'test-cmp',
  template: '',
})
class TestComponent {
}

function setupTestingModule(providers: any[]) {
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
