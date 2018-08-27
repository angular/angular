// We can't use `import...from` here, because of the following mess:
// - GitHub project `jasmine/jasmine` is `jasmine-core` on npm and its typings `@types/jasmine`.
// - GitHub project `jasmine/jasmine-npm` is `jasmine` on npm and has no typings.
//
// Using `import...from 'jasmine'` here, would import from `@types/jasmine` (which refers to the
// `jasmine-core` module and the `jasmine` module).
import Jasmine = require('jasmine');
import 'source-map-support/register';

export const runTests = (specFiles: string[]) => {
  const config = {
    random: true,
    spec_files: specFiles,
    stopSpecOnExpectationFailure: true,
  };

  process.on('unhandledRejection', (reason: any) => console.log('Unhandled rejection:', reason));

  const runner = new Jasmine({});
  runner.loadConfig(config);
  runner.onComplete((passed: boolean) => process.exit(passed ? 0 : 1));
  runner.execute();
};
