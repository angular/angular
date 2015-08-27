import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';
import {PromiseWrapper} from "angular2/src/core/facade/async";

var URL = browser.baseUrl + 'examples/src/message_broker/index.html';

describe('message bus', function() {

  afterEach(verifyNoBrowserErrors);

  it('should receive a response from the worker', function() {
    // This test doesn't need to wait for Angular 2, so not using the patched .get() from Protractor
    browser.driver.get(URL);
    browser.sleep(2000);

    var VALUE = "hi there";
    var input = element.all(by.css("#echo_input")).first();
    input.sendKeys(VALUE);
    clickComponentButton("body", "#send_echo");
    browser.wait(protractor.until.elementLocated(protractor.By.css("#echo_result .response")),
                 5000);
    expect(getComponentText("#echo_result", ".response")).toEqual(VALUE);
  });
});

describe('message broker', function() {
  afterEach(verifyNoBrowserErrors);


  it('should be able to run tasks on the UI thread after init', () => {
    var VALUE = '5';

    // This test doesn't need to wait for Angular 2, so not using the patched .get() from Protractor
    browser.driver.get(URL);
    browser.wait(protractor.until.elementLocated(protractor.By.css("#ui_result .result")), 5000);
    expect(getComponentText("#ui_result", ".result")).toEqual(VALUE);
  });
});

function getComponentText(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").textContent');
}

function clickComponentButton(selector, innerSelector) {
  return browser.executeScript('return document.querySelector("' + selector + '").querySelector("' +
                               innerSelector + '").click()');
}
