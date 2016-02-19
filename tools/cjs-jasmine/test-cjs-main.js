var testingPlatformServer = require('../../dist/js/cjs/angular2/platform/testing/server.js');
var testing = require('../../dist/js/cjs/angular2/testing.js');

testing.setBaseTestProviders(testingPlatformServer.TEST_SERVER_PLATFORM_PROVIDERS,
                             testingPlatformServer.TEST_SERVER_APPLICATION_PROVIDERS);
