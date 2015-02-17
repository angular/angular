var perfUtil = require('angular2/e2e_test/perf_util');

describe('ng-dart1.x naive infinite scroll benchmark', function () {

  var URL = 'benchmarks_external/src/naive_infinite_scroll/index.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  [1, 2, 4].forEach(function(appSize) {
    it('should run scroll benchmark and collect stats for appSize = ' +
        appSize, function(done) {
      perfUtil.runBenchmark({
        url: URL,
        id: 'ng1-dart1.x.naive_infinite_scroll',
        work: function() {
          browser.executeScript(
              'document.querySelector("scroll-app /deep/ #reset-btn").click()');
          browser.executeScript(
              'document.querySelector("scroll-app /deep/ #run-btn").click()');
          var s = 1000;
          if (appSize > 4) {
            s = s + appSize * 100;
          }
          browser.sleep(s);
        },
        params: [{
          name: 'appSize', value: appSize
        }, {
          name: 'iterationCount', value: 20, scale: 'linear'
        }, {
          name: 'scrollIncrement', value: 40
        }]
      }).then(done, done.fail);
    });
  });

});
