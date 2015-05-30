import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/test_lib/perf_util';

describe('ng2 element injector benchmark', function() {

  var URL = 'benchmarks/src/element_injector/element_injector_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats for instantiate', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#instantiate'],
      id: 'ng2.elementInjector.instantiate',
      params: [{name: 'iterations', value: 20000, scale: 'linear'}],
      microMetrics: {'instantiateAvg': 'avg time for injection (in ms)'}
    }).then(done, done.fail);
  });

  it('should log the stats for hydrate', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#hydrate'],
      id: 'ng2.elementInjector.hydrate',
      params: [{name: 'iterations', value: 20000, scale: 'linear'}],
      microMetrics: {'instantiateAvg': 'avg time for injection (in ms)'}
    }).then(done, done.fail);
  });

});
