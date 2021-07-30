/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Unique place to configure the browsers which are used in the different CI jobs in Sauce Labs (SL)
// and BrowserStack (BS).
// If the target is set to null, then the browser is not run anywhere during CI.
// If a category becomes empty (e.g. BS and required), then the corresponding job must be commented
// out in the CI configuration.
var CIconfiguration = {
  // Chrome and Firefox run as part of the Bazel browser tests, so we do not run them as
  // part of the legacy Saucelabs tests.
  'Chrome': {unitTest: {target: null, required: false}, e2e: {target: null, required: true}},
  'Firefox': {unitTest: {target: null, required: false}, e2e: {target: null, required: true}},
  // Set ESR as a not required browser as it fails for Ivy acceptance tests.
  'FirefoxESR': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  // Disabled because using the "beta" channel of Chrome can cause non-deterministic CI results.
  // e.g. a new chrome beta version has been released, but the Saucelabs selenium server does
  // not provide a chromedriver version that is compatible with the new beta.
  'ChromeBeta': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: false}},
  'ChromeDev': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  // FirefoxBeta and FirefoxDev should be target:'BS' or target:'SL', and required:true
  // Currently deactivated due to https://github.com/angular/angular/issues/7560
  'FirefoxBeta': {unitTest: {target: null, required: true}, e2e: {target: null, required: false}},
  'FirefoxDev': {unitTest: {target: null, required: true}, e2e: {target: null, required: true}},
  'Edge': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  'Android7': {unitTest: {target: 'SL', required: true}, e2e: {target: null, required: true}},
  'Android8': {unitTest: {target: 'SL', required: true}, e2e: {target: null, required: true}},
  'Android9': {unitTest: {target: 'SL', required: true}, e2e: {target: null, required: true}},
  // Disable Android 10 tests due to infrastructure failure.
  // ex:
  // Chrome Mobile 74.0.3729 (Android 0.0.0) ERROR:
  //    Error: XHR error loading
  //    http://angular-ci.local:9876/base/node_modules/rxjs/internal/operators/zip.js
  //
  // Error loading http://angular-ci.local:9876/base/node_modules/rxjs/internal/operators/zip.js as
  // "../internal/operators/zip" from
  // http://angular-ci.local:9876/base/node_modules/rxjs/operators/index.js
  'Android10': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  // Disable all Safari and iOS tests because of incorrect results
  // ex:
  // Mobile Safari 13.0.0 (iOS 13.0.0) styling static template only should capture static values in
  // TStylingKey FAILED Expected $.content = 'dynamic' to equal '"dynamic"'. Mobile Safari 12.0.0
  // (iOS 12.0.0) styling should handle values wrapped into SafeValue FAILED Expected
  // 'url("http://angular-ci.local:9876/1.png")' to contain 'url("/1.png")'.s Tracking in:
  // https://github.com/angular/angular/issues/36975
  'Safari12': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  'Safari13': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  'iOS12': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  'iOS13': {unitTest: {target: 'SL', required: false}, e2e: {target: null, required: true}},
  'WindowsPhone': {unitTest: {target: 'BS', required: false}, e2e: {target: null, required: true}}
};

