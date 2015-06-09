import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';


/**
 * Intercepts each changed file and replaces its contents with
 * the associated changes.
 */
export class DiffingFlatten implements DiffingBroccoliPlugin {
  constructor(private inputPath, private cachePath, private options) {}

  rebuild(treeDiff: DiffResult) {
    treeDiff.changedPaths.forEach((changedFilePath) => {
      var sourceFilePath = path.join(this.inputPath, changedFilePath);
      var destFilePath = path.join(this.cachePath, path.basename(changedFilePath));
      var destDirPath = path.dirname(destFilePath);

      if (!fs.existsSync(destDirPath)) {
        fse.mkdirpSync(destDirPath);
      }

      // TODO: once we have addedPaths support, we should throw dupes are found
      if (!fs.existsSync(destFilePath)) {
        fs.symlinkSync(sourceFilePath, destFilePath);
      }
    });

    treeDiff.removedPaths.forEach((removedFilePath) => {
      var destFilePath = path.join(this.cachePath, path.basename(removedFilePath));
      fs.unlinkSync(destFilePath);
    });
  }
}

export default wrapDiffingPlugin(DiffingFlatten);
