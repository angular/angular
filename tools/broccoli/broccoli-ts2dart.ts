/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import * as ts2dart from 'ts2dart';
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

class TSToDartTranspiler implements DiffingBroccoliPlugin {
  static includeExtensions = ['.ts'];

  private transpiler: ts2dart.Transpiler;

  constructor(public inputPath: string, public cachePath: string,
              public options: ts2dart.TranspilerOptions) {
    options.basePath = inputPath;
    this.transpiler = new ts2dart.Transpiler(options);
  }

  rebuild(treeDiff: DiffResult) {
    // Matches rootFilePaths in node_tree.ts
    // These files are not compatible with Typescript's ES6 library
    // so they must be explicitly included when targetting ES5, as ts2dart does.
    // see https://github.com/angular/angular/issues/3770
    let toEmit = [path.resolve(this.inputPath, 'angular2/manual_typings/traceur-runtime.d.ts')];
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
