/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="./ts2dart.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import ts2dart = require('ts2dart');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

class TSToDartTranspiler implements DiffingBroccoliPlugin {
  static includeExtensions = ['.ts'];

  private basePath: string;
  private transpiler: ts2dart.Transpiler;

  constructor(public inputPath: string, public cachePath: string, public options) {
    options.basePath = inputPath;
    this.transpiler = new ts2dart.Transpiler(options);
  }

  rebuild(treeDiff: DiffResult) {
    let toEmit = [];
    let getDartFilePath = (path: string) => path.replace(/((\.js)|(\.ts))$/i, '.dart');
    treeDiff.addedPaths.concat(treeDiff.changedPaths)
        .forEach((changedPath) => {
          let inputFilePath = path.resolve(this.inputPath, changedPath);

          // Ignore files which don't need to be transpiled to Dart
          let dartInputFilePath = getDartFilePath(inputFilePath);
          if (fs.existsSync(dartInputFilePath)) return;

          // Prepare to rebuild
          toEmit.push(path.resolve(this.inputPath, changedPath));
        });

    treeDiff.removedPaths.forEach((removedPath) => {
      let absolutePath = path.resolve(this.inputPath, removedPath);

      // Ignore files which don't need to be transpiled to Dart
      let dartInputFilePath = getDartFilePath(absolutePath);
      if (fs.existsSync(dartInputFilePath)) return;

      let dartOutputFilePath = getDartFilePath(removedPath);
      fs.unlinkSync(path.join(this.cachePath, dartOutputFilePath));
    });

    this.transpiler.transpile(toEmit, this.cachePath);
  }
}

export default wrapDiffingPlugin(TSToDartTranspiler);
