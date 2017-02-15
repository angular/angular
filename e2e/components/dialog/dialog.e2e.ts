import {browser, by, element, Key} from 'protractor';
import {expectToExist, expectFocusOn} from '../../util/asserts';
import {pressKeys, clickElementAtPoint} from '../../util/actions';
import {waitForElement} from '../../util/query';

describe('dialog', () => {
  beforeEach(() => browser.get('/dialog'));

  it('should open a dialog', () => {
    element(by.id('default')).click();
    expectToExist('md-dialog-container');
  });

  it('should open a template dialog', () => {
    expectToExist('.my-template-dialog', false);
    element(by.id('template')).click();
    expectToExist('.my-template-dialog');
  });

  it('should close by clicking on the backdrop', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      expectToExist('md-dialog-container', false);
    });
  });

  it('should close by pressing escape', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      pressKeys(Key.ESCAPE);
      expectToExist('md-dialog-container', false);
    });
  });

  it('should close by pressing escape when the first tabbable element has lost focus', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      clickElementAtPoint('md-dialog-container', { x: 0, y: 0 });
      pressKeys(Key.ESCAPE);
      expectToExist('md-dialog-container', false);
    });
  });

  it('should close by clicking on the "close" button', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      element(by.id('close')).click();
      expectToExist('md-dialog-container', false);
    });
  });

  it('should focus the first focusable element', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      expectFocusOn('md-dialog-container input');
    });
  });

  it('should restore focus to the element that opened the dialog', () => {
    let openButton = element(by.id('default'));

    openButton.click();

    waitForDialog().then(() => {
      clickOnBackrop();
      expectFocusOn(openButton);
    });
  });

  it('should prevent tabbing out of the dialog', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      let tab = Key.TAB;

      pressKeys(tab, tab, tab);
      expectFocusOn('#close');
    });
  });

  it('should be able to prevent closing by clicking on the backdrop', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      expectToExist('md-dialog-container');
    });
  });

  it('should be able to prevent closing by pressing escape', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      pressKeys(Key.ESCAPE);
      expectToExist('md-dialog-container');
    });
  });

  function waitForDialog() {
    return waitForElement('md-dialog-container');
  }

  function clickOnBackrop() {
    clickElementAtPoint('.cdk-overlay-backdrop', { x: 0, y: 0 });
  }
});
