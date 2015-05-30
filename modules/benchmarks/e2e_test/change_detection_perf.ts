import {runClickBenchmark, verifyNoBrowserErrors} from 'angular2/src/test_lib/perf_util';

describe('ng2 change detection benchmark', function() {

  var URL = 'benchmarks/src/change_detection/change_detection_benchmark.html';

  afterEach(verifyNoBrowserErrors);

  it('should log ng stats (dynamic, reads)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionDynamicReads'],
      id: 'ng2.changeDetection.dynamic.reads',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

  it('should log ng stats (dynamic, writes)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionDynamicWrites'],
      id: 'ng2.changeDetection.dynamic.writes',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

  it('should log ng stats (jit, reads)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionJitReads'],
      id: 'ng2.changeDetection.jit.reads',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

  it('should log ng stats (jit, writes)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#ng2ChangeDetectionJitWrites'],
      id: 'ng2.changeDetection.jit.writes',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

  it('should log baseline stats (create)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#baselineChangeDetectionReads'],
      id: 'baseline.changeDetection.reads',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

  it('should log baseline stats (update)', function(done) {
    runClickBenchmark({
      url: URL,
      buttons: ['#baselineChangeDetectionWrites'],
      id: 'baseline.changeDetection.writes',
      params: [
        {name: 'numberOfChecks', value: 900000},
        {name: 'iterations', value: 20, scale: 'linear'}
      ],
      microMetrics: {'detectChangesAvg': 'avg time to detect changes (ms)'}
    }).then(done, done.fail);
  });

});
