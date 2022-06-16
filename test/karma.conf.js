const path = require('path');
const {customLaunchers, platformMap} = require('./browser-providers');

module.exports = config => {
  config.set({
    basePath: path.join(__dirname, '..'),
    frameworks: ['jasmine'],
    middleware: ['fake-url'],
    plugins: [
      require('karma-jasmine'),
      require('karma-browserstack-launcher'),
      require('karma-sauce-launcher'),
      require('karma-sourcemap-loader'),
      {
        'middleware:fake-url': [
          'factory',
          function () {
            // Middleware that avoids triggering 404s during tests that need to reference
            // image paths. Assumes that the image path will start with `/$`.
            return function (request, response, next) {
              if (request.url.indexOf('/$') === 0) {
                response.writeHead(200);
                return response.end();
              }

              next();
            };
          },
        ],
      },
    ],
    files: [
      {pattern: 'node_modules/reflect-metadata/Reflect.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/zone.min.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/proxy.min.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/sync-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/jasmine-patch.min.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false},
      {
        pattern: 'node_modules/moment/min/moment-with-locales.min.js',
        included: false,
        watched: false,
      },
      {pattern: 'node_modules/luxon/build/amd/**/*', included: false, watched: false},
      {pattern: 'node_modules/@material/*/dist/*', included: false, watched: false},
      {pattern: 'node_modules/kagekiri/**', included: false, watched: false},

      // is copied into the "dist/" folder so that the Karma config can use it.
      {pattern: 'dist/legacy-test-bundle.spec.js', included: true, watched: false},

      // Include a Material theme in the test suite. Also include the MDC theme as
      // karma runs tests for the MDC prototype components as well.
      {
        pattern: 'src/material/core/theming/prebuilt/indigo-pink.css',
        included: true,
        watched: true,
      },
      {
        pattern: 'src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css',
        included: true,
        watched: true,
      },
    ],

    customLaunchers: customLaunchers,

    preprocessors: {'dist/*.js': ['sourcemap']},

    reporters: ['dots'],
    autoWatch: false,

    sauceLabs: {
      testName: 'Angular Material Unit Tests',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 1000,
      commandTimeout: 600,
      maxDuration: 5400,
    },

    browserStack: {
      project: 'Angular Material Unit Tests',
      startTunnel: true,
      retryLimit: 3,
      timeout: 1800,
      video: false,
    },

    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 300000,

    browsers: [],
    singleRun: false,

    // Try Websocket for a faster transmission first. Fallback to polling if necessary.
    transports: ['websocket', 'polling'],

    browserConsoleLogOptions: {terminal: true, level: 'log'},

    client: {
      jasmine: {
        // TODO(jelbourn): re-enable random test order once we can de-flake existing issues.
        random: false,
      },
    },
  });

  if (process.env['CIRCLECI']) {
    const containerInstanceIndex = Number(process.env['CIRCLE_NODE_INDEX']);
    const maxParallelContainerInstances = Number(process.env['CIRCLE_NODE_TOTAL']);
    const tunnelIdentifier = `angular-material-${process.env['CIRCLE_BUILD_NUM']}-${containerInstanceIndex}`;
    const buildIdentifier = `circleci-${tunnelIdentifier}`;
    const testPlatform = process.env['TEST_PLATFORM'];

    // This defines how often a given browser should be launched in the same CircleCI
    // container. This is helpful if we want to shard tests across the same browser.
    const parallelBrowserInstances = Number(process.env['KARMA_PARALLEL_BROWSERS']) || 1;

    // In case there should be multiple instances of the browsers, we need to set up the
    // the karma-parallel plugin.
    if (parallelBrowserInstances > 1) {
      config.frameworks.unshift('parallel');
      config.plugins.push(require('karma-parallel'));
      config.parallelOptions = {
        executors: parallelBrowserInstances,
        shardStrategy: 'round-robin',
      };
    }

    if (testPlatform === 'browserstack') {
      config.browserStack.build = buildIdentifier;
      config.browserStack.tunnelIdentifier = tunnelIdentifier;
    } else if (testPlatform === 'saucelabs') {
      config.sauceLabs.build = buildIdentifier;
      config.sauceLabs.tunnelIdentifier = tunnelIdentifier;
      // Setup the saucelabs reporter so that we report back to Saucelabs once
      // our tests finished.
      config.reporters.push('saucelabs');
    }

    // If the test platform is not "local", browsers are launched externally and can take
    // up more time to capture. Also the connection can be flaky and therefore needs a
    // higher disconnect timeout.
    if (testPlatform !== 'local') {
      config.browserDisconnectTimeout = 180000;
      config.browserDisconnectTolerance = 3;
      config.captureTimeout = 180000;
    }

    const platformBrowsers = platformMap[testPlatform];
    const browserInstanceChunks = splitBrowsersIntoInstances(
      platformBrowsers,
      maxParallelContainerInstances,
    );

    // Configure Karma to launch the browsers that belong to the given test platform and
    // container instance.
    config.browsers = browserInstanceChunks[containerInstanceIndex];
  }
};

/**
 * Splits the specified browsers into a maximum amount of chunks. The chunk of browsers
 * are being created deterministically and therefore we get reproducible tests when executing
 * the same CircleCI instance multiple times.
 */
function splitBrowsersIntoInstances(browsers, maxInstances) {
  let chunks = [];
  let assignedBrowsers = 0;

  for (let i = 0; i < maxInstances; i++) {
    const chunkSize = Math.floor((browsers.length - assignedBrowsers) / (maxInstances - i));
    chunks[i] = browsers.slice(assignedBrowsers, assignedBrowsers + chunkSize);
    assignedBrowsers += chunkSize;
  }

  return chunks;
}
