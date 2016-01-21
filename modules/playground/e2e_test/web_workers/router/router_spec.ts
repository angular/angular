import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe("WebWorker Router", () => {
  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });

  let contentSelector = "app main h1";
  let navSelector = "app nav ul";
  var baseUrl = "playground/src/web_workers/router/index.html";

  it("should route on click", () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(baseUrl);

    waitForElement(contentSelector);
    var content = element(by.css(contentSelector));
    expect(content.getText()).toEqual("Start");

    let aboutBtn = element(by.css(navSelector + " .about"));
    aboutBtn.click();
    waitForUrl(/\/about/);
    waitForElement(contentSelector);
    content = element(by.css(contentSelector));
    waitForElementText(content, "About");
    expect(content.getText()).toEqual("About");
    expect(browser.getCurrentUrl()).toMatch(/\/about/);

    let contactBtn = element(by.css(navSelector + " .contact"));
    contactBtn.click();
    waitForUrl(/\/contact/);
    waitForElement(contentSelector);
    content = element(by.css(contentSelector));
    waitForElementText(content, "Contact");
    expect(content.getText()).toEqual("Contact");
    expect(browser.getCurrentUrl()).toMatch(/\/contact/);
  });

  it("should load the correct route from the URL", () => {
    // This test can't wait for Angular 2 as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get(baseUrl + "#/about");

    waitForElement(contentSelector);
    let content = element(by.css(contentSelector));
    waitForElementText(content, "About");
    expect(content.getText()).toEqual("About");
  });

  function waitForElement(selector: string): void {
    browser.wait(protractor.until.elementLocated(by.css(selector)), 15000);
  }

  function waitForElementText(elem: protractor.ElementFinder, expected: string): void {
    browser.wait(() => {
      let deferred = protractor.promise.defer();
      elem.getText().then((text) => { return deferred.fulfill(text === expected); });
      return deferred.promise;
    }, 5000);
  }

  function waitForUrl(regex): void {
    browser.wait(() => {
      let deferred = protractor.promise.defer();
      browser.getCurrentUrl().then(
          (url) => { return deferred.fulfill(url.match(regex) !== null); });
      return deferred.promise;
    }, 5000);
  }
});
