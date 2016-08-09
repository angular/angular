var testingPlatformServer = require('../../all/@angular/platform-server/testing/server.js');
var testing = require('../../all/@angular/core/testing');

testing.TestBed.initTestEnvironment(
    testingPlatformServer.ServerTestingModule, testingPlatformServer.platformServerTesting());
