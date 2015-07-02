import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/test_lib/perf_util';

describe('react tree benchmark', function() {

  var URL = 'benchmarks_external/src/tree/react/index.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats (create)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'react.tree.create',
      params: [{name: 'depth', value: 9, scale: 'log2'}]
    }).then(done, done.fail);
  });

  it('should log the stats (update)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#createDom'],
      id: 'react.tree.update',
      params: [{name: 'depth', value: 9, scale: 'log2'}]
    }).then(done, done.fail);
  });

});
