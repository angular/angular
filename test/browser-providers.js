'use strict';

/*
 * Browser Configuration for the different jobs in the CI.
 *
 *   - local: Launches the browser locally on the current operating system.
 *   - BS: Launches the browser within BrowserStack
 *   - SL: Launches the browser within Saucelabs
 *
 * TODO(devversion): rename this to "browserstack" and "saucelabs".
 */
const browserConfig = {
  'ChromeHeadlessCI':  { unitTest: {target: 'local', }},
  'FirefoxHeadless':   { unitTest: {target: 'local', }},
  'ChromeBeta':        { unitTest: {target: null, }},
  'FirefoxBeta':       { unitTest: {target: null, }},
  'ChromeDev':         { unitTest: {target: null, }},
  'FirefoxDev':        { unitTest: {target: null, }},
  'IE9':               { unitTest: {target: null, }},
  'IE10':              { unitTest: {target: null, }},
  'IE11':              { unitTest: {target: null, }},
  'Edge':              { unitTest: {target: 'BS', }},
  'Android4.1':        { unitTest: {target: null, }},
  'Android4.2':        { unitTest: {target: null, }},
  'Android4.3':        { unitTest: {target: null, }},
  'Android4.4':        { unitTest: {target: null, }},
  'Android5':          { unitTest: {target: null, }},
  'Safari7':           { unitTest: {target: null, }},
  'Safari8':           { unitTest: {target: null, }},
  'Safari9':           { unitTest: {target: null, }},
  'Safari10':          { unitTest: {target: 'BS', }},
  'iOS7':              { unitTest: {target: null, }},
  'iOS8':              { unitTest: {target: null, }},
  'iOS9':              { unitTest: {target: null, }},
  'iOS10':             { unitTest: {target: null, }},
  // Don't use Browserstack until our open-source license includes automate testing on
  // mobile devices. For now, we need to use Saucelabs to keep our coverage.
  'iOS11':             { unitTest: {target: 'SL', }},
  'WindowsPhone':      { unitTest: {target: null, }}
};

/** Exports all available remote browsers. */
exports.customLaunchers = require('./remote_browsers.json');

/** Exports a map of configured browsers, which should run in the given platform. */
exports.platformMap = {
  'saucelabs': buildConfiguration('unitTest', 'SL'),
  'browserstack': buildConfiguration('unitTest', 'BS'),
  'local': buildConfiguration('unitTest', 'local'),
};

/** Build a list of configuration (custom launcher names). */
function buildConfiguration(type, target) {
  const targetBrowsers = Object.keys(browserConfig)
    .map(browserName => [browserName, browserConfig[browserName][type]])
    .filter(([, config]) => config.target === target)
    .map(([browserName]) => browserName);

  // For browsers that run locally, the browser name shouldn't be prefixed with the target
  // platform. We only prefix the external platforms in order to distinguish between
  // local and remote browsers in our "customLaunchers" for Karma.
  if (target === 'local') {
    return targetBrowsers;
  }

  return targetBrowsers.map(browserName => `${target}_${browserName.toUpperCase()}`);
}

/** Decode the token for Travis to use. */
function decodeToken(token) {
  return (token || '').split('').reverse().join('');
}


/** Ensures that the Travis access keys work properly. */
if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = decodeToken(process.env.SAUCE_ACCESS_KEY);
  process.env.BROWSER_STACK_ACCESS_KEY = decodeToken(process.env.BROWSER_STACK_ACCESS_KEY);
}
