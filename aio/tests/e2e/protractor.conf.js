// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');
const path = require('path')
const {getAdjustedChromeBinPathForWindows} = require('../../tools/windows-chromium-path');

process.env.CHROME_BIN = getAdjustedChromeBinPathForWindows();

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  chromeDriver: path.resolve(process.env.CHROMEDRIVER_BIN),
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: path.resolve(process.env.CHROME_BIN),
      // See /integration/README.md#browser-tests for more info on these args
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'],
    },
  },
  directConnect: true,
  // Keep the Selenium Promise Manager enabled to avoid flakiness on CI.
  // See https://github.com/angular/angular/issues/39872 for more details.
  //
  // TODO(gkalpak): Set this back to `false` to align with CLI-generated apps when the flakiness is
  //                fixed in the future.
  SELENIUM_PROMISE_MANAGER: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY,
      },
    }));
  }
};
