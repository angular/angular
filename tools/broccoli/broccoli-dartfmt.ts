/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';
var spawn = require('child_process').spawn;

function processToPromise(process) {
  return new Promise(function(resolve, reject) {
    process.on('close', function(code) {
      if (code) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}

class DartFormatter implements DiffingBroccoliPlugin {
  private DARTFMT: string;
  private verbose: boolean;

  constructor(public inputPath: string, public cachePath: string, options) {
    if (!options.dartSDK) throw new Error("Missing Dart SDK");
    this.DARTFMT = options.dartSDK.DARTFMT;
    this.verbose = options.logs.dartfmt;
  }

  rebuild(treeDiff: DiffResult): Promise<any> {
    let args = ['-w'];
    treeDiff.changedPaths.forEach((changedFile) => {
      let sourcePath = path.join(this.inputPath, changedFile);
      let destPath = path.join(this.cachePath, changedFile);
      if (/\.dart$/.test(changedFile)) args.push(destPath);
      fse.copySync(sourcePath, destPath);
    });
    treeDiff.removedPaths.forEach((removedFile) => {
      let destPath = path.join(this.cachePath, removedFile);
      fse.removeSync(destPath);
    });
    return processToPromise(spawn(
        this.DARTFMT, args, {stdio: this.verbose ? 'inherit' : ['ignore', 'ignore', 'inherit']}));
  }
}

export default wrapDiffingPlugin(DartFormatter);
