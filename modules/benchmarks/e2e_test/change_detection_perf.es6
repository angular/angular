var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 change detection benchmark', function () {

  var URL = 'benchmarks/web/change_detection/change_detection_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log ng stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2DetectChanges'],
      id: 'ng2.changeDetection',
      params: [{
        name: 'iterations', value: 500000, scale: 'linear'
      }]
    });
  });

  it('should log baseline stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineDetectChanges'],
      id: 'baseline.changeDetection',
      params: [{
        name: 'iterations', value: 500000, scale: 'linear'
      }]
    });
  });

});
