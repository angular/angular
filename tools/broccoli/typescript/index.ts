/// <reference path="../broccoli.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../../node_modules/typescript/bin/typescript.d.ts" />

import fs = require('fs');
import path = require('path');
import ts = require('typescript');
import CachingWriter = require('broccoli-caching-writer');
var walkSync = require('walk-sync');
var xtend = require('xtend');

class TSCompiler extends CachingWriter {
  constructor(private inputTrees, private options: ts.CompilerOptions = {}) {
    super(inputTrees, {});
    CachingWriter.apply(this, arguments);
  }

  updateCache(srcDirs: string | string[], destDir) {
    if (!Array.isArray(srcDirs)) {
      srcDirs = [<string>srcDirs];
    }
    var options: ts.CompilerOptions = xtend({outDir: destDir}, this.options);
    if (this.options.outDir) {
      options.outDir = path.resolve(destDir, options.outDir);
    }
    if (options.out) {
      options.out = path.resolve(destDir, options.out);
    }
    options.target = (<any>ts).ScriptTarget[options.target];
    (<string[]>srcDirs)
        .forEach(srcDir => {
          var files = walkSync(srcDir)
                          .filter(filepath => path.extname(filepath).toLowerCase() === '.ts')
                          .map(filepath => path.resolve(srcDir, filepath));

          if (files.length > 0) {
            var program = ts.createProgram(files, options);
            var emitResult = program.emit();

            var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

            var errMsg = '';
            allDiagnostics.forEach(diagnostic => {
              var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
              if (!diagnostic.file) {
                errMsg += `\n${message}`;
                return;
              }
              var {line, character} =
                  diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
              errMsg += `\n${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
            });

            if (emitResult.emitSkipped) {
              throw new Error(errMsg);
            }
          }
        });
    return true;
  }
}
module.exports = TSCompiler;
