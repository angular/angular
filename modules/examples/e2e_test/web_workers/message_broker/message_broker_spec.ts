import {verifyNoBrowserErrors} from "angular2/src/test_lib/e2e_util";
import {PromiseWrapper} from "angular2/src/core/facade/async";

var URL = "examples/src/web_workers/message_broker/index.html";

describe("MessageBroker", function() {

  afterEach(verifyNoBrowserErrors);

  it("should bootstrap", () => {
    browser.get(URL);
    waitForBootstrap();
    expect(element(by.css("app h1")).getText()).toEqual("WebWorker MessageBroker Test");
  });

  it("should echo messages", () => {
    const VALUE = "Hi There";
    browser.get(URL);
    waitForBootstrap();

    var input = element.all(by.css("#echo_input")).first();
    input.sendKeys(VALUE);
    element(by.css("#send_echo")).click();
    var area = element(by.css("#echo_result"));
    browser.wait(protractor.until.elementTextIs(area, VALUE), 5000);
    expect(area.getText()).toEqual(VALUE);
  });
});

function waitForBootstrap(): void {
  browser.wait(protractor.until.elementLocated(by.css("app h1")), 5000);
}
