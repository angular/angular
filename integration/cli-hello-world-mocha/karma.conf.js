// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-mocha-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        // See /integration/README.md#browser-tests for more info on these args
        flags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--hide-scrollbars',
          '--mute-audio',
        ],
      },
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
