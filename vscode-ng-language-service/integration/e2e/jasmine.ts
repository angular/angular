import Jasmine = require('jasmine');

export async function run(): Promise<void> {
  const jasmine = new Jasmine({projectBaseDir: __dirname});

  jasmine.loadConfig({
    spec_files: ['*_spec.js'],
  });

  // For whatever reason, the built-in jasmine reporter printin does not make it to the console
  // output when the tests are run. In addition, allowing the default implementation to call
  // `process.exit(1)` messes up the console reporting. The overrides below allow for both the
  // proper exit code and the proper console reporting.
  let failed = false;
  jasmine.configureDefaultReporter({
    // The `print` function passed the reporter will be called to print its results.
    print: function (message: string) {
      if (message.trim()) {
        console.log(message);
      }
    },
  });
  jasmine.completionReporter = {
    specDone: (result: jasmine.SpecResult): void | Promise<void> => {
      if (result.failedExpectations.length > 0) {
        failed = true;
      }
      console.log(result);
    },
  };

  console.log(`Expecting to run ${jasmine.specFiles.length} specs.`);

  console.log(JSON.stringify(jasmine.specFiles, null, 2));

  if (jasmine.specFiles.length === 0) {
    throw new Error('No specs found');
  }

  await jasmine.execute();
  if (failed) {
    process.exit(1);
  }
}
