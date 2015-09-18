'use strict';

var sauceConf = require('../../sauce.conf');

// This runs the tests for the router in Angular 1.x

module.exports = function (config) {
  var options = {
    frameworks: ['jasmine'],

    files: [
      '../../node_modules/angular/angular.js',
      '../../node_modules/angular-animate/angular-animate.js',
      '../../node_modules/angular-mocks/angular-mocks.js',

      '../../dist/angular_1_router.js',
      'src/ng_route_shim.js',

      'test/*.es5.js',
      'test/**/*_spec.js'
    ],

    customLaunchers: sauceConf.customLaunchers,

    browsers: ['ChromeCanary']
  };

  config.set(options);
};
