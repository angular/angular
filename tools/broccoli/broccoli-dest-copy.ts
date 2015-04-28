/// <reference path="./broccoli.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import TreeDiffer = require('./tree-differ');

/**
 * Intercepts each file as it is copied to the destination tempdir,
 * and tees a copy to the given path outside the tmp dir.
 */
export = function destCopy(inputTree, outputRoot) { return new DestCopy(inputTree, outputRoot); }


class DestCopy implements BroccoliTree {
  treeDirtyChecker: TreeDiffer;
  initialized = false;

  // props monkey-patched by broccoli builder:
  inputPath = null;
  cachePath = null;
  outputPath = null;


  constructor(public inputTree: BroccoliTree, public outputRoot: string) {}


  rebuild() {
    let firstRun = !this.initialized;
    this.init();

    let diffResult = this.treeDirtyChecker.diffTree();
    diffResult.log(!firstRun);

    diffResult.changedPaths.forEach((changedFilePath) => {
      var destFilePath = path.join(this.outputRoot, changedFilePath);

      var destDirPath = path.dirname(destFilePath);
      fse.mkdirsSync(destDirPath);
      fse.copySync(path.join(this.inputPath, changedFilePath), destFilePath);
    });

    diffResult.removedPaths.forEach((removedFilePath) => {
      var destFilePath = path.join(this.outputRoot, removedFilePath);

      // TODO: what about obsolete directories? we are not cleaning those up yet
      fs.unlinkSync(destFilePath);
    });
  }


  private init() {
    if (!this.initialized) {
      this.initialized = true;
      this.treeDirtyChecker = new TreeDiffer(this.inputPath);
    }
  }


  cleanup() {}
}
