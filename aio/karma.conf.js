// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const os = require('os');

if (os.platform() === 'win32') {
  /*
    For some unknown reason, the symlinked copy of chromium under runfiles won't run under
    karma on Windows. Instead, modify the CHROME_BIN env var to point to the chrome binary
    under external/ in the execroot.

    CHROME_BIN is set to the make var $(CHROMIUM) in aio/BUILD.bazel, which points to chrome
    under runfiles and thus starts with ../. Because we run architect with a chdir into aio,
    $(CHROMIUM) additionally has a second ../.

    First, back out of
        bazel-out/x64_windows-fastbuild/bin/aio/test.bat.runfiles/angular/aio
    Then go into
        external/
    and then into
        org_chromium_chromium_windows/chrome-win
    to cancel out the leading ../../
  */
  process.env.CHROME_BIN = `../../../../../../../external/org_chromium_chromium_windows/chrome-win/${process.env.CHROME_BIN}`;
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {'reporter:jasmine-seed': ['type', JasmineSeedReporter]},
    ],
    proxies: {
      '/dummy/image': 'src/assets/images/logos/angular/angular.png',
    },
    client: {
      clearContext: false,  // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
        random: true,
        seed: '',
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/site'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ],
    },
    reporters: ['progress', 'kjhtml', 'jasmine-seed'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        // See /integration/README.md#browser-tests for more info on these args
        flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'],
      },
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    browserNoActivityTimeout: 60000,
    singleRun: false,
    restartOnFileChange: true,
  });
};

// Helpers
function JasmineSeedReporter(baseReporterDecorator) {
  baseReporterDecorator(this);

  this.onBrowserComplete = (browser, result) => {
    const seed = result.order && result.order.random && result.order.seed;
    if (seed) this.write(`${browser}: Randomized with seed ${seed}.\n`);
  };

  this.onRunComplete = () => undefined;
}
