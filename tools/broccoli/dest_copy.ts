/// <reference path="./broccoli-filter.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />

import Filter = require('broccoli-filter');
import fse = require('fs-extra');
import path = require('path');

/**
 * Intercepts each file as it is copied to the destination tempdir,
 * and tees a copy to the given path outside the tmp dir.
 */
class DestCopy extends Filter {
  constructor(private inputTree, private outputRoot: string) { super(inputTree); }

  getDestFilePath(relativePath: string): string { return relativePath; }

  processString(content: string, relativePath: string): string { return content; }

  processFile(srcDir, destDir, relativePath): Promise<any> {
    return super.processFile(srcDir, destDir, relativePath)
        .then(x => {
          var destFile = path.join(this.outputRoot, this.getDestFilePath(relativePath));
          var dir = path.dirname(destFile);
          fse.mkdirsSync(dir);
          fse.copySync(path.join(srcDir, relativePath), destFile);
        });
  }
}

export = function destCopy(inputTree, outputRoot) {
  return new DestCopy(inputTree, outputRoot);
}
