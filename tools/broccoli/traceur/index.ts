/// <reference path="../../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from '../diffing-broccoli-plugin';

let traceur = require('../../../../tools/transpiler');
let xtend = require('xtend');


class DiffingTraceurCompiler implements DiffingBroccoliPlugin {
  constructor(public inputPath: string, public cachePath: string, public options) {}

  static includeExtensions = ['.js', '.cjs'];

  rebuild(treeDiff: DiffResult) {
    treeDiff.addedPaths.concat(treeDiff.changedPaths)
        .forEach((changedFilePath) => {
          var traceurOpts = xtend({filename: changedFilePath}, this.options.traceurOptions);

          var fsOpts = {encoding: 'utf-8'};
          var absoluteInputFilePath = path.join(this.inputPath, changedFilePath);
          var sourcecode = fs.readFileSync(absoluteInputFilePath, fsOpts);

          var result = traceur.compile(traceurOpts, changedFilePath, sourcecode);

          // TODO: we should fix the sourceMappingURL written by Traceur instead of overriding
          // (but we might switch to typescript first)
          var mapFilepath =
              changedFilePath.replace(/\.\w+$/, '') + this.options.destSourceMapExtension;
          result.js = result.js + '\n//# sourceMappingURL=./' + path.basename(mapFilepath);

          var destFilepath = changedFilePath.replace(/\.\w+$/, this.options.destExtension);
          var destFile = path.join(this.cachePath, destFilepath);
          fse.mkdirsSync(path.dirname(destFile));
          fs.writeFileSync(destFile, result.js, fsOpts);

          var destMap = path.join(this.cachePath, mapFilepath);
          result.sourceMap.file = destFilepath;
          fs.writeFileSync(destMap, JSON.stringify(result.sourceMap), fsOpts);
        });

    treeDiff.removedPaths.forEach((removedFilePath) => {
      var destFilepath = removedFilePath.replace(/\.\w+$/, this.options.destExtension);
      var absoluteOuputFilePath = path.join(this.cachePath, destFilepath);
      fs.unlinkSync(absoluteOuputFilePath);
    });
  }
}

let transpileWithTraceur = wrapDiffingPlugin(DiffingTraceurCompiler);
let TRACEUR_RUNTIME_PATH = traceur.RUNTIME_PATH;

export {transpileWithTraceur as default, TRACEUR_RUNTIME_PATH};
