// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');


// There's a race condition happening in Chrome. Enabling logging in chrome used by
// protractor actually fixes it. Logging is piped to a file so it doesn't affect our setup.
// --no-sandbox is needed when using Chrome (instead of Chromium).
// Travis auto-adds it somewhere, but CircleCI does not.
// --headless is supported in OSX and Linux only right now.
// When --headless is released for Windows (in Chrome 60 final) this should be changed to
// always use --headless.
// --disable-gpu is needed for --headless.
// The window needs to be wide enough to show the SideNav side-by-side, and can't be changed 
// at runtime.
// https://github.com/angular/protractor/blob/master/docs/browser-setup.md#using-headless-chrome
var protractorCapabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: process.env['TRAVIS'] ?
      ['--enable-logging', '--no-sandbox', '--headless', '--disable-gpu', '--window-size=1280,1280'] :
      ['--window-size=1280,1280']
  }
};

exports.protractorCapabilities = protractorCapabilities;

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: protractorCapabilities,
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
