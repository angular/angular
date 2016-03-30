import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('WebWorkers Input', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });
  const selector = 'input-app';
  const URL = 'playground/src/web_workers/input/index.html';
  const VALUE = 'test val';

  it('should bootstrap', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let elem = element(by.css(selector + ' h2'));
    expect(elem.getText()).toEqual('Input App');
  });

  it('should bind to input value', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let elem = element(by.css(selector + ' h2'));

    let input = element(by.css(selector + ' input'));
    input.sendKeys(VALUE);
    let displayElem = element(by.css(selector + ' .input-val'));
    const expectedVal = `Input val is ${VALUE}.`;
    browser.wait(protractor.until.elementTextIs(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  it('should bind to textarea value', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    let elem = element(by.css(selector + ' h2'));

    let input = element(by.css(selector + ' textarea'));
    input.sendKeys(VALUE);
    let displayElem = element(by.css(selector + ' .textarea-val'));
    const expectedVal = `Textarea val is ${VALUE}.`;
    browser.wait(protractor.until.elementTextIs(displayElem, expectedVal), 5000);
    expect(displayElem.getText()).toEqual(expectedVal);
  });

  function waitForBootstrap() {
    browser.wait(protractor.until.elementLocated(by.css(selector + ' h2')), 15000);
    let elem = element(by.css(selector + ' h2'));
    browser.wait(protractor.until.elementTextIs(elem, 'Input App'), 5000);
  }
});