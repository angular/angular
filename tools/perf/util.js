var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  perfLogs: perfLogs,
  sumTimelineStats: sumTimelineStats,
  runSimpleBenchmark: runSimpleBenchmark,
  verifyNoErrors: verifyNoErrors,
  printObjectAsMarkdown: printObjectAsMarkdown
};

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
  var webdriver = require('protractor/node_modules/selenium-webdriver');
  return browser.driver.schedule(
      new webdriver.Command(webdriver.CommandName.GET_LOG).
          setParameter('type', type),
      'WebDriver.manage().logs().get(' + type + ')');
};


function sumTimelineStats(messages) {
  var recordStats = {
    script: 0,
    gc: {
      time: 0,
      amount: 0
    },
    render: 0
  };
  messages.forEach(function(message) {
    sumTimelineRecordStats(message.record, recordStats);
  });
  return recordStats;
}

function sumTimelineRecordStats(record, result) {
  var summedChildrenDuration = 0;
  if (record.children) {
    record.children.forEach(function(child) {
      summedChildrenDuration += sumTimelineRecordStats(child, result);
    });
  }
  // in case a script forced a gc or a reflow
  // we need to substract the gc time / reflow time
  // from the script time!
  var recordDuration = (record.endTime ? record.endTime - record.startTime : 0)
    - summedChildrenDuration;

  var recordSummed = true;
  if (record.type === 'FunctionCall') {
    result.script += recordDuration;
  } else if (record.type === 'GCEvent') {
    result.gc.time += recordDuration;
    result.gc.amount += record.data.usedHeapSizeDelta;
  } else if (record.type === 'RecalculateStyles' ||
      record.type === 'Layout' ||
      record.type === 'UpdateLayerTree' ||
      record.type === 'Paint' ||
      record.type === 'Rasterize' ||
      record.type === 'CompositeLayers') {
    result.render += recordDuration;
  } else {
    recordSummed = false;
  }
  if (recordSummed) {
    return recordDuration;
  } else {
    return summedChildrenDuration;
  }
}

function runSimpleBenchmark(config) {
  var url = config.url;
  var buttonSelectors = config.buttons;
  // TODO: Don't use a fixed number of warmup / measure iterations,
  // but make this dependent on the variance of the test results!
  var warmupCount = browser.params.warmupCount;
  var measureCount = browser.params.measureCount;
  var name = config.name;

  browser.get(url);
  // TODO(tbosch): replace this with a proper protractor/ng2.0 integration
  // and remove this function as well as all method calls.
  browser.sleep(browser.params.sleepInterval)

  var btns = buttonSelectors.map(function(selector) {
    return $(selector);
  });

  multiClick(btns, warmupCount);
  gc();
  // empty perflogs queue
  perfLogs();

  multiClick(btns, measureCount);
  gc();
  return perfLogs().then(function(logs) {
    var stats = sumTimelineStats(logs['Timeline.eventRecorded']);
    printObjectAsMarkdown(name, stats);
    return stats;
  });
}

function gc() {
  // TODO(tbosch): this only works on chrome.
  // For iOS Safari we need an extension to appium...
  browser.executeScript('window.gc()');
}

function multiClick(buttons, count) {
  var actions = browser.actions();
  for (var i=0; i<count; i++) {
    buttons.forEach(function(button) {
      actions.click(button);
    });
  }
  actions.perform();
}

function verifyNoErrors() {
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

function printObjectAsMarkdown(name, obj) {
  var props = [['name']];
  var vals = [name];
  flattenObj(obj, [], props, vals);
  // log header
  var separators = [];
  var header = props.map(function(propPath) {
    separators.push('----');
    return propPath.join('.');
  }).join(' | ');
  console.log('\n'+header);
  console.log(separators.join(' | '));
  console.log(vals.join(' | '));
  console.log('\n');

  function flattenObj(obj, propPathPrefix, targetProps, targetVals) {
    for (var prop in obj) {
      var val = obj[prop];
      var currPropPath = propPathPrefix.concat([prop]);
      if (val && typeof val === 'object') {
        flattenObj(val, currPropPath, targetProps, targetVals);
      } else {
        targetProps.push(currPropPath);
        var valStr = val;
        if (typeof val === 'number') {
          valStr = val.toFixed(2);
        }
        targetVals.push(valStr);
      }
    }
  }
}