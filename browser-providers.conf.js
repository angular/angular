/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Unique place to configure the browsers which are used in the different CI jobs in Sauce Labs (SL)
// If the target is set to null, then the browser is not run anywhere during CI.
// If a category becomes empty (e.g. BS and required), then the corresponding job must be commented
// out in the CI configuration.
const config = {
  'Android10': {unitTest: {target: 'SL', required: true}},
  'Android11': {unitTest: {target: 'SL', required: true}},
};

/** Whether browsers should be remotely acquired in debug mode. */
const debugMode = false;

const customLaunchers = {
  'SL_ANDROID10': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platformName: 'Android',
    platformVersion: '10.0',
    deviceName: 'Google Pixel 3a GoogleAPI Emulator',
    appiumVersion: '1.20.2',
    extendedDebugging: debugMode,
  },
  'SL_ANDROID11': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platformName: 'Android',
    platformVersion: '11.0',
    deviceName: 'Google Pixel 3a GoogleAPI Emulator',
    appiumVersion: '1.20.2',
    extendedDebugging: debugMode,
  },
};

const sauceAliases = {
  'CI_REQUIRED': buildConfiguration('unitTest', 'SL', true),
  'CI_OPTIONAL': buildConfiguration('unitTest', 'SL', false)
};

module.exports = {
  customLaunchers: customLaunchers,
  sauceAliases: sauceAliases,
};

function buildConfiguration(type, target, required) {
  return Object.keys(config)
      .filter((item) => {
        const conf = config[item][type];
        return conf.required === required && conf.target === target;
      })
      .map((item) => target + '_' + item.toUpperCase());
}
