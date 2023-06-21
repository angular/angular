/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const browserProvidersConf = require('./browser-providers.conf');
const {hostname} = require('os');

const seed = process.env.JASMINE_RANDOM_SEED || String(Math.random()).slice(-5);

console.info(`Jasmine random seed: ${seed}`);
console.info(`Saucelabs target detected: ${process.env.TEST_TARGET}`);

process.env.KARMA_WEB_TEST_MODE = 'SL_REQUIRED';

module.exports = function(config) {
  const conf = {
    frameworks: ['jasmine'],

    client: {
      jasmine: {
        random: true,
        seed,
      },
      captureConsole: true,
    },

    files: [],

    plugins: [require('./tools/saucelabs-daemon/launcher/index.cjs').default],

    customLaunchers: browserProvidersConf.customLaunchers,

    // Always use `polling` for increased communication stability.
    transports: ['polling'],

    port: 9876,
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
  };

  // Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1431. The idea is
  // that we do no not allow `@bazel/karma` to add the `progress` reporter.
  Object.defineProperty(conf, 'reporters', {
    enumerable: true,
    get: () => ['dots'],
    set: () => {},
  });

  // For SauceLabs jobs, we set up a domain which resolves to the machine which launched
  // the tunnel. We do this because devices are sometimes not able to properly resolve
  // `localhost` or `127.0.0.1` through the SauceLabs tunnel. Using a domain that does not
  // resolve to anything on SauceLabs VMs ensures that such requests are always resolved through
  // the tunnel, and resolve to the actual tunnel host machine (commonly the CircleCI VMs).
  // More context can be found in: https://github.com/angular/angular/pull/35171.
  if (process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN) {
    conf.hostname = process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN;
  } else {
    conf.hostname = hostname();
  }

  if (process.env.KARMA_WEB_TEST_MODE) {
    // KARMA_WEB_TEST_MODE is used to setup karma to run in SauceLabs.
    console.log(`KARMA_WEB_TEST_MODE: ${process.env.KARMA_WEB_TEST_MODE}`);

    switch (process.env.KARMA_WEB_TEST_MODE) {
      case 'SL_REQUIRED':
        conf.browsers = browserProvidersConf.sauceAliases.CI_REQUIRED;
        break;
      case 'SL_OPTIONAL':
        conf.browsers = browserProvidersConf.sauceAliases.CI_OPTIONAL;
        break;
      default:
        throw new Error(
            `Unrecognized process.env.KARMA_WEB_TEST_MODE: ${process.env.KARMA_WEB_TEST_MODE}`);
    }
  }

  config.set(conf);
};
