import {browser, by, element} from 'protractor';

describe('fullscreen', () => {

  beforeEach(() => browser.get('/fullscreen'));

  it('should open a dialog inside a fullscreen element and move it to the body', async () => {
    element(by.id('fullscreen-open')).click();
    element(by.id('dialog-open')).click();

    await expectOverlayInFullscreen();

    element(by.id('dialog-fullscreen-exit')).click();
    await expectOverlayInBody();
  });

  it('should open a dialog inside the body and move it to a fullscreen element', async () => {
    element(by.id('dialog-open')).click();
    await expectOverlayInBody();

    element(by.id('dialog-fullscreen-open')).click();
    await expectOverlayInFullscreen();

    element(by.id('dialog-fullscreen-exit')).click();
    await expectOverlayInBody();
  });

  /** Expects the overlay container to be inside of the body element. */
  async function expectOverlayInBody() {
    expect(await browser.isElementPresent(by.css('body > .cdk-overlay-container')))
      .toBe(true, 'Expected the overlay container to be inside of the body.');
  }

  /** Expects the overlay container to be in fullscreen mode. */
  async function expectOverlayInFullscreen() {
    expect(await browser.isElementPresent(by.css('#fullscreen-pane > .cdk-overlay-container')))
      .toBe(true, 'Expected the overlay container to be in fullscreen mode.');
  }

});
