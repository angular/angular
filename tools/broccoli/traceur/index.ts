/// <reference path="../broccoli-writer.d.ts" />
/// <reference path="../../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
var traceur = require('../../../tools/transpiler');
var walkSync = require('walk-sync');
import Writer = require('broccoli-writer');
var xtend = require('xtend');

class TraceurFilter extends Writer {
  static RUNTIME_PATH = traceur.RUNTIME_PATH;

  constructor(private inputTree, private destExtension: string,
              private destSourceMapExtension: string, private options = {}) {
    super();
  }

  write(readTree, destDir) {
    return readTree(this.inputTree)
        .then(srcDir => {
          walkSync(srcDir)
              .filter(filepath =>
                      {
                        var extension = path.extname(filepath).toLowerCase();
                        return extension === '.js' || extension === '.es6' || extension === '.cjs';
                      })
              .map(filepath => {
                var options = xtend({filename: filepath}, this.options);

                var fsOpts = {encoding: 'utf-8'};
                var sourcecode = fs.readFileSync(path.join(srcDir, filepath), fsOpts);

                var result = traceur.compile(options, filepath, sourcecode);

                // TODO: we should fix the sourceMappingURL written by Traceur instead of overriding
                // (but we might switch to typescript first)
                var mapFilepath = filepath.replace(/\.\w+$/, '') + this.destSourceMapExtension;
                result.js = result.js + `\n//# sourceMappingURL=./${path.basename(mapFilepath)}`;

                var destFilepath = filepath.replace(/\.\w+$/, this.destExtension);
                var destFile = path.join(destDir, destFilepath);
                fse.mkdirsSync(path.dirname(destFile));
                fs.writeFileSync(destFile, result.js, fsOpts);

                var destMap = path.join(destDir, mapFilepath);
                result.sourceMap.file = destFilepath;
                fs.writeFileSync(destMap, JSON.stringify(result.sourceMap), fsOpts);
              });
        });
  }
}

module.exports = TraceurFilter;
