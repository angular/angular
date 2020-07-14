// @ts-check
// A protractor config to use to run the tests using the Chrome version provided by `puppeteer`.
// This is useful to ensure deterministic runs on CI and locally. This file is ignored when creating
// StackBlitz examples and ZIP archives for each example.

const {config} = require('./protractor.conf.js');

exports.config = {
  ...config,
  capabilities: {
    ...config.capabilities,
    chromeOptions: {
      ...config.capabilities.chromeOptions,
      binary: require('puppeteer').executablePath(),
      // See /integration/README.md#browser-tests for more info on these args
      args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--mute-audio'],
    },
  },
};
