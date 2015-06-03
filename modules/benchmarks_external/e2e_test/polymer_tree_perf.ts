import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/test_lib/perf_util';

describe('polymer tree benchmark', function() {

  var URL = 'benchmarks_external/src/tree/polymer/index.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'polymer.tree',
      params: [{name: 'depth', value: 9, scale: 'log2'}]
    }).then(done, done.fail);
  });

});
