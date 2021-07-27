'use strict';

/*
 * Browser Configuration for the different jobs in the legacy Karma tests.
 *
 *   - `browserstack`: Launches the browser within BrowserStack
 *   - `saucelabs`: Launches the browser within Saucelabs
 */
const browserConfig = {
  'Edge87':            {unitTest: {target: 'browserstack'}},
  'iOS14':             {unitTest: {target: 'saucelabs'}},
  'Safari13':          {unitTest: {target: 'browserstack'}},
};

/** Exports all available custom Karma browsers. */
exports.customLaunchers = require('./karma-browsers.json');

/** Exports a map of configured browsers, which should run in the given platform. */
exports.platformMap = {
  'saucelabs': buildConfiguration('unitTest', 'saucelabs'),
  'browserstack': buildConfiguration('unitTest', 'browserstack')
};

/** Build a list of configuration (custom launcher names). */
function buildConfiguration(type, target) {
  const targetBrowsers = Object.keys(browserConfig)
    .map(browserName => [browserName, browserConfig[browserName][type]])
    .filter(([, config]) => config.target === target)
    .map(([browserName]) => browserName);

  return targetBrowsers.map(browserName => {
    return `${target.toUpperCase()}_${browserName.toUpperCase()}`;
  });
}
