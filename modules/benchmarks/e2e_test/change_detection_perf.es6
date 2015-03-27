var perfUtil = require('angular2/src/test_lib/perf_util');

describe('ng2 change detection benchmark', function () {

  var URL = 'benchmarks/src/change_detection/change_detection_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log ng stats (dynamic)', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionDynamic'],
      id: 'ng2.changeDetection.dynamic',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {
        'detectChangesAvg': 'avg time to detect changes (ms)'
      }
    }).then(done, done.fail);
  });

  it('should log ng stats (jit)', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionJit'],
      id: 'ng2.changeDetection.jit',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {
        'detectChangesAvg': 'avg time to detect changes (ms)'
      }
    }).then(done, done.fail);
  });

  it('should log baseline stats', function(done) {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#baselineChangeDetection'],
      id: 'baseline.changeDetection',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {
        'detectChangesAvg': 'avg time to detect changes (ms)'
      }
    }).then(done, done.fail);
  });

});
