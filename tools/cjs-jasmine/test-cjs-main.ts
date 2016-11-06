/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var testingPlatformServer = require('../../all/@angular/platform-server/testing/server.js');
var testingJasmine = require('../../all/@angular/core/testing');

testingJasmine.TestBed.initTestEnvironment(
    testingPlatformServer.ServerTestingModule, testingPlatformServer.platformServerTesting());
