import {
  BLACK_ON_WHITE_CSS_CLASS,
  HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS,
  HighContrastMode,
  HighContrastModeDetector,
  WHITE_ON_BLACK_CSS_CLASS,
} from './high-contrast-mode-detector';
import {Platform} from '@angular/cdk/platform';
import {TestBed} from '@angular/core/testing';
import {Provider} from '@angular/core';
import {A11yModule} from '../a11y-module';
import {DOCUMENT} from '@angular/common';

describe('HighContrastModeDetector', () => {
  function getDetector(document: unknown, platform?: Platform) {
    const providers: Provider[] = [{provide: DOCUMENT, useValue: document}];

    if (platform) {
      providers.push({provide: Platform, useValue: platform});
    }

    TestBed.configureTestingModule({imports: [A11yModule], providers});
    return TestBed.inject(HighContrastModeDetector);
  }

  it('should detect NONE for non-browser platforms', () => {
    const detector = getDetector(getFakeDocument(''), {isBrowser: false} as Platform);

    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `NONE` on non-browser platforms')
      .toBe(HighContrastMode.NONE);
  });

  it('should not apply any css classes for non-browser platforms', () => {
    const fakeDocument = getFakeDocument('');
    const detector = getDetector(fakeDocument, {isBrowser: false} as Platform);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
      .withContext('Expected body not to have any CSS classes in non-browser platforms')
      .toBe('');
  });

  it('should detect WHITE_ON_BLACK when backgrounds are coerced to black', () => {
    const detector = getDetector(getFakeDocument('rgb(0,0,0)'));
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `WHITE_ON_BLACK`')
      .toBe(HighContrastMode.WHITE_ON_BLACK);
  });

  it('should detect BLACK_ON_WHITE when backgrounds are coerced to white ', () => {
    const detector = getDetector(getFakeDocument('rgb(255,255,255)'));
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `BLACK_ON_WHITE`')
      .toBe(HighContrastMode.BLACK_ON_WHITE);
  });

  it('should detect NONE when backgrounds are not coerced ', () => {
    const detector = getDetector(getFakeDocument('rgb(1,2,3)'));
    expect(detector.getHighContrastMode())
      .withContext('Expected high-contrast mode `NONE`')
      .toBe(HighContrastMode.NONE);
  });

  it('should apply css classes for BLACK_ON_WHITE high-contrast mode', () => {
    const fakeDocument = getFakeDocument('rgb(255,255,255)');
    const detector = getDetector(fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.classList).toContain(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
    expect(fakeDocument.body.classList).toContain(BLACK_ON_WHITE_CSS_CLASS);
  });

  it('should apply css classes for WHITE_ON_BLACK high-contrast mode', () => {
    const fakeDocument = getFakeDocument('rgb(0,0,0)');
    const detector = getDetector(fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.classList).toContain(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
    expect(fakeDocument.body.classList).toContain(WHITE_ON_BLACK_CSS_CLASS);
  });

  it('should not apply any css classes when backgrounds are not coerced', () => {
    const fakeDocument = getFakeDocument('');
    const detector = getDetector(fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
      .withContext('Expected body not to have any CSS classes in non-browser platforms')
      .toBe('');
  });
});

/** Gets a fake document that includes a fake `window.getComputedStyle` implementation. */
function getFakeDocument(fakeComputedBackgroundColor: string) {
  return {
    body: document.createElement('body'),
    createElement: (tag: string) => document.createElement(tag),
    querySelectorAll: (selector: string) => document.querySelectorAll(selector),
    defaultView: {
      getComputedStyle: () => ({backgroundColor: fakeComputedBackgroundColor}),
    },
  };
}
