var Browser = require('./chrome/browser');
var Q = require('q');

var browser = new Browser({
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

var _tab;
browser.newTab({
  captureConsole: true
}).then(function(tab) {
  _tab = tab;
}).then(function() {
  return _tab.navigate(benchmark.url, 2000);
}).then(function() {
  // warm up the browser
  return multiClick(
    _tab,
    repeatArr(benchmark.clickPath, benchmark.warmupCount)
  );
}).then(function() {
  // measure
  return _tab.measure({
    'gc': true,
    'script': true,
    'render': true,
    'ngMetrics': {
      changeDetection: true,
      changeDetectionReaction: true
    }
  }, function() {
    return multiClick(
      _tab,
      repeatArr(benchmark.clickPath, benchmark.measureCount)
    );
  });
}).then(function(stats) {
  // report
  // TODO: save in file or compare against other benchmark!
  console.log(JSON.stringify(stats, null, '  '));
}).then(function() {
  return _tab.close();
}, function(error) {
  console.log('Error', error.stack || error);
  return _tab.close();
});

process.on( "SIGINT", function() {
  console.log('CLOSING [SIGINT]');
  if (_tab) {
    _tab.close().then(function() {
      process.exit();
    }, function() {
      process.exit();
    });
  } else {
    process.exit();
  }
});

function multiClick(tab, selectors, startIndex) {
  startIndex = startIndex || 0;
  if (startIndex < selectors.length) {
    return tab.click(selectors[startIndex]).then(function() {
      return multiClick(tab, selectors, startIndex+1);
    });
  } else {
    return Q.resolve();
  }
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
