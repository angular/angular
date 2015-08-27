import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/test_lib/perf_util';

describe('ng1.x tree benchmark', function() {

  var URL = 'benchmarks_external/src/static_tree/tree_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'ng1.static.tree',
      params: [],
      waitForAngular2: false
    }).then(done, done.fail);
  });

});
