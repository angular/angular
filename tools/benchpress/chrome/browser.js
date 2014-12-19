var Chrome = require('./chrome');
var Q = require('q');

function ChromeBrowser(options) {
  this._chrome = new Chrome(options);
  this._options = options;
}

ChromeBrowser.prototype = {
  newTab: function() {
    var _tab;
    var self = this;
    return this._chrome.newTab().then(function(tab) {
      _tab = tab;
      return self._chrome.connectToTab(tab);
    }).then(function(tc) {
      if (self._options.captureConsole) {
        enableRemoteLogger(tc);
      }
      return new ChromeTab(self._chrome, _tab, tc, self._options);
    });
  },
  checkOpen: function() {
    var self = this;
    return this._chrome.listTabs().then(function() {
      return self;
    });
  }
};

function ChromeTab(chrome, tabData, tabConnection, options) {
  this._tabConnection = tabConnection;
  this._tabData = tabData;
  this._chrome = chrome;
  this._options = options;
}

ChromeTab.prototype = {
  navigate: function(url) {
    var timeout = this._options.pageLoadTimeout || 2000;
    return navigateWithWait(this._tabConnection, url, timeout);
  },
  click: function(cssSelector) {
    return click(this._tabConnection, cssSelector);
  },
  evaluate: function(expression) {
    return evaluate(this._tabConnection, expression);
  },
  measure: function(metrics, callback) {
    return measure(this._tabConnection, metrics, callback);
  },
  close: function() {
    return this._chrome.closeTab(this._tabData);
  }
};

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

function measure(tabConnection, metrics, callback) {
  var _results;
  var _events;
  var chain;
  if (metrics.ngMetrics) {
    chain = evaluate(tabConnection, initNgMetricsExpr(metrics.ngMetrics));
  } else {
    chain = Q.resolve();
  }
  chain = chain.then(function() {
    return tabConnection.HeapProfiler.collectGarbage();
  }).then(function() {
    return tabConnection.Timeline.start({
      // buffer events so that we don't slow down the app under test!
      bufferEvents: true,
      includeGPUEvents: metrics.render,
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
  });
  if (metrics.ngMetrics) {
    chain = chain.then(function() {
      return evaluate(tabConnection, 'window.ngMetrics');
    });
  }
  chain = chain.then(function(ngMetricValues) {
    var stats = sumStats(_events);
    stats.ngMetrics = ngMetricValues;

    var result = {};
    Object.keys(metrics).forEach(function(metric) {
      result[metric] = stats[metric];
    });
    return result;
  });
  return chain;

  function initNgMetricsExpr(ngMetrics) {
    var metricInitializers = {};
    Object.keys(ngMetrics).forEach(function(ngMetric) {
      metricInitializers[ngMetric] = 0;
    });
    return 'window.ngMetrics='+JSON.stringify(metricInitializers);
  }
}

function sumStats(records) {
  var recordStats = {
    script: 0,
    gc: {
      time: 0,
      amount: 0
    },
    render: 0
  };
  records.forEach(function(record) {
    sumRecordStats(record, recordStats);
  });
  return recordStats;
}

function sumRecordStats(record, result) {
  var diffTime = record.endTime ? record.endTime - record.startTime : 0;
  if (record.children) {
    record.children.forEach(function(child) {
      sumRecordStats(child, result);
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
    result.render += diffTime;
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

module.exports = ChromeBrowser;
