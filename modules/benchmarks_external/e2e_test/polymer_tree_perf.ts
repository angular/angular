import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/testing/perf_util';

describe('polymer tree benchmark', function() {

  var URL = 'benchmarks_external/src/tree/polymer/index.html';

  afterEach(verifyNoBrowserErrors);

  it('should log the stats', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#destroyDom', '#createDom'],
      id: 'polymer.tree',
      params: [{name: 'depth', value: 9, scale: 'log2'}],
      waitForAngular2: false
    }).then(done, done.fail);
  });

});
