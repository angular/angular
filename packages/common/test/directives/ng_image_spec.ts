/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {IMAGE_LOADER, ImageLoader, ImageLoaderConfig, NgImage} from '@angular/common/src/directives/ng_image';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('Image directive', () => {
  it('should set `src` to `raw-src` value if image loader is not provided', () => {
    setupTestingModule();

    const template = '<img raw-src="path/img.png" width="100" height="50">';
    const fixture = createTestComponent(template);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const img = nativeElement.querySelector('img')!;
    expect(img.src.endsWith('/path/img.png')).toBeTrue();
  });

  it('should use an image loader provided via `IMAGE_LOADER` token', () => {
    const imageLoader = (config: ImageLoaderConfig) => `${config.src}?w=${config.width}`;
    setupTestingModule({imageLoader});

    const template = '<img raw-src="path/img.png" width="150" height="50">';
    const fixture = createTestComponent(template);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const img = nativeElement.querySelector('img')!;
    expect(img.src.endsWith('/path/img.png?w=150')).toBeTrue();
  });

  it('should use an image loader from inputs over the one provided via `IMAGE_LOADER` token',
     () => {
       const imageLoader = (config: ImageLoaderConfig) =>
           `${config.src}?w=${config.width}&source=IMAGE_LOADER`;
       setupTestingModule({imageLoader});

       const template =
           '<img raw-src="path/img.png" [loader]="cmpImageLoader" width="150" height="50">';
       const fixture = createTestComponent(template);
       fixture.detectChanges();

       const nativeElement = fixture.nativeElement as HTMLElement;
       const img = nativeElement.querySelector('img')!;
       expect(img.src.endsWith('/path/img.png?w=150&source=component')).toBeTrue();
     });

  describe('setup error handling', () => {
    it('should throw if both `src` and `raw-src` are present', () => {
      setupTestingModule();

      const template = '<img raw-src="path/img.png" src="path/img2.png" width="100" height="50">';
      expect(() => {
        const fixture = createTestComponent(template);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG02950: The NgImage directive (activated on an <img> element with the ' +
              '`raw-src="path/img.png"`) detected that the `src` is also set (to `path/img2.png`). ' +
              'Please remove the `src` attribute from this image. The NgImage directive will use ' +
              'the `raw-src` to compute the final image URL and set the `src` itself.');
    });
  });
});

// Helpers

@Component({
  selector: 'test-cmp',
  template: '',
})
class TestComponent {
  cmpImageLoader = (config: ImageLoaderConfig) => {
    return `${config.src}?w=${config.width}&source=component`;
  }
}

function setupTestingModule(config?: {imageLoader: ImageLoader}) {
  const providers =
      config?.imageLoader ? [{provide: IMAGE_LOADER, useValue: config?.imageLoader}] : [];
  TestBed.configureTestingModule({
    // Note: the `NgImage` is a part of declarations for now,
    // since it's experimental and not yet added to the `CommonModule`.
    declarations: [TestComponent, NgImage],
    imports: [CommonModule],
    providers,
  });
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
