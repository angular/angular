var perfUtil = require('../../angular2/e2e_test/perf_util');

describe('ng2 naive infinite scroll benchmark', function () {

  var URL = 'benchmarks/src/naive_infinite_scroll/index.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  [1, 2, 4].forEach(function(appSize) {
    it('should run scroll benchmark and collect stats for appSize = ' +
        appSize, function() {
      perfUtil.runBenchmark({
        url: URL,
        id: 'ng2.naive_infinite_scroll',
        work: function() {
          browser.executeScript(
              'document.querySelector("scroll-app /deep/ #reset-btn").click()');
          browser.executeScript(
              'document.querySelector("scroll-app /deep/ #run-btn").click()');
          browser.wait(() => {
            return $('#done').getText().then(
              function() { return true; },
              function() { return false; });
            }, 10000);
        },
        params: [{
          name: 'appSize', value: appSize
        }, {
          name: 'iterationCount', value: 20, scale: 'linear'
        }, {
          name: 'scrollIncrement', value: 40
        }]
      });
    });
  });

});
