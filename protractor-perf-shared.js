var config = exports.config = require('./protractor-shared.js').config;
// load traceur runtime as our tests are written in es6
require('traceur/bin/traceur-runtime.js');
var nodeUuid = require('node-uuid');

var cloudReporterConfig;
if (process.env.CLOUD_SECRET_PATH) {
  console.log('using cloud reporter!');
  cloudReporterConfig = {
    auth: require(process.env.CLOUD_SECRET_PATH),
    projectId: 'angular-perf',
    datasetId: 'benchmarks',
    tableId: 'ng2perf'
  };
}

config.specs = ['dist/js/cjs/**/e2e_test/**/*_perf.js'];
config.exclude = ['dist/js/cjs/**/node_modules/**'];

config.jasmineNodeOpts.defaultTimeoutInterval = 80000;

var runId = nodeUuid.v1();
if (process.env.GIT_SHA) {
  runId = process.env.GIT_SHA + ' ' + runId;
}

config.params = {
  benchmark: {
    runId: runId,
    // size of the sample to take
    sampleSize: 20,
    timeout: 60000,
    metrics: ['script', 'render', 'gcAmount', 'gcAmountInScript', 'gcTime'],
    // forces a gc after every run
    forceGc: false,
    reporters: [
      require('./dist/js/cjs/benchpress/src/console_reporter.js'),
      cloudReporterConfig ? require('./dist/js/cjs/benchpress/src/cloud_reporter.js') : null,
    ],
    cloudReporter: cloudReporterConfig,
    scaling: [{
      userAgent: /Android/, value: 0.125
    }]
  }
};
