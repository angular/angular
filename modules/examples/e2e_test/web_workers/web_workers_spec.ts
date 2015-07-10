import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';
import {Promise} from 'angular2/src/facade/async';

// returns a promise that resolves in the given number of milliseconds
function wait(time) {
  var promise = new Promise((resolve, reject) => { setTimeout(resolve, time); });
  return promise;
}

describe('WebWorkers', function() {
  afterEach(verifyNoBrowserErrors);
  var selector = "hello-app .greeting";
  var URL = "examples/src/web_workers/index.html";

  it('should greet', () => {
    browser.get(URL);

    browser.wait(protractor.until.elementLocated(by.css(selector)), 5000);
    expect(element.all(by.css(selector)).first().getText()).toEqual("hello world!");
  });

  it('should change greeting', () => {
    browser.get(URL);

    browser.wait(protractor.until.elementLocated(by.css(selector)), 5000);
    element.all(by.css(".changeButton")).first().click();
    browser.wait(wait(500), 600);
    expect(element.all(by.css(selector)).first().getText()).toEqual("howdy world!");
  });

  it("should display correct key names", () => {
    browser.get(URL);
    browser.wait(protractor.until.elementLocated(by.css(".sample-area")), 5000);

    var area = element.all(by.css(".sample-area")).first();
    expect(area.getText()).toEqual('(none)');
    browser.wait(wait(500), 600);

    area.sendKeys('u');
    expect(area.getText()).toEqual("U");
  });
});
