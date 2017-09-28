import {browser, by, element, Key} from 'protractor';
import {
  expectToExist,
  expectFocusOn,
  pressKeys,
  clickElementAtPoint,
  waitForElement,
} from '../util/index';
import {screenshot} from '../screenshot';


describe('dialog', () => {
  beforeEach(() => browser.get('/dialog'));

  it('should open a dialog', () => {
    element(by.id('default')).click();
    expectToExist('mat-dialog-container');
    screenshot('simple dialog opened');
  });

  it('should open a template dialog', () => {
    expectToExist('.my-template-dialog', false);
    element(by.id('template')).click();
    expectToExist('.my-template-dialog');
  });

  it('should close by clicking on the backdrop', async() => {
    element(by.id('default')).click();

    await waitForDialog();
    clickOnBackrop();
    expectToExist('mat-dialog-container', false);
  });

  it('should close by pressing escape', async () => {
    element(by.id('default')).click();

    await waitForDialog();
    pressKeys(Key.ESCAPE);
    expectToExist('mat-dialog-container', false);
  });

  it('should close by pressing escape when the first tabbable element has lost focus',
    async () => {
      element(by.id('default')).click();

      await waitForDialog();
      clickElementAtPoint('mat-dialog-container', { x: 0, y: 0 });
      pressKeys(Key.ESCAPE);
      expectToExist('mat-dialog-container', false);
    });

  it('should close by clicking on the "close" button', async () => {
    element(by.id('default')).click();

    await waitForDialog();
    element(by.id('close')).click();
    expectToExist('mat-dialog-container', false);
  });

  it('should focus the first focusable element', async () => {
    element(by.id('default')).click();

    await waitForDialog();
    expectFocusOn('mat-dialog-container input');
  });

  it('should restore focus to the element that opened the dialog', async () => {
    let openButton = element(by.id('default'));

    openButton.click();

    await waitForDialog();
    clickOnBackrop();
    expectFocusOn(openButton);
  });

  it('should prevent tabbing out of the dialog', async () => {
    element(by.id('default')).click();

    await waitForDialog();
    pressKeys(Key.TAB, Key.TAB, Key.TAB);
    expectFocusOn('#close');
  });

  it('should be able to prevent closing by clicking on the backdrop', async () => {
    element(by.id('disabled')).click();

    await waitForDialog();
    clickOnBackrop();
    expectToExist('mat-dialog-container');
  });

  it('should be able to prevent closing by pressing escape', async () => {
    element(by.id('disabled')).click();

    await waitForDialog();
    pressKeys(Key.ESCAPE);
    expectToExist('mat-dialog-container');
  });

  function waitForDialog() {
    return waitForElement('mat-dialog-container');
  }

  function clickOnBackrop() {
    clickElementAtPoint('.cdk-overlay-backdrop', { x: 0, y: 0 });
  }
});
