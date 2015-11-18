'use strict';var webdriver = require('selenium-webdriver');
exports.browser = global['browser'];
exports.$ = global['$'];
function clickAll(buttonSelectors) {
    buttonSelectors.forEach(function (selector) { exports.$(selector).click(); });
}
exports.clickAll = clickAll;
function verifyNoBrowserErrors() {
    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    exports.browser.executeScript('1+1');
    exports.browser.manage().logs().get('browser').then(function (browserLog) {
        var filteredLog = browserLog.filter(function (logEntry) {
            if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
                console.log('>> ' + logEntry.message);
            }
            return logEntry.level.value > webdriver.logging.Level.WARNING.value;
        });
        expect(filteredLog.length).toEqual(0);
    });
}
exports.verifyNoBrowserErrors = verifyNoBrowserErrors;
//# sourceMappingURL=e2e_util.js.map