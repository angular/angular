/// <reference path="../broccoli-writer.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../../node_modules/typescript/bin/typescript.d.ts" />

import fs = require('fs');
import path = require('path');
import ts = require('typescript');
var walkSync = require('walk-sync');
import Writer = require('broccoli-writer');
var xtend = require('xtend');

class TSCompiler extends Writer {
  constructor(private inputTree, private options: ts.CompilerOptions = {}) { super(); }

  write(readTree, destDir) {
    var options: ts.CompilerOptions = xtend({outDir: destDir}, this.options);
    if (this.options.outDir) {
      options.outDir = path.resolve(destDir, options.outDir);
    }
    if (options.out) {
      options.out = path.resolve(destDir, options.out);
    }
    options.target = (<any>ts).ScriptTarget[options.target];
    return readTree(this.inputTree)
        .then(srcDir => {
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
  }
}
module.exports = TSCompiler;
