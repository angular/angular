/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

class TSToDartTranspiler implements DiffingBroccoliPlugin {
  static includeExtensions = ['.ts'];

  private transpiler: any /*ts2dart.Transpiler*/;
  private additionalFiles: string[];

  constructor(public inputPath: string, public cachePath: string,
              public options: any /*ts2dart.TranspilerOptions*/) {
    // Additional files to include in the transpile call. These files could include, e.g.,
    // .d.ts files. They will always be included in the transpile call below, even if they
    // weren't modified.
    this.additionalFiles = options.additionalFiles || [];
    // Delete additionalFiles as the transpiler does not support that option.
    delete options.additionalFiles;

    options.basePath = inputPath;
    // Workaround for https://github.com/dart-lang/dart_style/issues/493
    var ts2dart = require('ts2dart');
    this.transpiler = new ts2dart.Transpiler(options);
  }

  rebuild(treeDiff: DiffResult) {
    let toEmit = [path.resolve(this.inputPath, 'angular2/manual_typings/globals.d.ts')];
    let getDartFilePath = (path: string) => path.replace(/((\.js)|(\.ts))$/i, '.dart');
    treeDiff.addedPaths.concat(treeDiff.changedPaths)
      .filter(name => !name.match(/\.d\.ts$/))
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
    this.transpiler.transpile(this.additionalFiles.concat(toEmit), this.cachePath);
  }
}

export default wrapDiffingPlugin(TSToDartTranspiler);
