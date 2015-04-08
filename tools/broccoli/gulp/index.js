'use strict';

var broccoli = require('broccoli');
var copyDereferenceSync = require('copy-dereference').sync;
var fse = require('fs-extra');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');


module.exports = broccoliBuild;
var broccoliExecuted = {};

/**
 * Integration point to run a broccoli build pipeline under gulp.
 * This is mostly derived from the broccoli-cli
 * @param tree a broccoli tree, obtained by calling `require` on the Brocfile
 * @param outputRoot the path under 'dist' owned exclusively by this Brocfile
 * @returns the promise to return back to gulp
 */
function broccoliBuild(tree, outputRoot) {
  if (broccoliExecuted.hasOwnProperty(outputRoot)) {
    throw new Error('The broccoli task can be called only once for outputRoot ' + outputRoot);
  }
  broccoliExecuted[outputRoot] = true;

  var distPath = path.join('dist', outputRoot);

  // We do a clean build every time to avoid stale outputs.
  // Broccoli's cache folders allow it to remain incremental without reading this dir.
  fse.removeSync(distPath);
  fse.mkdirsSync(path.join(distPath, '..'));

  var builder = new broccoli.Builder(tree);
  return builder.build()
    .then(function (hash) {
      printSlowTrees(hash.graph);

      var dir = hash.directory;
      try {
        time('Write build output', function() {
          copyDereferenceSync(path.join(dir, outputRoot), distPath);
        });
      } catch (err) {
        if (err.code === 'EEXIST') err.message += ' (we cannot build into an existing directory)';
        throw err;
      }
    })
    .finally(function () {
      time('Build cleanup', function() {
        builder.cleanup();
      });
    })
    .catch(function (err) {
      // Should show file and line/col if present
      if (err.file) {
        console.error('File: ' + err.file);
      }
      if (err.stack) {
        console.error(err.stack);
      } else {
        console.error(err);
      }
      console.error('\nBuild failed');
      process.exit(1);
    });
}


function time(label, work) {

  var start = Date.now();
  work();
  var duration = Date.now() - start;
  console.log("%s: %dms", label, duration);
}
