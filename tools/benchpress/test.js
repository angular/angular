var Chrome = require('./chrome/chrome');
var Q = require('q');

// TODO: instrument tree example to distinguish times for
// - change detection
// - di
// - application

// TODO: maybe automatically listen to tabs and connect to them
// to measure their performance?

var chrome = new Chrome({
  port: 9222,
  host: 'localhost'
});

// var benchmark = {
//   url: 'http://localhost:8000/benchmarks/web/tree/index.html',
//   expression: 'window.ng2Tree.steps[0].fn();window.ng2Tree.steps[1].fn();',
//   warmupCount: 5,
//   measureCount: 10
// };

function ng2TreeBenchmark() {
  window.ngMetrics = {
    changeDetection: 0,
    changeDetectionReaction: 0
  };
  window.ng2Tree.steps[0].fn();window.ng2Tree.steps[1].fn();
  return window.ngMetrics;
}

var benchmark = {
  url: 'http://localhost:8000/benchmarks/web/tree/index.html',
  expression: '('+ng2TreeBenchmark.toString()+')()',
  warmupCount: 5,
  measureCount: 10
};

var tab, tabConnection;
chrome.newTab().then(function(t) {
  tab = t;
  return chrome.connectToTab(tab);
}).then(function(tc) {
  tabConnection = tc;
}).then(function() {
  return navigateWithWait(tabConnection, benchmark.url, 2000);
}).then(function() {
  // warm up V8
  return multipleEval(
    tabConnection,
    benchmark.expression,
    benchmark.warmupCount
  );
}).then(function() {
  return measure(function() {
    return multipleEval(
      tabConnection,
      benchmark.expression,
      benchmark.measureCount
    );
  });
}).then(function(data) {
  var records = data.events;
  var explicitMetrics = data.result;
  var stats = {
    script: 0,
    changeDetection: 0,
    changeDetectionReaction: 0,
    paint: 0,
    gc: {
      time: 0,
      amount: 0
    }
  };
  records.forEach(function(record) {
    sumStats(record, stats);
  });
  explicitMetrics.forEach(function(metric) {
    stats.changeDetection += metric.changeDetection;
    stats.changeDetectionReaction += metric.changeDetectionReaction;
  });
  console.log(JSON.stringify(stats, null, '  '));
}).then(function() {
  return chrome.closeTab(tab);
}, function(error) {
  console.log('Error', error.stack);
  return chrome.closeTab(tab);
});

process.on( "SIGINT", function() {
  console.log('CLOSING [SIGINT]');
  if (chrome && tab) {
    chrome.closeTab(tab).then(function() {
      process.exit();
    });
  } else {
    process.exit();
  }
});

function navigateWithWait(tabConnection, url, timeout) {
  // TODO: clean this up...
  var defer = Q.defer();
  var remainingRequests = {};
  var loadEventFired = false;

  var noRequestTimeoutId;
  var overallTimeoutId = setTimeout(pageLoadTimeout, timeout);

  tabConnection.addListener('Page.loadEventFired', pageLoadEventListener);
  tabConnection.addListener('Network.requestWillBeSent', requestWillBeSent);
  tabConnection.addListener('Network.loadingFinished', loadingFinished);
  tabConnection.addListener('Network.loadingFailed', loadingFinished);
  tabConnection.Network.enable();
  tabConnection.Page.enable();
  tabConnection.Page.navigate({'url': url}).catch(function(error) {
    cleanup();
    defer.reject(error);
  });

  return defer.promise;

  function cleanup() {
    tabConnection.removeListener('Page.loadEventFired', pageLoadEventListener);
    tabConnection.removeListener('Network.requestWillBeSent', requestWillBeSent);
    tabConnection.removeListener('Network.loadingFinished', loadingFinished);
    tabConnection.removeListener('Network.loadingFailed', loadingFinished);
    if (overallTimeoutId) {
      clearTimeout(overallTimeoutId);
    }
    if (noRequestTimeoutId) {
      clearTimeout(noRequestTimeoutId);
    }
  }

  function pageLoadTimeout() {
    cleanup();
    defer.reject(new Error('Page load timeout after '+timeout+'ms'));
  }

  function pageLoadEventListener() {
    console.log('page load event');
    loadEventFired = true;
    checkIfDone();
  }

  function requestWillBeSent(message) {
    remainingRequests[message.requestId] = true;
    checkIfDone();
  }

  function loadingFinished(message) {
    delete remainingRequests[message.requestId];
    checkIfDone();
  }

  function checkIfDone() {
    if (noRequestTimeoutId) {
      clearTimeout(noRequestTimeoutId);
      noRequestTimeoutId = null;
    }
    if (loadEventFired && Object.keys(remainingRequests).length === 0) {
      // wait a little bit as receiving a response could
      // trigger further requests.
      noRequestTimeoutId = setTimeout(function() {
        console.log('no outstanding network requests');
        cleanup();
        defer.resolve();
      }, 100);
    }
  }

}

// TODO: use later...
function click(tabConnection, cssSelector) {
  return evaluate(tabConnection,
      'document.querySelector("'+cssSelector+'").getClientBoundingRect()'
    ).then(function(rect) {
    return tabConnection.Input.dispatchMouseEvent({
      x: rect.left+10,
      y: rect.top+10
    });
  });
}

function evaluate(tabConnection, expression) {
  return tabConnection.Runtime.evaluate({
    expression: expression,
    returnByValue: true
  }).then(function(message) {
    var value = message.result.value;
    if (message.wasThrown) {
      throw value;
    } else {
      return value;
    }
  });
}

function multipleEval(tabConnection, expression, count, results) {
  results = results || [];
  if (count > 0) {
    return evaluate(tabConnection, expression).then(function(value) {
      results.push(value);
      return multipleEval(tabConnection, expression, count-1, results);
    });
  } else {
    return results;
  }
}

function measure(callback) {
  var _results;
  return tabConnection.HeapProfiler.collectGarbage().then(function() {
    return tabConnection.Timeline.start({
      // buffer events so that we don't slow down the app under test!
      bufferEvents: true,
      includeGPUEvents: true,
      // maxCallStackDepth: 0
    });
  }).then(function() {
    return callback();
  }).then(function(results) {
    _results = results;
    return tabConnection.HeapProfiler.collectGarbage();
  }).then(function() {
    tabConnection.addListener('Timeline.stopped', stoppedListener);
    var defer = Q.defer();
    tabConnection.Timeline.stop();
    return defer.promise;

    function stoppedListener(message) {
      tabConnection.removeListener('Timeline.stopped', stoppedListener);
      defer.resolve({
        events: message.events,
        result: _results
      });
    }
  });
}

function sumStats(record, result) {
  var diffTime = record.endTime ? record.endTime - record.startTime : 0;
  if (record.children) {
    record.children.forEach(function(child) {
      sumStats(child, result);
    });
  }
  if (record.type === 'FunctionCall') {
    // Note: subtracting the GCEvent time is not enough.
    // somehow frames that contained GCEvents are still slower
    // than other frames!
    // result.script = result.script + diffTime - childDiffs;
    result.script = result.script + diffTime;
  } else if (record.type === 'GCEvent') {
    result.gc.time += diffTime;
    result.gc.amount += record.data.usedHeapSizeDelta;
  } else if (record.type === 'RecalculateStyles' ||
      record.type === 'Layout' ||
      record.type === 'UpdateLayerTree' ||
      record.type === 'Paint' ||
      record.type === 'Rasterize' ||
      record.type === 'CompositeLayers') {
    result.paint += diffTime;
  }
}


