'use strict';

var glob = require('glob');
var minijasminenode2 = require('minijasminenode2');
var path = require('path');
// Require traceur to exposes $traceurRuntime on global context so that CJS files can run
require('traceur/bin/traceur-runtime.js');

glob(process.argv[2], function (error, specFiles) {
  minijasminenode2.executeSpecs({
    includeStackTrace: true,
    defaultTimeoutInterval: 1000,
    showColors: process.argv.indexOf('--no-color') === -1,
    specs: specFiles
  });
});
