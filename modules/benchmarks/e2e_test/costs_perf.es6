var perfUtil = require('angular2/src/test_lib/perf_util');

describe('ng2 cost benchmark', function () {

  var URL = 'benchmarks/src/costs/index.html';
  var benchmarkSize = 200;

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log stats for baseline (plain components)', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#reset', '#createPlainComponents'],
      id: 'ng2.costs.baseline',
      params: [{
        name: 'size', value: 200, scale: 'linear'
      }]
    }).then(done, done.fail);
  });

  it('should log stats for components with decorators', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#reset', '#createComponentsWithDecorators'],
      id: 'ng2.costs.decorators',
      params: [{
        name: 'size', value: 200, scale: 'linear'
      }]
    }).then(done, done.fail);
  });
});
