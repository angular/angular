var perfUtil = require('angular2/src/test_lib/perf_util');

describe('ng2 largetable benchmark', function () {

  var URL = 'benchmarks/src/largetable/largetable_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  // Not yet implemented:
  // 'ngBind',
  // 'ngBindOnce',
  // 'ngBindFn',
  // 'ngBindFilter',
  // 'interpolationFilter'

  [
    'interpolation',
    'interpolationAttr',
    'interpolationFn'
  ].forEach(function(benchmarkType) {
    it('should log the ng stats with: ' + benchmarkType, function(done) {
      console.log('executing for type', benchmarkType);
      perfUtil.runClickBenchmark({
        url: URL,
        buttons: ['#ng2DestroyDom', '#ng2CreateDom'],
        id: 'ng2.largetable.' + benchmarkType,
        params: [{
          name: 'rows',
          value: 20,
          scale: 'sqrt'
        },{
          name: 'columns',
          value: 20,
          scale: 'sqrt'
        },{
          name: 'benchmarkType',
          value: benchmarkType
        }]
      }).then(done, done.fail);
    });
  });


  it('should log the baseline stats', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineDestroyDom', '#baselineCreateDom'],
      id: 'baseline.largetable',
      params: [{
        name: 'rows',
        value: 100,
        scale: 'sqrt'
      },{
        name: 'columns',
        value: 20,
        scale: 'sqrt'
      },{
        name: 'benchmarkType',
        value: 'baseline'
      }]
    }).then(done, done.fail);;
  });

});
