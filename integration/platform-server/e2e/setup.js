import {SpecReporter, StacktraceOption} from 'jasmine-spec-reporter';
import {quitWebDriver} from './src/util.ts';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.RAW,
    },
  }),
);

afterAll(async () => {
  await quitWebDriver();
});
