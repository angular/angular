var webdriver = require('protractor/node_modules/selenium-webdriver');

module.exports = {
  perfLogs: perfLogs,
  sumTimelineRecords: sumTimelineRecords,
  runClickBenchmark: runClickBenchmark,
  verifyNoErrors: verifyNoErrors,
  printObjectAsMarkdown: printObjectAsMarkdown
};

function runClickBenchmark(config) {
  var buttons = config.buttons.map(function(selector) {
    return $(selector);
  });
  var globalParams = browser.params;

  // empty perflogs queue and gc
  gc();
  perfLogs();
  var sampleQueue = [];
  var bestSampleStats = null;

  loop(globalParams.maxRepeatCount).then(function(stats) {
    printObjectAsMarkdown(config.name, stats);
  });

  function loop(count) {
    if (!count) {
      return bestSampleStats;
    }
    return webdriver.promise.all(buttons.map(function(button) {
      // Note: even though we remove the gc time from the script time,
      // we still get a high standard devication if we don't gc after every click...
      return button.click().then(gc);
    })).then(function() {
      return perfLogs();
    }).then(function(logs) {
      var stats = calculateStatsBasedOnLogs(logs);
      if (stats) {
        if (stats.script.error < globalParams.exitOnErrorLowerThan) {
          return stats;
        }
        if (!bestSampleStats || stats.script.error < bestSampleStats.script.error) {
          bestSampleStats = stats;
        }
      }
      return loop(count-1);
    });
  }

  function calculateStatsBasedOnLogs(logs) {
    sampleQueue.push(sumTimelineRecords(logs['Timeline.eventRecorded']));
    if (sampleQueue.length >= globalParams.sampleSize) {
      sampleQueue.splice(0, sampleQueue.length - globalParams.sampleSize);
      // TODO: gc numbers don't have much meaning right now,
      // as a benchmark run destroys everything.
      // We need to measure the heap size after gc as well!
      return calculateObjectSampleStats(sampleQueue, ['script', 'render', 'gcTime', 'gcAmount']);
    }
    return null;
  }
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


function sumTimelineRecords(messages) {
  var recordStats = {
    script: 0,
    gcTime: 0,
    gcAmount: 0,
    render: 0
  };
  messages.forEach(function(message) {
    processRecord(message.record, recordStats);
  });
  return recordStats;

  function processRecord(record, recordStats) {
    var summedChildrenDuration = 0;
    if (record.children) {
      record.children.forEach(function(child) {
        summedChildrenDuration += processRecord(child, recordStats);
      });
    }

    var recordDuration;
    var recordUsed = false;
    if (recordStats) {
      // we need to substract the time of child records
      // that have been added to the stats from this record.
      // E.g. for a script record that triggered a gc or reflow while executing.
      recordDuration = (record.endTime ? record.endTime - record.startTime : 0)
        - summedChildrenDuration;
      if (record.type === 'FunctionCall') {
        if (!record.data || record.data.scriptName !== 'InjectedScript') {
          // ignore scripts that were injected by Webdriver (e.g. calculation of element positions, ...)
          recordStats.script += recordDuration;
          recordUsed = true;
        }
      } else if (record.type === 'GCEvent') {
        recordStats.gcTime += recordDuration;
        recordStats.gcAmount += record.data.usedHeapSizeDelta;
        recordUsed = true;
      } else if (record.type === 'RecalculateStyles' ||
          record.type === 'Layout' ||
          record.type === 'UpdateLayerTree' ||
          record.type === 'Paint' ||
          record.type === 'Rasterize' ||
          record.type === 'CompositeLayers') {
        recordStats.render += recordDuration;
        recordUsed = true;
      }
    }
    return recordUsed ? recordDuration : summedChildrenDuration;
  }
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

function calculateObjectSampleStats(objectSamples, properties) {
  var result = {};
  properties.forEach(function(prop) {
    var samples = objectSamples.map(function(objectSample) {
      return objectSample[prop];
    });
    var mean = calculateMean(samples);
    var error = calculateCoefficientOfVariation(samples, mean);
    result[prop] = {
      mean: mean,
      error: error
    };
  });
  return result;
}

function calculateCoefficientOfVariation(sample, mean) {
  return calculateStandardDeviation(sample, mean) / mean * 100;
}

function calculateMean(sample) {
  var total = 0;
  sample.forEach(function(x) { total += x; });
  return total / sample.length;
}

function calculateStandardDeviation(sample, mean) {
  var deviation = 0;
  sample.forEach(function(x) {
    deviation += Math.pow(x - mean, 2);
  });
  deviation = deviation / (sample.length -1);
  deviation = Math.sqrt(deviation);
  return deviation;
};