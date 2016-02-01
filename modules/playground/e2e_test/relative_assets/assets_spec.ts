import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';
import {Promise} from 'angular2/src/facade/async';

function waitForElement(selector) {
  var EC = (<any>protractor).ExpectedConditions;
  // Waits for the element with id 'abc' to be present on the dom.
  browser.wait(EC.presenceOf($(selector)), 20000);
}

describe('relative assets relative-app', () => {

  afterEach(verifyNoBrowserErrors);

  var URL = 'playground/src/relative_assets/';

  it('should load in the templateUrl relative to the my-cmp component', () => {
    browser.get(URL);

    waitForElement('my-cmp .inner-container');
    expect(element.all(by.css('my-cmp .inner-container')).count()).toEqual(1);
  });

  it('should load in the styleUrls relative to the my-cmp component', () => {
    browser.get(URL);

    waitForElement('my-cmp .inner-container');
    var elem = element(by.css('my-cmp .inner-container'));
    var width = browser.executeScript(function(e) {
      return parseInt(window.getComputedStyle(e).width);
    }, elem.getWebElement());

    expect(width).toBe(432);
  });
});
