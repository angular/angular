import {browser, by, element} from 'protractor';

describe('fullscreen', () => {

  beforeEach(() => browser.get('/fullscreen'));

  it('should open a dialog inside a fullscreen element and move it to the document body', () => {
    element(by.id('fullscreen-open')).click();
    element(by.id('dialog-open')).click();

    expectOverlayInFullscreen();

    element(by.id('dialog-fullscreen-exit')).click();
    expectOverlayInBody();
  });

  it('should open a dialog inside the document body and move it to a fullscreen element', () => {
    element(by.id('dialog-open')).click();
    expectOverlayInBody();

    element(by.id('dialog-fullscreen-open')).click();
    expectOverlayInFullscreen();

    element(by.id('dialog-fullscreen-exit')).click();
    expectOverlayInBody();
  });

  /** Expects the overlay container to be inside of the body element. */
  function expectOverlayInBody() {
    expect(browser.isElementPresent(by.css('body > .cdk-overlay-container')))
      .toBe(true, 'Expected the overlay container to be inside of the body.');
  }

  /** Expects the overlay container to be in fullscreen mode. */
  function expectOverlayInFullscreen() {
    expect(browser.isElementPresent(by.css('#fullscreen-pane > .cdk-overlay-container')))
      .toBe(true, 'Expected the overlay container to be in fullscreen mode.');
  }

});
