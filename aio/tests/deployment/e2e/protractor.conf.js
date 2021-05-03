// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  suites: {
    full: './*.e2e-spec.ts',
    smoke: './smoke-tests.e2e-spec.ts',
  },
  suite: 'full',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: require('puppeteer').executablePath(),
      // See /integration/README.md#browser-tests for more info on these args
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'],
    },
  },
  directConnect: true,
  SELENIUM_PROMISE_MANAGER: false,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  params: {
    sitemapUrls: [],
    legacyUrls: [],
  },
  beforeLaunch() {
    const {join} = require('path');
    const {register} = require('ts-node');

    register({project: join(__dirname, './tsconfig.json')});
  },
  onPrepare() {
    const {SpecReporter, StacktraceOption} = require('jasmine-spec-reporter');
    const {browser} = require('protractor');
    const {loadLegacyUrls, loadRemoteSitemapUrls} = require('../shared/helpers');

    return Promise.all([
      browser.getProcessedConfig(),
      loadRemoteSitemapUrls(browser.baseUrl),
      loadLegacyUrls(),
    ]).then(([config, sitemapUrls, legacyUrls]) => {
      if (sitemapUrls.length <= 100) {
        throw new Error(`Too few sitemap URLs. (Expected: >100 | Found: ${sitemapUrls.length})`);
      } else if (legacyUrls.length <= 100) {
        throw new Error(`Too few legacy URLs. (Expected: >100 | Found: ${legacyUrls.length})`);
      }

      Object.assign(config.params, {sitemapUrls, legacyUrls});
      jasmine.getEnv().addReporter(new SpecReporter({
        spec: {
          displayStacktrace: StacktraceOption.PRETTY,
        },
      }));
    });
  }
};
