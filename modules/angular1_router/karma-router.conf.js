/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

var browserProvidersConf = require('../../browser-providers.conf.js');

// This runs the tests for the router in AngularJS

module.exports = function (config) {
  var options = {
    frameworks: ['jasmine'],

    files: [
      '../../node_modules/core-js/client/core.js',
      '../../node_modules/angular/angular.js',
      '../../node_modules/angular-animate/angular-animate.js',
      '../../node_modules/angular-mocks/angular-mocks.js',

      '../../dist/angular_1_router.js',
      'src/ng_route_shim.js',

      'test/*.es5.js',
      'test/**/*_spec.js'
    ],

    customLaunchers: browserProvidersConf.customLaunchers,

    browsers: ['Chrome']
  };

  config.set(options);
};
