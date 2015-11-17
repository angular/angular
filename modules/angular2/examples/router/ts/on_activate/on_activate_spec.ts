import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';
import {Promise} from 'angular2/src/facade/async';

function waitForElement(selector) {
  var EC = (<any>protractor).ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('on activate example app', function() {
  afterEach(verifyNoBrowserErrors);

  var URL = 'angular2/examples/router/ts/on_activate/';

  it('should update the text when navigating between routes', function() {
    browser.get(URL);
    waitForElement('my-cmp');

    expect(element(by.css('my-cmp')).getText())
        .toContain('routerOnActivate: Finished navigating from "null" to ""');

    element(by.css('#param-link')).click();
    waitForElement('my-cmp');

    expect(element(by.css('my-cmp')).getText())
        .toContain('routerOnActivate: Finished navigating from "" to "1"');

    browser.navigate().back();
    waitForElement('my-cmp');

    expect(element(by.css('my-cmp')).getText())
        .toContain('routerOnActivate: Finished navigating from "1" to ""');
  });
});
