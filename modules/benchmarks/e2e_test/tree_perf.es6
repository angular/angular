var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 tree benchmark', function () {

  var URL = 'benchmarks/web/tree/tree_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log the ng stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
      id: 'ng2.tree',
      params: [{
        name: 'depth', value: 9, scale: 'log2'
      }]
    });
  });

  it('should log the baseline stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      id: 'baseline.tree',
      params: [{
        name: 'depth', value: 9, scale: 'log2'
      }]
    });
  });

});
