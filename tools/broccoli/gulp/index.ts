var broccoli = require('broccoli');
var destCopy = require('../broccoli-dest-copy');
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

  tree = destCopy(tree, 'dist');

  var builder = new broccoli.Builder(tree);
  return builder.build()
      .then(hash =>
            {
              console.log('=== Stats for %s (total: %ds) ===', outputRoot,
                          Math.round(hash.totalTime / 1000000) / 1000);
              printSlowTrees(hash.graph);
            })
      .finally(() =>
               {
                 time('Build cleanup', () => builder.cleanup());
                 console.log('=== Done building %s ===', outputRoot);
               })
      .catch(err => {
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
