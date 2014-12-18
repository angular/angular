var Chrome = require('./chrome/chrome');
var Q = require('q');

var chrome = new Chrome({
  port: 9222,
  host: 'localhost'
});

// baseline benchmark
// var benchmark = {
//   url: 'http://localhost:8000/benchmarks/web/tree/tree_benchmark.html',
//   clickPath: [
//     '#baselineDestroyDom',
//     '#baselineCreateDom'
//   ],
//   warmupCount: 10,
//   measureCount: 10
// };

// Angular2 benchmark
var benchmark = {
  url: 'http://localhost:8000/benchmarks/web/tree/tree_benchmark.html',
  clickPath: [
    '#ng2TreeDestroyDom',
    '#ng2TreeCreateDom'
  ],
  warmupCount: 10,
  measureCount: 10
};

var tab, tabConnection;
chrome.newTab().then(function(t) {
  tab = t;
  return chrome.connectToTab(tab);
}).then(function(tc) {
  tabConnection = tc;
  enableRemoteLogger(tabConnection);
}).then(function() {
  return navigateWithWait(tabConnection, benchmark.url, 2000);
}).then(function() {
  // warm up the browser
  return multiClick(
    tabConnection,
    repeatArr(benchmark.clickPath, benchmark.warmupCount)
  );
}).then(function() {
  // measure
  return measure(function() {
    return multiClick(
      tabConnection,
      repeatArr(benchmark.clickPath, benchmark.measureCount)
    );
  });
}).then(function(data) {
  // report
  var records = data.events;
  var ngMetrics = data.ngMetrics;
  var stats = {
    script: 0,
    paint: 0,
    gc: {
      time: 0,
      amount: 0
    },
    ngMetrics: ngMetrics
  };
  records.forEach(function(record) {
    sumStats(record, stats);
  });
  console.log(JSON.stringify(stats, null, '  '));
}).then(function() {
  return chrome.closeTab(tab);
}, function(error) {
  console.log('Error', error.stack || error);
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

  var cancelListeners = [
    tabConnection.Page.loadEventFired(pageLoadEventListener),
    tabConnection.Network.requestWillBeSent(requestWillBeSent),
    tabConnection.Network.loadingFinished(loadingFinished),
    tabConnection.Network.loadingFailed(loadingFinished)
  ];
  tabConnection.Network.enable();
  tabConnection.Page.enable();
  tabConnection.Page.navigate({'url': url}).catch(function(error) {
    cleanup();
    defer.reject(error);
  });

  return defer.promise;

  function cleanup() {
    cancelListeners.forEach(function(cancel) {
      cancel();
    });
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

function click(tabConnection, cssSelector) {
  var _rect;
  return evaluate(tabConnection,
    'document.querySelector("'+cssSelector+'").getBoundingClientRect()'
  ).then(function(rect) {
    _rect = rect;
    return tabConnection.Input.dispatchMouseEvent({
      type: 'mousePressed',
      clickCount: 1,
      button: 'left',
      x: _rect.left+10,
      y: _rect.top+10,
    });
  }).then(function() {
    return tabConnection.Input.dispatchMouseEvent({
      type: 'mouseReleased',
      clickCount: 1,
      button: 'left',
      x: _rect.left+10,
      y: _rect.top+10
    });
  }).then(function() {
    // TODO: synchronize with requestAnimationFrame!
    var d = Q.defer();
    setTimeout(d.resolve, 20);
    return d.promise;
  });
}

function multiClick(tabConnection, selectors, startIndex) {
  startIndex = startIndex || 0;
  if (startIndex < selectors.length) {
    return click(tabConnection, selectors[startIndex]).then(function() {
      return multiClick(tabConnection, selectors, startIndex+1);
    });
  } else {
    return Q.resolve();
  }
}

function evaluate(tabConnection, expression) {
  return tabConnection.Runtime.evaluate({
    expression: expression,
    returnByValue: true
  }).then(function(message) {
    var value = message.result.value;
    if (message.wasThrown) {
      throw new Error(JSON.stringify(message.exceptionDetails, null, '  '));
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
  var _events;
  return evaluate(tabConnection, '('+initNgMetrics.toString()+')()').then(function() {
    return tabConnection.HeapProfiler.collectGarbage();
  }).then(function() {
    return tabConnection.Timeline.start({
      // buffer events so that we don't slow down the app under test!
      bufferEvents: true,
      includeGPUEvents: true,
      // maxCallStackDepth: 0
    });
  }).then(function() {
    return callback();
  }).then(function() {
    return tabConnection.HeapProfiler.collectGarbage();
  }).then(function() {
    var removeStopped = tabConnection.Timeline.stopped(stoppedListener);
    var defer = Q.defer();
    tabConnection.Timeline.stop();
    return defer.promise;

    function stoppedListener(message) {
      removeStopped();
      _events = message.events;
      defer.resolve();
    }
  }).then(function() {
    return evaluate(tabConnection, 'window.ngMetrics');
  }).then(function(ngMetrics) {
    console.log(ngMetrics);
    return {
      events: _events,
      ngMetrics: ngMetrics
    };
  });

  function initNgMetrics() {
    window.ngMetrics = {
      changeDetection: 0,
      changeDetectionReaction: 0
    };
  }
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
    if (!record.data || record.data.scriptName !== 'InjectedScript') {
      result.script = result.script + diffTime;
    }
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

function enableRemoteLogger(tabConnection) {
  tabConnection.Console.enable();
  tabConnection.Console.messageAdded(function(message) {
    // TODO: collect errors and make the test fail..
    // TODO: don't report stacktrace for non errors...
    console.log(message.message.text, message.message.stackTrace);
  });
}

function repeatArr(arr, count) {
  var result = [];
  for (var i=0; i<count; i++) {
    for (var j=0; j<arr.length; j++) {
      result.push(arr[j]);
    }
  }
  return result;
}
