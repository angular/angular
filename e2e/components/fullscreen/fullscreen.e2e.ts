import {browser, by, element, Key, ProtractorBy} from 'protractor';

describe('fullscreen', () => {
  beforeEach(() => browser.get('/fullscreen'));

  let overlayInBody = () =>
    browser.isElementPresent(by.css('body > .cdk-overlay-container') as ProtractorBy);
  let overlayInFullscreen = () =>
    browser.isElementPresent(by.css('#fullscreenpane > .cdk-overlay-container') as ProtractorBy);

  it('should open a dialog inside a fullscreen element and move it to the document body', () => {
    element(by.id('fullscreen')).click();
    element(by.id('dialog')).click();

    overlayInFullscreen().then((isPresent: boolean) => {
        expect(isPresent).toBe(true);
        element(by.id('exitfullscreenindialog')).click();
        overlayInBody().then((isPresent: boolean) => {
            expect(isPresent).toBe(true);
        });
    });
  });

  it('should open a dialog inside the document body and move it to a fullscreen element', () => {
    element(by.id('dialog')).click();
    overlayInBody().then((isPresent: boolean) => {
        expect(isPresent).toBe(true);
        element(by.id('fullscreenindialog')).click();
        overlayInFullscreen().then((isPresent: boolean) => {
            expect(isPresent).toBe(true);
            element(by.id('exitfullscreenindialog')).click();
            overlayInBody().then((isPresent: boolean) => {
                expect(isPresent).toBe(true);
            });
        });
    });
  });
});
