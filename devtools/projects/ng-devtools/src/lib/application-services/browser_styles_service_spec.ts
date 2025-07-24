/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {Browser, BrowserStylesService} from './browser_styles_service';

function configureTestingModuleWithPlatformMock(mock: Partial<Platform>) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: Platform,
        useValue: mock,
      },
    ],
  });
}

function checkForBrowserSpecificStyles(browser: Browser) {
  const doc = TestBed.inject(DOCUMENT);

  // Keep in sync with the service.
  return {
    hasClass: doc.body.classList.contains(browser + '-ui'),
    hasStylesheet: !!doc.head.querySelector(`link[href="./styles/${browser}.css"]`),
  };
}

describe('BrowserStylesService', () => {
  it('should initialize browser-specific styles for Chrome', () => {
    configureTestingModuleWithPlatformMock({
      BLINK: true,
    });

    const service = TestBed.inject(BrowserStylesService);
    service.initBrowserSpecificStyles();

    const {hasClass, hasStylesheet} = checkForBrowserSpecificStyles('chrome');

    expect(hasClass).toBeTrue();
    expect(hasStylesheet).toBeTrue();
  });

  it('should initialize browser-specific styles for Firefox', () => {
    configureTestingModuleWithPlatformMock({
      FIREFOX: true,
    });

    const service = TestBed.inject(BrowserStylesService);
    service.initBrowserSpecificStyles();

    const {hasClass, hasStylesheet} = checkForBrowserSpecificStyles('firefox');

    expect(hasClass).toBeTrue();
    expect(hasStylesheet).toBeTrue();
  });

  it('should default to Chrome UI, if the browser is not supported', () => {
    configureTestingModuleWithPlatformMock({
      WEBKIT: true,
    });

    const service = TestBed.inject(BrowserStylesService);
    service.initBrowserSpecificStyles();

    const {hasClass, hasStylesheet} = checkForBrowserSpecificStyles('chrome');

    expect(hasClass).toBeTrue();
    expect(hasStylesheet).toBeTrue();
  });
});
