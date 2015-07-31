import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';
import {Promise} from 'angular2/src/facade/async';

describe('WebWorkers Todo', function() {
  afterEach(verifyNoBrowserErrors);

  var URL = "examples/src/web_workers/todo/index.html";

  it('should bootstrap', () => {
    browser.get(URL);

    waitForBootstrap();
    expect(element(by.css("#todoapp header")).getText()).toEqual("todos");
  });

});

function waitForBootstrap(): void {
  browser.wait(protractor.until.elementLocated(by.css("todo-app #todoapp")), 5000);
}
