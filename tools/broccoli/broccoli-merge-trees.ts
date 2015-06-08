import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
var symlinkOrCopySync = require('symlink-or-copy').sync;
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

function pathExists(filePath) {
  try {
    if (fs.statSync(filePath)) {
      return true;
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  return false;
}

function outputFileSync(sourcePath, destPath) {
  let dirname = path.dirname(destPath);
  fse.mkdirsSync(dirname, {fs: fs});
  fse.removeSync(destPath);
  symlinkOrCopySync(sourcePath, destPath);
}

export class MergeTrees implements DiffingBroccoliPlugin {
  private mergedPaths: {[key: string]: number} = Object.create(null);

  constructor(public inputPaths: string[], public cachePath: string, public options) {}

  rebuild(treeDiffs: DiffResult[]) {
    treeDiffs.forEach((treeDiff: DiffResult, index) => {
      let inputPath = this.inputPaths[index];
      let existsLater = (relativePath) => {
        for (let i = treeDiffs.length - 1; i > index; --i) {
          if (pathExists(path.join(this.inputPaths[i], relativePath))) {
            return true;
          }
        }
        return false;
      };
      let existsSooner = (relativePath) => {
        for (let i = index - 1; i >= 0; --i) {
          if (pathExists(path.join(this.inputPaths[i], relativePath))) {
            return i;
          }
        }
        return -1;
      };
      treeDiff.changedPaths.forEach((changedPath) => {
        let inputTreeIndex = this.mergedPaths[changedPath];
        if (inputTreeIndex !== index && !existsLater(changedPath)) {
          inputTreeIndex = this.mergedPaths[changedPath] = index;
          let sourcePath = path.join(inputPath, changedPath);
          let destPath = path.join(this.cachePath, changedPath);
          outputFileSync(sourcePath, destPath);
        }
      });

      treeDiff.removedPaths.forEach((removedPath) => {
        let inputTreeIndex = this.mergedPaths[removedPath];

        // if inputTreeIndex !== index, this same file was handled during
        // changedPaths handling
        if (inputTreeIndex !== index) return;

        let destPath = path.join(this.cachePath, removedPath);
        fse.removeSync(destPath);
        let newInputTreeIndex = existsSooner(removedPath);

        // Update cached value (to either newInputTreeIndex value or undefined)
        this.mergedPaths[removedPath] = newInputTreeIndex;

        if (newInputTreeIndex >= 0) {
          // Copy the file from the newInputTreeIndex inputPath if necessary.
          let newInputPath = this.inputPaths[newInputTreeIndex];
          let sourcePath = path.join(newInputPath, removedPath);
          outputFileSync(sourcePath, destPath);
        }
      });
    });
  }
}

export default wrapDiffingPlugin(MergeTrees);
