const path = require('path');
const tsNode = require('ts-node');
const {SpecReporter, StacktraceOption} = require('jasmine-spec-reporter');

tsNode.register({
  project: path.join(__dirname, 'tsconfig.json'),
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.RAW,
    },
  }),
);
