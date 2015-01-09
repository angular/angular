var config = exports.config = require('./protractor-shared.js').config;
config.specs = ['dist/cjs/**/*_perf.js'];
config.params = {
  benchmark: {
    // size of the sample to take
    sampleSize: 10,
    targetCoefficientOfVariation: 4,
    timeout: 20000,
    metrics: ['script', 'render', 'gcAmount', 'gcAmountInScript', 'gcTime'],
    // run mode of the benchmark:
    // - detect: auto detect whether to force gc
    // - forceGc: forces a gc before every run and ignores no runs
    // - noGcInScript: ignore runs that have gc while a script was executing
    // - plain: does not force nor ignore runs
    mode: 'detect'
  }
};
