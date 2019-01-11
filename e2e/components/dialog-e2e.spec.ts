import {browser, by, element, Key} from 'protractor';
import {
  expectToExist,
  expectFocusOn,
  pressKeys,
  clickElementAtPoint,
  waitForElement,
} from '../util/index';

describe('dialog', () => {
  beforeEach(async () => await browser.get('/dialog'));

  it('should open a dialog', async () => {
    await element(by.id('default')).click();
    await expectToExist('mat-dialog-container');
  });

  it('should open a template dialog', async () => {
    await expectToExist('.my-template-dialog', false);
    await element(by.id('template')).click();
    await expectToExist('.my-template-dialog');
  });

  it('should close by clicking on the backdrop', async() => {
    await element(by.id('default')).click();

    await waitForDialog();
    await clickOnBackdrop();
    await expectToExist('mat-dialog-container', false);
  });

  it('should close by pressing escape', async () => {
    await element(by.id('default')).click();

    await waitForDialog();
    await pressKeys(Key.ESCAPE);
    await expectToExist('mat-dialog-container', false);
  });

  it('should close by pressing escape when the first tabbable element has lost focus',
    async () => {
      await element(by.id('default')).click();

      await waitForDialog();
      await clickElementAtPoint('mat-dialog-container', { x: 0, y: 0 });
      await pressKeys(Key.ESCAPE);
      await expectToExist('mat-dialog-container', false);
    });

  it('should close by clicking on the "close" button', async () => {
    await element(by.id('default')).click();

    await waitForDialog();
    await element(by.id('close')).click();
    await expectToExist('mat-dialog-container', false);
  });

  it('should focus the first focusable element', async () => {
    await element(by.id('default')).click();

    await waitForDialog();
    await expectFocusOn('mat-dialog-container input');
  });

  it('should restore focus to the element that opened the dialog', async () => {
    const openButton = element(by.id('default'));

    await openButton.click();

    await waitForDialog();
    await clickOnBackdrop();
    await expectFocusOn(openButton);
  });

  it('should prevent tabbing out of the dialog', async () => {
    await element(by.id('default')).click();

    await waitForDialog();
    await pressKeys(Key.TAB, Key.TAB, Key.TAB);
    await expectFocusOn('#close');
  });

  it('should be able to prevent closing by clicking on the backdrop', async () => {
    await element(by.id('disabled')).click();

    await waitForDialog();
    await clickOnBackdrop();
    await expectToExist('mat-dialog-container');
  });

  it('should be able to prevent closing by pressing escape', async () => {
    await element(by.id('disabled')).click();

    await waitForDialog();
    await pressKeys(Key.ESCAPE);
    await expectToExist('mat-dialog-container');
  });

  async function waitForDialog() {
    await waitForElement('mat-dialog-container');
  }

  async function clickOnBackdrop() {
    await clickElementAtPoint('.cdk-overlay-backdrop', { x: 0, y: 0 });
  }
});
