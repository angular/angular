var broccoli = require('broccoli');
var copyDereferenceSync = require('copy-dereference').sync;
var fse = require('fs-extra');
var path = require('path');

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
      var dir = hash.directory;
      try {
        copyDereferenceSync(path.join(dir, outputRoot), distPath);
      } catch (err) {
        if (err.code === 'EEXIST') err.message += ' (we cannot build into an existing directory)';
        throw err;
      }
    })
    .finally(function () {
      builder.cleanup();
    })
    .catch(function (err) {
      // Should show file and line/col if present
      if (err.file) {
        console.error('File: ' + err.file);
      }
      console.error(err.stack);
      console.error('\nBuild failed');
      process.exit(1);
    });
}
