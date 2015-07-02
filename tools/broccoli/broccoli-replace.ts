import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

var minimatch = require('minimatch');
var FILE_ENCODING = {encoding: 'utf-8'};

/**
 * Intercepts each changed file and replaces its contents with
 * the associated changes.
 */
class DiffingReplace implements DiffingBroccoliPlugin {
  constructor(private inputPath, private cachePath, private options) {}

  rebuild(treeDiff: DiffResult) {
    var patterns = this.options.patterns;
    var files = this.options.files;

    treeDiff.addedPaths.concat(treeDiff.changedPaths)
        .forEach((changedFilePath) => {
          var sourceFilePath = path.join(this.inputPath, changedFilePath);
          var destFilePath = path.join(this.cachePath, changedFilePath);
          var destDirPath = path.dirname(destFilePath);

          if (!fs.existsSync(destDirPath)) {
            fse.mkdirpSync(destDirPath);
          }

          var fileMatches = files.some((filePath) => minimatch(changedFilePath, filePath));
          if (fileMatches) {
            var content = fs.readFileSync(sourceFilePath, FILE_ENCODING);
            patterns.forEach((pattern) => {
              var replacement = pattern.replacement;
              if (typeof replacement === 'function') {
                replacement = function(content) {
                  return pattern.replacement(content, changedFilePath);
                };
              }
              content = content.replace(pattern.match, replacement);
            });
            fs.writeFileSync(destFilePath, content, FILE_ENCODING);
          } else if (!fs.existsSync(destFilePath)) {
            fs.symlinkSync(sourceFilePath, destFilePath);
          }
        });

    treeDiff.removedPaths.forEach((removedFilePath) => {
      var destFilePath = path.join(this.cachePath, removedFilePath);
      fs.unlinkSync(destFilePath);
    });
  }
}

export default wrapDiffingPlugin(DiffingReplace);
