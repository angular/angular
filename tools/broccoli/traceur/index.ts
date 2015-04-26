/// <reference path="../broccoli.d.ts" />
/// <reference path="../broccoli-writer.d.ts" />
/// <reference path="../../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import TreeDiffer = require('../tree-differ');
import Writer = require('broccoli-writer');

let traceur = require('../../../../tools/transpiler');
let symlinkOrCopy = require('symlink-or-copy');
let xtend = require('xtend');


export = traceurCompiler;

function traceurCompiler(inputTree, destExtension, destSourceMapExtension, options) {
  return new TraceurCompiler(inputTree, destExtension, destSourceMapExtension, options);
}

traceurCompiler['RUNTIME_PATH'] = traceur.RUNTIME_PATH;


class TraceurCompiler implements BroccoliTree {
  treeDiffer: TreeDiffer;
  initialized = false;

  // props monkey-patched by broccoli builder:
  inputPath = null;
  cachePath = null;
  outputPath = null;


  constructor(public inputTree: BroccoliTree, private destExtension: string,
              private destSourceMapExtension: string, private options: {[key: string]: any}) {}


  rebuild() {
    let firstRun = !this.initialized;
    this.init();

    let diffResult = this.treeDiffer.diffTree();
    diffResult.log(!firstRun);

    diffResult.changedPaths.forEach((changedFilePath) => {
      var extension = path.extname(changedFilePath).toLowerCase();
      if (extension === '.js' || extension === '.es6' || extension === '.cjs') {
        var options = xtend({filename: changedFilePath}, this.options);

        var fsOpts = {encoding: 'utf-8'};
        var absoluteInputFilePath = path.join(this.inputPath, changedFilePath);
        var sourcecode = fs.readFileSync(absoluteInputFilePath, fsOpts);

        var result = traceur.compile(options, changedFilePath, sourcecode);

        // TODO: we should fix the sourceMappingURL written by Traceur instead of overriding
        // (but we might switch to typescript first)
        var mapFilepath = changedFilePath.replace(/\.\w+$/, '') + this.destSourceMapExtension;
        result.js = result.js + '\n//# sourceMappingURL=./' + path.basename(mapFilepath);

        var destFilepath = changedFilePath.replace(/\.\w+$/, this.destExtension);
        var destFile = path.join(this.cachePath, destFilepath);
        fse.mkdirsSync(path.dirname(destFile));
        fs.writeFileSync(destFile, result.js, fsOpts);

        var destMap = path.join(this.cachePath, mapFilepath);
        result.sourceMap.file = destFilepath;
        fs.writeFileSync(destMap, JSON.stringify(result.sourceMap), fsOpts);
      }
    });

    diffResult.removedPaths.forEach((removedFilePath) => {
      var destFilepath = removedFilePath.replace(/\.\w+$/, this.destExtension);
      var absoluteOuputFilePath = path.join(this.cachePath, destFilepath);
      fs.unlinkSync(absoluteOuputFilePath);
    });

    // just symlink the cache and output tree
    fs.rmdirSync(this.outputPath);
    symlinkOrCopy.sync(this.cachePath, this.outputPath);
  }


  private init() {
    if (!this.initialized) {
      this.initialized = true;
      this.treeDiffer = new TreeDiffer(this.inputPath);
    }
  }


  cleanup() {}
}
