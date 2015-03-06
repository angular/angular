// Note: This does not use the common utilities for perf tests
// in Angular2 to show how to write a simple standalone perf test
// with benchpress.
var benchpress = require('benchpress/benchpress');
var runner = createRunner();

describe('benchpress', () => {

  fit('should work', (done) => {
    browser.get('examples/src/benchpress/index.html');

    runner.sample({
      id: 'benchpress smoke test',
      execute: () => {
        $('button').click();
        expect($('#log').getText()).toBe('hi');
      }
    }).then(done, done.fail);

  });

});

function createRunner() {
  return new benchpress.Runner([
    benchpress.SeleniumWebDriverAdapter.PROTRACTOR_BINDINGS,
    benchpress.bind(benchpress.Options.FORCE_GC).toValue(false),
    benchpress.Validator.bindTo(benchpress.RegressionSlopeValidator),
    benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(3)
  ]);
}