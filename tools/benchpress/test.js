var Q = require('q');

module.exports = function(browser, options) {
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
  return browser.newTab().then(function(tab) {
    return tab.navigate(benchmark.url).then(function() {
      // warm up the browser
      return multiClick(
        tab,
        repeatArr(benchmark.clickPath, benchmark.warmupCount)
      );
    }).then(function() {
      // measure
      return tab.measure({
        'gc': true,
        'script': true,
        'render': true,
        'ngMetrics': {
          changeDetection: true,
          changeDetectionReaction: true
        }
      }, function() {
        return multiClick(
          tab,
          repeatArr(benchmark.clickPath, benchmark.measureCount)
        );
      });
    }).then(function(stats) {
      // report
      // TODO: save in file or compare against other benchmark!
      console.log(JSON.stringify(stats, null, '  '));
    }).then(function() {
      return tab.close();
    }, function(error) {
      tab.close().then(function() {
        return Q.reject(error);
      });
    });
  }).then(null, function(error) {
    console.log('Error', error.stack || error);
  });
};


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