var customLaunchers = {
  'DartiumWithWebPlatform':
      {base: 'Dartium', flags: ['--enable-experimental-web-platform-features']},
  'ChromeNoSandbox': {base: 'Chrome', flags: ['--no-sandbox']},
  'SL_CHROME': {base: 'SauceLabs', browserName: 'chrome', version: '81'},
  'SL_CHROMEBETA': {base: 'SauceLabs', browserName: 'chrome', version: 'beta'},
  'SL_CHROMEDEV': {base: 'SauceLabs', browserName: 'chrome', version: 'dev'},
  'SL_FIREFOX': {base: 'SauceLabs', browserName: 'firefox', version: '76'},
  // Firefox 68 is the current ESR vesion
  'SL_FIREFOXESR': {base: 'SauceLabs', browserName: 'firefox', version: '68'},
  'SL_FIREFOXBETA':
      {base: 'SauceLabs', platform: 'Windows 10', browserName: 'firefox', version: 'beta'},
  'SL_FIREFOXDEV':
      {base: 'SauceLabs', platform: 'Windows 10', browserName: 'firefox', version: 'dev'},
  'SL_SAFARI12':
      {base: 'SauceLabs', browserName: 'safari', platform: 'macOS 10.13', version: '12.1'},
  'SL_SAFARI13':
      {base: 'SauceLabs', browserName: 'safari', platform: 'macOS 10.15', version: '13.0'},
  'SL_IOS12': {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '12.0',
    device: 'iPhone 7 Simulator'
  },
  'SL_IOS13': {
    base: 'SauceLabs',
    browserName: 'Safari',
    platform: 'iOS',
    version: '13.0',
    device: 'iPhone 11 Simulator'
  },
  'SL_EDGE': {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
    version: '14.14393'
  },
  'SL_ANDROID7': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '7.1',
    device: 'Android GoogleAPI Emulator'
  },
  'SL_ANDROID8': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '8.0',
    device: 'Android GoogleAPI Emulator'
  },
  'SL_ANDROID9': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '9.0',
    device: 'Android GoogleAPI Emulator'
  },
  'SL_ANDROID10': {
    base: 'SauceLabs',
    browserName: 'Chrome',
    platform: 'Android',
    version: '10.0',
    device: 'Android GoogleAPI Emulator'
  },
  'BS_CHROME': {base: 'BrowserStack', browser: 'chrome', os: 'OS X', os_version: 'Yosemite'},
  'BS_FIREFOX': {base: 'BrowserStack', browser: 'firefox', os: 'Windows', os_version: '10'},
  'BS_SAFARI10': {base: 'BrowserStack', browser: 'safari', os: 'OS X', os_version: 'Sierra'},
  'BS_EDGE': {base: 'BrowserStack', browser: 'edge', os: 'Windows', os_version: '10'},
  'BS_WINDOWSPHONE':
      {base: 'BrowserStack', device: 'Nokia Lumia 930', os: 'winphone', os_version: '8.1'},
  'BS_ANDROID7': {base: 'BrowserStack', device: 'Google Pixel', os: 'android', os_version: '7.1'}
};

var sauceAliases = {
  'ALL': Object.keys(customLaunchers).filter(function(item) {
    return customLaunchers[item].base == 'SauceLabs';
  }),
  'DESKTOP': ['SL_CHROME', 'SL_FIREFOX', 'SL_EDGE', 'SL_SAFARI12', 'SL_SAFARI13', 'SL_FIREFOXESR'],
  'MOBILE': ['SL_ANDROID7', 'SL_ANDROID8', 'SL_ANDROID9', 'SL_ANDROID10', 'SL_IOS12', 'SL_IOS13'],
  'ANDROID': ['SL_ANDROID7', 'SL_ANDROID8', 'SL_ANDROID9', 'SL_ANDROID10'],
  'FIREFOX': ['SL_FIREFOXESR'],
  'IOS': ['SL_IOS12', 'SL_IOS13'],
  'SAFARI': ['SL_SAFARI12', 'SL_SAFARI13'],
  'BETA': ['SL_CHROMEBETA', 'SL_FIREFOXBETA'],
  'DEV': ['SL_CHROMEDEV', 'SL_FIREFOXDEV'],
  'CI_REQUIRED': buildConfiguration('unitTest', 'SL', true),
  'CI_OPTIONAL': buildConfiguration('unitTest', 'SL', false)
};

var browserstackAliases = {
  'ALL': Object.keys(customLaunchers).filter(function(item) {
    return customLaunchers[item].base == 'BrowserStack';
  }),
  'DESKTOP': [
    'BS_CHROME',
    'BS_FIREFOX',
    'BS_EDGE',
  ],
  'MOBILE': ['BS_ANDROID7', 'BS_WINDOWSPHONE'],
  'ANDROID': ['BS_ANDROID7'],
  'IOS': [],
  'SAFARI': [],
  'CI_REQUIRED': buildConfiguration('unitTest', 'BS', true),
  'CI_OPTIONAL': buildConfiguration('unitTest', 'BS', false)
};

module.exports = {
  customLaunchers: customLaunchers,
  sauceAliases: sauceAliases,
  browserstackAliases: browserstackAliases
};

function buildConfiguration(type, target, required) {
  return Object.keys(CIconfiguration)
      .filter((item) => {
        var conf = CIconfiguration[item][type];
        return conf.required === required && conf.target === target;
      })
      .map((item) => target + '_' + item.toUpperCase());
}
