'use strict';

var glob = require('glob');
var minijasminenode2 = require('minijasminenode2');
var path = require('path');
// Require traceur to exposes $traceurRuntime on global context so that CJS files can run
require('traceur/bin/traceur-runtime.js');
require('reflect-metadata/Reflect');

// Support passing multiple globs
var globsIndex = process.argv.indexOf('--');
var args;
if (globsIndex < 0) {
  args = [process.argv[2]];
} else {
  args = process.argv.slice(globsIndex + 1);
}

var specFiles = args.
  map(function(globstr) { return glob.sync(globstr); }).
  reduce(function(specFiles, paths) { return specFiles.concat(paths); }, []);

minijasminenode2.executeSpecs({
  includeStackTrace: true,
  defaultTimeoutInterval: 1000,
  showColors: process.argv.indexOf('--no-color') === -1,
  specs: specFiles,
  onComplete: function(passed) {
    process.exit(passed ? 0 : 1);
  }
});
