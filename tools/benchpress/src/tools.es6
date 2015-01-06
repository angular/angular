var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  verifyNoBrowserErrors: verifyNoBrowserErrors
};

function verifyNoBrowserErrors() {
  browser.manage().logs().get('browser').then(function(browserLog) {
    var filteredLog = browserLog.filter(function(logEntry) {
      return logEntry.level.value > webdriver.logging.Level.WARNING.value;
    });
    expect(filteredLog.length).toEqual(0);
    if (filteredLog.length) {
      console.log('browser console errors: ' + require('util').inspect(filteredLog));
    }
  });
}

