import {runClickBenchmark} from './perf_util';
import {verifyNoBrowserErrors} from 'angular2/testing';

describe('ng1.x tree benchmark', function() {

  var URL = 'benchmarks_external/src/static_tree/tree_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats (create)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'ng1.static.tree.create',
      params: [],
      waitForAngular2: false
    }).then(done, done.fail);
  });

  it('should log the stats (update)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#createDom'],
      id: 'ng1.static.tree.update',
      params: [],
      waitForAngular2: false
    }).then(done, done.fail);
  });

});
