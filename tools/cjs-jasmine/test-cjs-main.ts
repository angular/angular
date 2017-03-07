/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const testingPlatformServer = require('../../all/@angular/platform-server/testing/src/server.js');
const coreTesting = require('../../all/@angular/core/testing');

coreTesting.TestBed.initTestEnvironment(
    testingPlatformServer.ServerTestingModule, testingPlatformServer.platformServerTesting());
