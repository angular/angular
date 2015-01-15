var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng1.x largetable benchmark', function () {
  var URL = 'benchmarks_external/web/largetable/largetable_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  [
    'baselineBinding',
    'baselineInterpolation',
    'ngBind',
    'ngBindOnce',
    'interpolation',
    'interpolationAttr',
    'ngBindFn',
    'interpolationFn',
    'ngBindFilter',
    'interpolationFilter'
  ].forEach(function(benchmarkType) {
    it('should log the stats with: ' + benchmarkType, function() {
      perfUtil.runClickBenchmark({
        url: URL,
        buttons: ['#destroyDom', '#createDom'],
        id: 'ng1.largetable.' + benchmarkType,
        params: [{
          name: 'columns',
          value: 100,
          scale: 'sqrt'
        },{
          name: 'rows',
          value: 20,
          scale: 'sqrt'
        },{
          name: 'benchmarkType',
          value: benchmarkType
        }]
      });
    });
  });
});
