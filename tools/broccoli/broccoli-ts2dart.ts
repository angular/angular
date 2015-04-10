/// <reference path="./broccoli-writer.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import Writer = require('broccoli-writer');
import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import ts2dart = require('ts2dart');

type Set = {
  [s:string]: boolean
};

class TypeScriptToDartTranspiler extends Writer {
  constructor(private inputTree, private includePattern = /\.(js|ts)$/) { super(); }

  write(readTree, destDir): Promise<void> {
    return readTree(this.inputTree).then(dir => this.transpile(dir, destDir));
  }

  private transpile(inputDir: string, destDir: string) {
    var files = this.listRecursive(inputDir);
    var toTranspile = [];
    for (var f in files) {
      // If it's not matching, don't translate.
      if (!f.match(this.includePattern)) continue;
      var dartVariant = f.replace(this.includePattern, '.dart');
      // A .dart file of the same name takes precedence over transpiled code.
      if (files.hasOwnProperty(dartVariant)) continue;
      toTranspile.push(f);
    }
    var transpiler = new ts2dart.Transpiler(
        {generateLibraryName: true, generateSourceMap: false, basePath: inputDir});
    transpiler.transpile(toTranspile, destDir);
  }

  private listRecursive(root: string, res: Set = {}): Set {
    var paths = fs.readdirSync(root);
    paths.forEach((p) => {
      p = path.join(root, p);
      var stat = fs.statSync(p);
      if (stat.isDirectory()) {
        this.listRecursive(p, res);
      } else {
        // Collect *all* files so we can check .dart files that already exist and exclude them.
        res[p] = true;
      }
    });
    return res;
  }
}

export function transpile(inputTree) {
  return new TypeScriptToDartTranspiler(inputTree);
}
