/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO: @JiaLiPassion, try to add it into travis/saucelabs test after saucelabs support Firefox 52+
// requirement, Firefox 52+, webdriver-manager 12.0.4+, selenium-webdriver 3.3.0+
// test step,
// webdriver-manager update
// webdriver-manager start
// http-server test/webdriver
// node test/webdriver/test.js

// testcase1: removeEventHandler in firefox cross site context
const webdriver = require('selenium-webdriver');
const capabilities = webdriver.Capabilities.firefox();
const driver = new webdriver.Builder()
                   .usingServer('http://localhost:4444/wd/hub')
                   .withCapabilities(capabilities)
                   .build();
driver.get('http://localhost:8080/test.html');
driver.executeAsyncScript((cb) => {window.setTimeout(cb, 1000)});

// test case2 addEventHandler in firefox cross site context
driver.findElement(webdriver.By.css('#thetext')).getText().then(function(text) {
  console.log(text);
});
