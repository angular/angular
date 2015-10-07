import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';
import {Promise} from 'angular2/src/core/facade/async';

describe('WebWorkers Kitchen Sink', function() {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });
  var selector = "hello-app .greeting";
  var URL = "examples/src/web_workers/kitchen_sink/index.html";

  it('should greet', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    browser.wait(protractor.until.elementLocated(by.css(selector)), 15000);
    expect(element.all(by.css(selector)).first().getText()).toEqual("hello world!");

  });

  it('should change greeting', () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);

    browser.wait(protractor.until.elementLocated(by.css(selector)), 15000);
    element(by.css("hello-app .changeButton")).click();
    var elem = element(by.css(selector));
    browser.wait(protractor.until.elementTextIs(elem, "howdy world!"), 5000);
    expect(elem.getText()).toEqual("howdy world!");
  });

  it("should display correct key names", () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(URL);
    browser.wait(protractor.until.elementLocated(by.css(".sample-area")), 15000);

    var area = element.all(by.css(".sample-area")).first();
    expect(area.getText()).toEqual('(none)');

    area.sendKeys('u');
    browser.wait(protractor.until.elementTextIs(area, "U"), 5000);
    expect(area.getText()).toEqual("U");
  });
});
