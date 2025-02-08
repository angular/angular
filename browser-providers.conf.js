/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Unique place to configure the browsers which are used in the different CI jobs in Sauce Labs (SL)
// If the target is set to null, then the browser is not run anywhere during CI.
// If a category becomes empty (e.g. BS and required), then the corresponding job must be commented
// out in the CI configuration.
const config = {
  'Android13': {unitTest: {target: 'SL', required: true}},
  'Android14': {unitTest: {target: 'SL', required: true}},
};

/** Whether browsers should be remotely acquired in debug mode. */
const debugMode = false;

// Karma-sauce-launcher isn't really maintained and doesn't support officially appium2
// Looking at the source code https://github.com/karma-runner/karma-sauce-launcher/blob/69dcb822a45d29e57297b0eda7af4123ae55aafd/src/process-config.ts#L60
// We can force the config to be recognized as W3C by setting a browserVersion property
const browserVersion = 'latest';

// Specific platform configuration can be found at:
// https://saucelabs.com/platform/platform-configurator
const customLaunchers = {
  'SL_ANDROID13': {
    base: 'SauceLabs',
    platformName: 'Android',
    browserName: 'Chrome',
    browserVersion,
    'appium:deviceName': 'Google Pixel 5a GoogleAPI Emulator',
    'appium:platformVersion': '13.0',
    'appium:automationName': 'uiautomator2',
    'sauce:options': {
      appiumVersion: '2.0.0',
      extendedDebugging: debugMode,
    },
  },

  'SL_ANDROID14': {
    base: 'SauceLabs',
    platformName: 'Android',
    browserName: 'Chrome',
    browserVersion,
    'appium:deviceName': 'Google Pixel 6 Pro GoogleAPI Emulator',
    'appium:platformVersion': '14.0',
    'appium:automationName': 'uiautomator2',
    'sauce:options': {
      appiumVersion: '2.0.0',
      extendedDebugging: debugMode,
    },
  },
};

const sauceAliases = {
  'CI_REQUIRED': buildConfiguration('unitTest', 'SL', true),
  'CI_OPTIONAL': buildConfiguration('unitTest', 'SL', false),
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
