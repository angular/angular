// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
exports.config = {
  specs: [
    './e2e/**/*.e2e-spec.js'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: require('puppeteer').executablePath(),
      // See /integration/README.md#Browser tests for more info on these args
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio']
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine',
  useAllAngular2AppRoots: true,
};
