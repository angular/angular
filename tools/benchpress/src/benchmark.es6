var stats = require('./stats');
var reporter = require('./reporter');
var commands = require('./commands');

var SUPPORTED_METRICS = {
  script: true,
  gcTime: true,
  gcAmount: true,
  gcTimeInScript: true,
  gcAmountInScript: true,
  gcAmountPerMs: true,
  render: true
};

var RUN_MODE = {
  detect: function(prevState, benchmarkData, iterationIndex) {
    var gcInScriptCount = prevState.gcInScriptCount || 0;
    if (benchmarkData.gcAmountInScript) {
      gcInScriptCount++;
    }
    var ignoreRun = !!benchmarkData.gcAmountInScript;
    var nextMode = RUN_MODE.detect;
    if (iterationIndex > 10) {
      if (gcInScriptCount / iterationIndex > 0.7) {
        nextMode = RUN_MODE.forceGc;
      } else {
        nextMode = RUN_MODE.noGcInScript;
      }
    }
    return {
      forceGc: false,
      ignoreRun: ignoreRun,
      gcInScriptCount: gcInScriptCount,
      nextMode: nextMode
    };
  },
  forceGc: function() {
    return {
      forceGc: true,
      ignoreRun: false,
      nextMode: RUN_MODE.forceGc
    }
  },
  noGcInScript: function(prevState, benchmarkData) {
    var ignoreRun = !!benchmarkData.gcAmountInScript;
    return {
      forceGc: false,
      ignoreRun: ignoreRun,
      nextMode: RUN_MODE.noGcInScript
    }
  },
  plain: function() {
    return {
      forceGc: false,
      ignoreRun: false,
      nextMode: RUN_MODE.plain
    }
  }
};

var nextTimestampId = 0;

module.exports = {
  runBenchmark: runBenchmark,
  supportedMetrics: SUPPORTED_METRICS
};

function runBenchmark(config, workCallback) {
  config.metrics.forEach(function(metric) {
    if (!(metric in SUPPORTED_METRICS)) {
      throw new Error('Metric '+metric+' is not suported by benchpress right now');
    }
  });
  var ROW_FORMAT = ['%-40s', '%12s'].concat(config.metrics.map(function() {
    return '%12s';
  })).join(' | ');

  var benchmarkStatsAggregator = stats.createObjectStatsAggregator(config.metrics, config.sampleSize);

  var startTime = Date.now();
  startLoop().then(endLoop);

  function startLoop(gcData) {
    reporter.printHeading('SCRIPT DATA: sampling size '+config.sampleSize);
    reporter.printTableHeader(ROW_FORMAT, ['name', 'action'].concat(config.metrics));
    if (!(config.mode in RUN_MODE)) {
      throw new Error('Unknown mode '+config.mode);
    }
    return loop(0, {
      forceGc: false,
      ignoreRun: false,
      nextMode: RUN_MODE[config.mode]
    });
  }

  function endLoop(stats) {
    reporter.printTableFooter(ROW_FORMAT, [config.logId, '']
      .concat(formatObjectStats(stats, config.metrics))
    );
    return config.metrics.map(function(metric) {
      return stats[metric];
    });
  }

  function loop(iterationIndex, modeState) {
    return measureTime(function() {
      workCallback();
      if (modeState.forceGc) {
        // For fast tests that don't create a lot of garbage,
        // we don't want to force gc before every run as that
        // can slow down the script execution time (even when we subtract
        // the gc time)!
        // Note: we need to call gc AFTER the actual test so the
        // gc amount is added to the current test run!
        commands.gc();
      }
    }).then(function(benchmarkData) {
      modeState = modeState.nextMode(modeState, benchmarkData, iterationIndex);
      var action = '';
      if (modeState.ignoreRun) {
        action = 'ignore';
      } else if (modeState.forceGc) {
        action = 'forceGc';
      }
      reporter.printRow(ROW_FORMAT, [config.logId + '#' + iterationIndex, action]
        .concat(formatObjectData(benchmarkData, config.metrics))
      );

      var benchmarkStats;
      if (modeState.ignoreRun) {
        benchmarkStats = benchmarkStatsAggregator.current;
      } else {
        benchmarkStats = benchmarkStatsAggregator(benchmarkData);
      }

      if (Date.now() - startTime > config.timeout) {
        return benchmarkStats;
      }
      if (benchmarkStats &&
        (
          benchmarkStats.script.count >= config.sampleSize &&
          benchmarkStats.script.coefficientOfVariation < config.targetCoefficientOfVariation)
        ) {
        return benchmarkStats
      }
      return loop(iterationIndex+1, modeState);
    });
  }
}

function formatObjectData(data, props) {
  return props.map(function(prop) {
    var val = data[prop];
    if (typeof val === 'number') {
      return val.toFixed(2);
    } else {
      return val;
    }
  });
}

function formatObjectStats(stats, props) {
  return props.map(function(prop) {
    var entry = stats[prop];
    return entry.mean.toFixed(2) + '\u00B1' + entry.coefficientOfVariation.toFixed(0)+ '%';
  });
}

function measureTime(callback) {
  var startId = (nextTimestampId++).toString();
  var endId = (nextTimestampId++).toString();
  commands.timelineTimestamp(startId);
  callback();
  commands.timelineTimestamp(endId);
  var allRecords = [];
  return readResult();

  function readResult() {
    return commands.timelineRecords().then(function(records) {
      allRecords.push.apply(allRecords, records);
      var stats = sumTimelineRecords(allRecords, startId, endId);
      if (stats.timeStamps.indexOf(startId) === -1 ||
          stats.timeStamps.indexOf(endId) === -1) {
        // Sometimes the logs have not yet arrived at the webdriver
        // server from the browser.
        // And sometimes, just waiting is not enough, so we
        // execute a dummy js function :-(
        browser.executeScript('1+1');
        browser.sleep(100);
        return readResult();
      } else {
        return stats;
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

