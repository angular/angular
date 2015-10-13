import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';
import {Promise} from 'angular2/src/core/facade/async';

describe('WebWorkers Todo', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });

  var URL = "examples/src/web_workers/todo/index.html";

  it('should bootstrap', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    waitForBootstrap();
    expect(element(by.css("#todoapp header")).getText()).toEqual("todos");
  });

});

function waitForBootstrap(): void {
  browser.wait(protractor.until.elementLocated(by.css("todo-app #todoapp")), 15000);
}
