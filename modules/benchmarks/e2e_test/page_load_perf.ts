import {verifyNoBrowserErrors} from 'angular2/src/testing/perf_util';

describe('ng2 largetable benchmark', function() {

  var URL = 'benchmarks/src/page_load/page_load.html';
  var runner = global['benchpressRunner'];

  afterEach(verifyNoBrowserErrors);


  it('should log the load time', function(done) {
    runner.sample({
            id: 'loadTime',
            prepare: null,
            microMetrics: null,
            userMetrics: {loadTime: 'The time in milliseconds to bootstrap'},
            bindings:
                [benchpress.bind(benchpress.RegressionSlopeValidator.METRIC).toValue('loadTime')],
            execute: () => { browser.get(URL); }
          })
        .then(report => {
          expect(report.completeSample.length).toBeGreaterThan(4);
          expect(report.completeSample.filter(val => typeof val.values.loadTime === 'number' &&
                                                     val.values.loadTime > 0)
                     .length)
              .toBeGreaterThan(4);
        })
        .then(done);
  });
});
