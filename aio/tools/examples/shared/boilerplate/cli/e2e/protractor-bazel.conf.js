// @ts-check
// A protractor config to use to run the tests using the bazel-provided Chrome version.
// This is useful to ensure deterministic runs on CI and locally. This file is ignored when creating
// StackBlitz examples and ZIP archives for each example.

const {config} = require('./protractor.conf.js');

exports.config = {
  ...config,
  chromeDriver: process.env.CHROMEDRIVER_BIN,
  capabilities: {
    ...config.capabilities,
    chromeOptions: {
      ...config.capabilities.chromeOptions,
      binary: process.env.CHROME_BIN,
      // See /integration/README.md#browser-tests for more info on these args.
      // Bazel tests run within a sandbox already and Chrome cannot have its own sandbox too.
      args: [
        '--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage',
        '--hide-scrollbars', '--mute-audio'
      ],
    },
  },
};
