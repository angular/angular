var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  gc: gc,
  timelineRecords: timelineRecords,
  timelineTimestamp: timelineTimestamp
};

function timelineTimestamp(timestampId) {
  browser.executeScript('console.timeStamp("'+timestampId+'")');
}

function timelineRecords() {
  return perfLogs().then(function(logs) {
    var logs = logs && logs['Timeline.eventRecorded'] || [];
    return logs.map(function(message) {
      return message.record;
    });
  });
}

function perfLogs() {
  return plainLogs('performance').then(function(entries) {
    var entriesByMethod = {};
    entries.forEach(function(entry) {
      var message = JSON.parse(entry.message).message;
      var entries = entriesByMethod[message.method];
      if (!entries) {
        entries = entriesByMethod[message.method] = [];
      }
      entries.push(message.params);
    });
    return entriesByMethod;
  });
}

// Needed as selenium-webdriver does not forward
// performance logs in the correct way
function plainLogs(type) {
  return browser.driver.schedule(
      new webdriver.Command(webdriver.CommandName.GET_LOG).
          setParameter('type', type),
      'WebDriver.manage().logs().get(' + type + ')');
}

function gc() {
  // TODO(tbosch): this only works on chrome, and we actually should
  // extend chromedriver to use the Debugger.CollectGarbage call of the
  // remote debugger protocol.
  // See http://src.chromium.org/viewvc/blink/trunk/Source/devtools/protocol.json
  // For iOS Safari we need an extension to appium that uses
  // the webkit remote debug protocol. See
  // https://github.com/WebKit/webkit/blob/master/Source/WebInspectorUI/Versions/Inspector-iOS-8.0.json
  return browser.executeScript('window.gc()');
}
