var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 element injector benchmark', function () {

  var URL = 'benchmarks/web/element_injector/element_injector_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log the stats for instantiate', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#instantiate'],
      id: 'ng2.elementInjector.instantiate',
      params: [{
        name: 'iterations', value: 20000, scale: 'linear'
      }]
    });
  });

  it('should log the stats for instantiateDirectives', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#instantiateDirectives'],
      id: 'ng2.elementInjector.instantiateDirectives',
      params: [{
        name: 'iterations', value: 20000, scale: 'linear'
      }]
    });
  });

});
