'use strict';

/*
 * Browser Configuration for the different jobs in the CI.
 * Target can be either: BS (Browserstack) | SL (Saucelabs) | null (To not run at all)
 */
const browserConfig = {
  'Chrome':       { unitTest: {target: 'SL', required: true  }},
  'Firefox':      { unitTest: {target: 'SL', required: true  }},
  'ChromeBeta':   { unitTest: {target: 'SL', required: false }},
  'FirefoxBeta':  { unitTest: {target: null, required: false }},
  'ChromeDev':    { unitTest: {target: null, required: true  }},
  'FirefoxDev':   { unitTest: {target: null, required: true  }},
  'IE9':          { unitTest: {target: null, required: false }},
  'IE10':         { unitTest: {target: null, required: true  }},
  'IE11':         { unitTest: {target: 'SL', required: true  }},
  'Edge':         { unitTest: {target: 'SL', required: true  }},
  'Android4.1':   { unitTest: {target: null, required: false }},
  'Android4.2':   { unitTest: {target: null, required: false }},
  'Android4.3':   { unitTest: {target: null, required: false }},
  'Android4.4':   { unitTest: {target: null, required: false }},
  'Android5':     { unitTest: {target: 'SL', required: false }},
  'Safari7':      { unitTest: {target: null, required: false }},
  'Safari8':      { unitTest: {target: null, required: false }},
  'Safari9':      { unitTest: {target: 'BS', required: false }},
  'Safari10':     { unitTest: {target: 'SL', required: false }},
  'iOS7':         { unitTest: {target: null, required: false }},
  'iOS8':         { unitTest: {target: null, required: false }},
  'iOS9':         { unitTest: {target: 'BS', required: true  }},
  'WindowsPhone': { unitTest: {target: 'BS', required: false }}
};

/** Exports all available remote browsers. */
exports.customLaunchers = require('./remote_browsers.json');

/** Exports a map of configured browsers, which should run on the CI. */
exports.platformMap = {
  'saucelabs': {
    required: buildConfiguration('unitTest', 'SL', true),
    optional: buildConfiguration('unitTest', 'SL', false)
  },
  'browserstack': {
    required: buildConfiguration('unitTest', 'BS', true),
    optional: buildConfiguration('unitTest', 'BS', false)
  },
};

/** Build a list of configuration (custom launcher names). */
function buildConfiguration(type, target, required) {
  return Object.keys(browserConfig)
    .map(item => [item, browserConfig[item][type]])
    .filter(([, conf]) => conf.required === required && conf.target === target)
    .map(([item]) => `${target}_${item.toUpperCase()}`);
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