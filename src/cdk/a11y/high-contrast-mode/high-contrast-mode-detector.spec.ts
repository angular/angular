import {
  BLACK_ON_WHITE_CSS_CLASS,
  HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS,
  HighContrastMode,
  HighContrastModeDetector, WHITE_ON_BLACK_CSS_CLASS,
} from './high-contrast-mode-detector';
import {Platform} from '@angular/cdk/platform';


describe('HighContrastModeDetector', () => {
  let fakePlatform: Platform;

  beforeEach(() => {
    fakePlatform = new Platform();
  });

  it('should detect NONE for non-browser platforms', () => {
    fakePlatform.isBrowser = false;
    const detector = new HighContrastModeDetector(fakePlatform, {});
    expect(detector.getHighContrastMode())
        .toBe(HighContrastMode.NONE, 'Expected high-contrast mode `NONE` on non-browser platforms');
  });

  it('should not apply any css classes for non-browser platforms', () => {
    fakePlatform.isBrowser = false;
    const fakeDocument = getFakeDocument('');
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
        .toBe('', 'Expected body not to have any CSS classes in non-browser platforms');
  });

  it('should detect WHITE_ON_BLACK when backgrounds are coerced to black', () => {
    const detector = new HighContrastModeDetector(fakePlatform, getFakeDocument('rgb(0,0,0)'));
    expect(detector.getHighContrastMode())
        .toBe(HighContrastMode.WHITE_ON_BLACK, 'Expected high-contrast mode `WHITE_ON_BLACK`');
  });

  it('should detect BLACK_ON_WHITE when backgrounds are coerced to white ', () => {
    const detector =
        new HighContrastModeDetector(fakePlatform, getFakeDocument('rgb(255,255,255)'));
    expect(detector.getHighContrastMode())
        .toBe(HighContrastMode.BLACK_ON_WHITE, 'Expected high-contrast mode `BLACK_ON_WHITE`');
  });

  it('should detect NONE when backgrounds are not coerced ', () => {
    const detector = new HighContrastModeDetector(fakePlatform, getFakeDocument('rgb(1,2,3)'));
    expect(detector.getHighContrastMode())
        .toBe(HighContrastMode.NONE, 'Expected high-contrast mode `NONE`');
  });

  it('should apply css classes for BLACK_ON_WHITE high-contrast mode', () => {
    const fakeDocument = getFakeDocument('rgb(255,255,255)');
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.classList).toContain(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
    expect(fakeDocument.body.classList).toContain(BLACK_ON_WHITE_CSS_CLASS);
  });

  it('should apply css classes for WHITE_ON_BLACK high-contrast mode', () => {
    const fakeDocument = getFakeDocument('rgb(0,0,0)');
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.classList).toContain(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
    expect(fakeDocument.body.classList).toContain(WHITE_ON_BLACK_CSS_CLASS);
  });

  it('should not apply any css classes when backgrounds are not coerced', () => {
    const fakeDocument = getFakeDocument('');
    const detector = new HighContrastModeDetector(fakePlatform, fakeDocument);
    detector._applyBodyHighContrastModeCssClasses();
    expect(fakeDocument.body.className)
        .toBe('', 'Expected body not to have any CSS classes in non-browser platforms');
  });
});


/** Gets a fake document that includes a fake `window.getComputedStyle` implementation. */
function getFakeDocument(fakeComputedBackgroundColor: string) {
  return {
    body: document.createElement('body'),
    createElement: (tag: string) => document.createElement(tag),
    defaultView: {
      getComputedStyle: () => ({backgroundColor: fakeComputedBackgroundColor}),
    },
  };
}
