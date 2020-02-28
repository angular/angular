// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {'reporter:jasmine-seed': ['type', JasmineSeedReporter]},
    ],
    proxies: {
      '/dummy/image': 'src/assets/images/logos/angular/angular.png',
    },
    client: {
      clearContext: false,  // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: true,
        seed: '',
      },
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/site'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
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
