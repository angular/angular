// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    // For Travis
    chromeOptions: {
      binary: process.env.CHROME_BIN,
      args: ['--no-sandbox']
    }
  },
  directConnect: true,
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
    const {register} = require('ts-node');
    register({});
  },
  onPrepare() {
    const {SpecReporter} = require('jasmine-spec-reporter');
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
      jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
    });
  }
};
