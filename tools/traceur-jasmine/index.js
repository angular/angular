'use strict';

var glob = require('glob');
var JasmineRunner = require('jasmine');
var path = require('path');
// Require traceur to exposes $traceurRuntime on global context so that CJS files can run
require('traceur/bin/traceur-runtime.js');
require('reflect-metadata/Reflect');

var jrunner = new JasmineRunner();

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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

jrunner.configureDefaultReporter({
  showColors: process.argv.indexOf('--no-color') === -1
});

jrunner.onComplete(function(passed) {
  process.exit(passed ? 0 : 1);
});
jrunner.projectBaseDir = path.resolve(__dirname, '../../');
jrunner.specDir = '';
jrunner.addSpecFiles(specFiles);
jrunner.execute();
