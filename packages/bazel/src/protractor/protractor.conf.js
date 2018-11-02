/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');

const DEBUG = false;

const configPath = 'TMPL_config';
const onPreparePath = 'TMPL_on_prepare';
const workspace = 'TMPL_workspace';
const server = 'TMPL_server';

if (DEBUG)
  console.info(`Protractor test starting with:
  cwd: ${process.cwd()}
  configPath: ${configPath}
  onPreparePath: ${onPreparePath}
  workspace: ${workspace}
  server: ${server}`);

// Helper function to warn when a user specified value is being overwritten
function setConf(conf, name, value, msg) {
  if (conf[name] && conf[name] !== value) {
    console.warn(
        `Your protractor configuration specifies an option which is overwritten by Bazel: '${name}' ${msg}`);
  }
  conf[name] = value;
}

let conf = {};

// Import the user's base protractor configuration if specified
if (configPath) {
  const baseConf = require(configPath);
  if (!baseConf.config) {
    throw new Error('Invalid base protractor configration. Expected config to be exported.');
  }
  conf = baseConf.config;
}

// Import the user's on prepare function if specified
if (onPreparePath) {
  const onPrepare = require(onPreparePath);
  if (typeof onPrepare === 'function') {
    const original = conf.onPrepare;
    conf.onPrepare = function() {
      return Promise.resolve(original ? original() : null)
          .then(() => Promise.resolve(onPrepare({workspace, server})));
    };
  } else {
    throw new Error(
        'Invalid protractor on_prepare script. Expected a function as the default export.');
  }
}

// Override the user's base protractor configuration as appropriate based on the
// ts_web_test_suite & rules_webtesting WEB_TEST_METADATA attributes
setConf(conf, 'framework', 'jasmine2', 'is set to jasmine2');

const specs = [TMPL_specs].map(s => require.resolve(s)).filter(s => /\b(spec|test)\.js$/.test(s));

setConf(conf, 'specs', specs, 'are determined by the srcs and deps attribute');

// WEB_TEST_METADATA is configured in rules_webtesting based on value
// of the browsers attribute passed to ts_web_test_suite
// We setup the protractor configuration based on the values in this object
if (process.env['WEB_TEST_METADATA']) {
  const webTestMetadata = require(process.env['WEB_TEST_METADATA']);
  if (DEBUG) console.info(`WEB_TEST_METADATA: ${JSON.stringify(webTestMetadata, null, 2)}`);
  if (webTestMetadata['environment'] === 'sauce') {
    // If a sauce labs browser is chosen for the test such as
    // "@io_bazel_rules_webtesting//browsers/sauce:chrome-win10"
    // than the 'environment' will equal 'sauce'.
    // We expect that a SAUCE_USERNAME and SAUCE_ACCESS_KEY is available
    // from the environment for this test to run

    // TODO(gmagolan): implement sauce labs support for protractor
    throw new Error('Saucelabs not yet support by protractor_web_test_suite.');

    // if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    //   console.error('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are
    //   set.');
    //   process.exit(1);
    // }
    // setConf(conf, 'sauceUser', process.env.SAUCE_USERNAME, 'is determined by the SAUCE_USERNAME
    // environment variable');
    // setConf(conf, 'sauceKey', process.env.SAUCE_ACCESS_KEY, 'is determined by the
    // SAUCE_ACCESS_KEY environment variable');
  } else if (webTestMetadata['environment'] === 'local') {
    // When a local chrome or firefox browser is chosen such as
    // "@io_bazel_rules_webtesting//browsers:chromium-local" or
    // "@io_bazel_rules_webtesting//browsers:firefox-local"
    // then the 'environment' will equal 'local' and
    // 'webTestFiles' will contain the path to the binary to use
    const webTestNamedFiles = webTestMetadata['webTestFiles'][0]['namedFiles'];
    const headless = !process.env['DISPLAY'];
    if (webTestNamedFiles['CHROMIUM']) {
      const chromeBin = require.resolve(webTestNamedFiles['CHROMIUM']);
      const chromeDriver = require.resolve(webTestNamedFiles['CHROMEDRIVER']);
      const args = [];
      if (headless) {
        args.push('--headless');
        args.push('--disable-gpu');
      }
      setConf(conf, 'directConnect', true, 'is set to true for chrome');
      setConf(conf, 'chromeDriver', chromeDriver, 'is determined by the browsers attribute');
      setConf(
          conf, 'capabilities', {
            browserName: 'chrome',
            chromeOptions: {
              binary: chromeBin,
              args: args,
            }
          },
          'is determined by the browsers attribute');
    }
    if (webTestNamedFiles['FIREFOX']) {
      // TODO(gmagolan): implement firefox support for protractor
      throw new Error('Firefox not yet support by protractor_web_test_suite');

      // const firefoxBin = require.resolve(webTestNamedFiles['FIREFOX'])
      // const args = [];
      // if (headless) {
      //   args.push("--headless")
      //   args.push("--marionette")
      // }
      // setConf(conf, 'seleniumAddress', process.env.WEB_TEST_HTTP_SERVER.trim() + "/wd/hub", 'is
      // configured by Bazel for firefox browser')
      // setConf(conf, 'capabilities', {
      //   browserName: "firefox",
      //   'moz:firefoxOptions': {
      //     binary: firefoxBin,
      //     args: args,
      //   }
      // }, 'is determined by the browsers attribute');
    }
  } else {
    console.warn(`Unknown WEB_TEST_METADATA environment '${webTestMetadata['environment']}'`);
  }
}

// Export the complete protractor configuration
if (DEBUG) console.info(`Protractor configuration: ${JSON.stringify(conf, null, 2)}`);

exports.config = conf;
