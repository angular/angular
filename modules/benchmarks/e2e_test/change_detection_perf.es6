var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 change detection benchmark', function () {

  var URL = 'benchmarks/src/change_detection/change_detection_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log ng stats (dynamic)', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionDynamic'],
      id: 'ng2.changeDetection.dynamic',
      params: [{
        name: 'numberOfChecks', value: 900000, scale: 'linear'
      }]
    });
  });

  it('should log ng stats (jit)', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionJit'],
      id: 'ng2.changeDetection.jit',
      params: [{
        name: 'numberOfChecks', value: 900000, scale: 'linear'
      }]
    });
  });

  it('should log baseline stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineChangeDetection'],
      id: 'baseline.changeDetection',
      params: [{
        name: 'numberOfChecks', value: 900000, scale: 'linear'
      }]
    });
  });

});
