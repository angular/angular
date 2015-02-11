var perfUtil = require('angular2/e2e_test/perf_util');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/src/tree/tree_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log the ng stats', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      id: 'ng2.tree',
      params: [{
        name: 'depth', value: 9, scale: 'log2'
      }]
    }).then(done, done.fail);
  });

  it('should log the baseline stats', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      id: 'baseline.tree',
      params: [{
        name: 'depth', value: 9, scale: 'log2'
      }]
    }).then(done, done.fail);
  });

});
