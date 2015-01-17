var statistics = require('./statistics');
var commands = require('./commands');
var webdriver = require('protractor/node_modules/selenium-webdriver');

var SUPPORTED_METRICS = {
  script: true,
  gcTime: true,
  gcAmount: true,
  gcTimeInScript: true,
  gcAmountInScript: true,
  gcAmountPerMs: true,
  render: true
};

var nextTimestampId = 0;

module.exports = {
  runBenchmark: runBenchmark,
  supportedMetrics: SUPPORTED_METRICS
};

function runBenchmark(config, workCallback) {
  var reporters = config.reporters.filter(function(Class) {
    return !!Class;
  }).map(function(Class) {
    return new Class(config);
  });
  var scriptMetricIndex = -1;
  config.metrics.forEach(function(metric, index) {
    if (!(metric in SUPPORTED_METRICS)) {
      throw new Error('Metric '+metric+' is not suported by benchpress right now');
    }
    if (metric === 'script') {
      scriptMetricIndex = index;
    }
  });
  if (scriptMetricIndex === -1) {
    throw new Error('Metric "script" needs to be included in the metrics');
  }

  var startTime = Date.now();
  commands.gc();
  reporters.forEach(function(reporter) {
    reporter.begin();
  });
  return measureLoop({
    index: 0,
    prevSample: [],
    endAfterRun: false,
    work: function() {
      workCallback();
      if (this.endAfterRun || config.forceGc) {
        commands.gc();
      }
    },
    process: function(data) {
      var measuredValues = config.metrics.map(function(metric) {
        return data.stats[metric];
      });
      var reporterData = {
        values: measuredValues,
        index: this.index,
        records: data.records,
        forceGc: this.endAfterRun || config.forceGc
      };
      reporters.forEach(function(reporter) {
        reporter.add(reporterData);
      });

      var newSample = this.prevSample.concat([reporterData]);
      if (newSample.length > config.sampleSize) {
        newSample = newSample.slice(newSample.length - config.sampleSize);
      }

      var result = null;
      var xValues = [];
      var yValues = [];
      newSample.forEach(function(data, index) {
        // For now, we only use the array index as x value.
        // TODO(tbosch): think about whether we should use time here instead
        xValues.push(index);
        yValues.push(data.values[scriptMetricIndex]);
      });
      var regressionSlope = statistics.getRegressionSlope(
        xValues, statistics.calculateMean(xValues),
        yValues, statistics.calculateMean(yValues)
      );
      // TODO(tbosch): ask someone who really understands statistics whether this is reasonable
      // When we detect that we are not getting slower any more,
      // we do one more round where we force gc so we get all the gc data before we stop.
      var endAfterNextRun = ((Date.now() - startTime > config.timeout) ||
          (newSample.length === config.sampleSize && regressionSlope >= 0));
      return {
        index: this.index+1,
        work: this.work,
        process: this.process,
        endAfterRun: endAfterNextRun,
        result: this.endAfterRun ? newSample : null,
        prevSample: newSample
      };
    }
  }).then(function(stableSample) {
    reporters.forEach(function(reporter) {
      reporter.end(stableSample);
    });
  });
}

function measureLoop(startState) {
  var startTimestampId = (nextTimestampId++).toString();
  commands.timelineTimestamp(startTimestampId);

  return next(startTimestampId, startState, []);

  function next(startTimestampId, state, lastRecords) {
    state.work();
    var endTimestampId = (nextTimestampId++).toString();
    commands.timelineTimestamp(endTimestampId);

    return readStats(startTimestampId, endTimestampId, lastRecords).then(function(data) {
      var nextState = state.process({
        stats: data.stats,
        records: data.records
      });
      if (nextState.result) {
        return nextState.result;
      } else {
        return next(endTimestampId, nextState, data.lastRecords);
      }
    });
  }

  function readStats(startTimestampId, endTimestampId, lastRecords) {
    return commands.timelineRecords().then(function(newRecords) {
      var records = lastRecords.concat(newRecords);
      var stats = sumTimelineRecords(records, startTimestampId, endTimestampId);
      if (stats.timeStamps.indexOf(startTimestampId) === -1 ||
          stats.timeStamps.indexOf(endTimestampId) === -1) {
        // Sometimes the logs have not yet arrived at the webdriver
        // server from the browser, so we need to wait
        // TODO(tbosch): This seems to be a bug in chrome / chromedriver!
        // And sometimes, just waiting is not enough, so we
        // execute a dummy js function :-(
        browser.executeScript('1+1');
        browser.sleep(100);
        return readStats(startTimestampId, endTimestampId, records);
      } else {
        return {
          stats: stats,
          records: records,
          lastRecords: newRecords
        };
      }
    });
  }

}

function sumTimelineRecords(records, startTimeStampId, endTimeStampId) {
  var isStarted = false;
  var recordStats = {
    script: 0,
    gcTime: 0,
    gcAmount: 0,
    gcTimeInScript: 0,
    gcAmountInScript: 0,
    render: 0,
    timeStamps: []
  };
  records.forEach(function(record) {
    processRecord(record, recordStats, false);
  });
  recordStats.gcAmountPerMs = 0;
  if (recordStats.gcAmount) {
    recordStats.gcAmountPerMs = recordStats.gcAmount / recordStats.gcTime;
  }
  return recordStats;

  function processRecord(record, recordStats, parentIsFunctionCall) {
    if (record.type === 'TimeStamp' && record.data.message === startTimeStampId) {
      isStarted = true;
    }

    // ignore scripts that were injected by Webdriver (e.g. calculation of element positions, ...)
    var isFunctionCall = record.type === 'FunctionCall' &&
      (!record.data || record.data.scriptName !== 'InjectedScript');

    var summedChildrenDuration = 0;
    if (record.children) {
      record.children.forEach(function(child) {
        summedChildrenDuration += processRecord(child, recordStats, isFunctionCall);
      });
    }
    var recordDuration;
    var recordUsed = false;
    // we need to substract the time of child records
    // that have been added to the stats from this record.
    // E.g. for a script record that triggered a gc or reflow while executing.

    // Attention: If a gc happens during a script execution, the
    // execution time of the script is usually slower than normal,
    // even when we substract the gc time!!
    recordDuration = (record.endTime ? record.endTime - record.startTime : 0)
      - summedChildrenDuration;

    if (isStarted) {
      if (isFunctionCall) {
        recordStats.script += recordDuration;
        recordUsed = true;
      } else if (record.type === 'GCEvent') {
        recordStats.gcTime += recordDuration;
        recordStats.gcAmount += record.data.usedHeapSizeDelta;
        if (parentIsFunctionCall) {
          recordStats.gcTimeInScript += recordDuration;
          recordStats.gcAmountInScript += record.data.usedHeapSizeDelta;
        }
        recordUsed = true;
      } else if (record.type === 'RecalculateStyles' ||
          record.type === 'Layout' ||
          record.type === 'UpdateLayerTree' ||
          record.type === 'Paint' ||
          record.type === 'Rasterize' ||
          record.type === 'CompositeLayers') {
        recordStats.render += recordDuration;
        recordUsed = true;
      } else if (record.type === 'TimeStamp') {
        recordStats.timeStamps.push(record.data.message);
      }
    }

    if (record.type === 'TimeStamp' && record.data.message === endTimeStampId) {
      isStarted = false;
    }
    return recordUsed ? recordDuration : summedChildrenDuration;
  }
}

