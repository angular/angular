var stats = require('./stats');
var reporter = require('./reporter');
var commands = require('./commands');

var SUPPORTED_METRICS = {
  script: true,
  gcTime: true,
  gcAmount: true,
  gcTimeDuringScript: true,
  gcAmountDuringScript: true,
  gcAmountPerMs: true,
  render: true
};
var DETERMINE_FORCE_GC_MODE_ITERATIONS = 5;

var MODE_FORCE_GC = 'forceGc';
var MODE_IGNORE_RUNS_WITH_GC = 'ignoreRunsWithGc';
var MODE_INDETERMINATE = 'indeterminate';

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
  var ROW_FORMAT = ['%-40s'].concat(config.metrics.map(function() {
    return '%12s';
  })).join(' | ');

  var benchmarkStatsAggregator = stats.createObjectStatsAggregator(config.sampleSize);

  var startTime = Date.now();
  startLoop().then(endLoop);

  var gcDuringScriptCount = 0;

  function startLoop(gcData) {
    reporter.printHeading('SCRIPT DATA: sampling size '+config.sampleSize);
    reporter.printTableHeader(ROW_FORMAT, ['name'].concat(config.metrics));
    return loop(0, MODE_INDETERMINATE);
  }

  function endLoop(stats) {
    reporter.printTableFooter(ROW_FORMAT, [config.logId]
      .concat(formatObjectStats(stats, config.metrics))
    );
    return config.metrics.map(function(metric) {
      return stats[metric];
    });
  }

  function loop(iterationIndex, mode) {
    // For fast tests that don't create a lot of garbage,
    // we don't want to force gc before every run as that
    // can slow down the script execution time (even when we subtract
    // the gc time)!
    if (mode === MODE_FORCE_GC) {
      commands.gc();
    }
    return measureTime(workCallback).then(function(benchmarkData) {
      var hasGcDuringScript = !!benchmarkData.gcTimeDuringScript;
      var ignoreBenchmarkRun = false;
      if (hasGcDuringScript) {
        gcDuringScriptCount ++;
        ignoreBenchmarkRun = (mode === MODE_INDETERMINATE || mode === MODE_IGNORE_RUNS_WITH_GC);
      }
      if (mode === MODE_INDETERMINATE && iterationIndex >= DETERMINE_FORCE_GC_MODE_ITERATIONS) {
        mode = (gcDuringScriptCount / iterationIndex > 0.5) ? MODE_FORCE_GC : MODE_IGNORE_RUNS_WITH_GC;
      }

      var rowTitle;
      if (ignoreBenchmarkRun) {
        rowTitle = '(ignored: gc in script)';
      } else {
        rowTitle = config.logId + '#' + iterationIndex;
      }
      reporter.printRow(ROW_FORMAT, [rowTitle]
        .concat(formatObjectData(benchmarkData, config.metrics))
      );

      var benchmarkStats;
      if (!ignoreBenchmarkRun) {
        benchmarkStats = benchmarkStatsAggregator(benchmarkData);
      } else {
        benchmarkStats = benchmarkStatsAggregator.current;
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
      return loop(iterationIndex+1, mode);
    });
  }
}


function formatObjectData(data, props) {
  return props.map(function(prop) {
    return data[prop].toFixed(2);
  });
}

function formatObjectStats(stats, props) {
  return props.map(function(prop) {
    var entry = stats[prop];
    return entry.mean.toFixed(2) + '\u00B1' + entry.coefficientOfVariation.toFixed(2);
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
    gcTimeDuringScript: 0,
    gcAmountDuringScript: 0,
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
          recordStats.gcTimeDuringScript += recordDuration;
          recordStats.gcAmountDuringScript += record.data.usedHeapSizeDelta;
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

