/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser, by, element, protractor} from 'protractor';

describe('WebWorker Router', () => {
  beforeEach(() => {
    // This test can't wait for Angular as Testability is not available when using WebWorker
    browser.ignoreSynchronization = true;
    browser.get('/');
  });

  afterEach(() => {
    verifyNoBrowserErrors();
    browser.ignoreSynchronization = false;
  });

  const contentSelector = 'app main h1';
  const navSelector = 'app nav ul';
  const baseUrl = 'all/playground/src/web_workers/router/index.html';

  it('should route on click', () => {
    browser.get(baseUrl);

    waitForElement(contentSelector);
    let content = element(by.css(contentSelector));
    expect(content.getText()).toEqual('Start');

    const aboutBtn = element(by.css(navSelector + ' .about'));
    aboutBtn.click();
    waitForUrl(/\/about/);
    waitForElement(contentSelector);
    waitForElementText(contentSelector, 'About');
    content = element(by.css(contentSelector));
    expect(content.getText()).toEqual('About');
    expect(browser.getCurrentUrl()).toMatch(/\/about/);

    const contactBtn = element(by.css(navSelector + ' .contact'));
    contactBtn.click();
    waitForUrl(/\/contact/);
    waitForElement(contentSelector);
    waitForElementText(contentSelector, 'Contact');
    content = element(by.css(contentSelector));
    expect(content.getText()).toEqual('Contact');
    expect(browser.getCurrentUrl()).toMatch(/\/contact/);
  });

  it('should load the correct route from the URL', () => {
    browser.get(baseUrl + '#/about');

    waitForElement(contentSelector);
    waitForElementText(contentSelector, 'About');
    const content = element(by.css(contentSelector));
    expect(content.getText()).toEqual('About');
  });

  function waitForElement(selector: string): void {
    browser.wait(protractor.until.elementLocated(by.css(selector)), 15000);
  }

  function waitForElementText(contentSelector: string, expected: string): void {
    browser.wait(() => {
      const deferred = protractor.promise.defer();
      const elem = element(by.css(contentSelector));
      elem.getText().then((text: string) => { return deferred.fulfill(text === expected); });
      return deferred.promise;
    }, 5000);
  }

  function waitForUrl(regex: RegExp): void {
    browser.wait(() => {
      const deferred = protractor.promise.defer();
      browser.getCurrentUrl().then(
          (url: string) => { return deferred.fulfill(url.match(regex) !== null); });
      return deferred.promise;
    }, 5000);
  }
});
