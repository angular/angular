/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
import {wrapDiffingPlugin, DiffingBroccoliPlugin, DiffResult} from './diffing-broccoli-plugin';

export class DiffingFunnel implements DiffingBroccoliPlugin {

  constructor(public inputPath: string, public cachePath: string, public options) {}

  rebuild(treeDiff: DiffResult) {

    treeDiff.addedPaths.forEach(changedPath => {
      fs.linkSync(path.join(this.inputPath, changedPath), path.join(this.cachePath, changedPath));
    });

    treeDiff.removedPaths.forEach(removedPath => {
      fs.unlinkSync(path.join(this.cachePath, removedPath));
    });
  }
}

export default wrapDiffingPlugin(DiffingFunnel);
