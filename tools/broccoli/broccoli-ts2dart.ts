/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="./broccoli.d.ts" />

interface BroccoliCachingWriterPlugin extends BroccoliTree {
  listFiles(): string[];
  listEntries(): any[];
}

interface Constructor {
  new (...args: any[]): BroccoliCachingWriterPlugin;
}

interface CacheEntry {
  version: number;
}


import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');

const Plugin: Constructor = require('broccoli-caching-writer');
import TS2Dart = require('ts2dart');


export default class TSToDartTranspiler  extends Plugin {
  private transpiler: TS2Dart.Transpiler;
  private additionalFiles: string[];
  private basePath: string;
  private cache: {[filePath: string]: CacheEntry} = Object.create(null);

  constructor(inputPaths: any[], public options: any /*ts2dart.TranspilerOptions*/) {
    super(inputPaths, {});

    // Additional files to include in the transpile call. These files could include, e.g.,
    // .d.ts files. They will always be included in the transpile call below, even if they
    // weren't modified.
    this.additionalFiles = options.additionalFiles || [];

    // Delete additionalFiles as the transpiler does not support that option.
    delete options.additionalFiles;

    this.basePath = options.basePath;
    this.transpiler = new TS2Dart.Transpiler(options);
  }

  build(): Promise<any> {
    const inputPath = this.inputPaths[0];
    const basePath = this.basePath || inputPath;
    const getDartFilePath = (path: string) => path.replace(/((\.js)|(\.ts))$/i, '.dart');

    // List all the changed TS files.  The `toEmit` variable will contain the list
    // of relative paths to the basePath of files that have changed.
    // For an initial run this is basically all the files.
    const toEmit = this.listEntries()
      .filter(entry => entry.relativePath.match(/\.ts$/) && !entry.relativePath.match(/\.d\.ts$/))
      .map(entry => {
        const fullPath = path.resolve(inputPath, entry.relativePath);
        const dartInputFilePath = getDartFilePath(fullPath);

        // If a dart file exist, just ignore the TS source.
        if (fs.existsSync(dartInputFilePath)) {
          return;
        }

        if (!this.cache[fullPath]) {
          this.cache[fullPath] = { version: entry.mtime };
        } else if (this.cache[fullPath].version >= entry.mtime) {
          // Do nothing. Cache is as recent as the original input.
          return;
        }
        return path.normalize(fullPath.replace(inputPath, basePath));
      })
      .filter(x => !!x);

    this.transpiler.transpile(this.additionalFiles.concat(toEmit), this.cachePath);

    const dirs: {[p: string]: boolean} = Object.create(null);
    // Make a symbolic link in the output for the cache.
    return Promise.all(
      Object.keys(this.cache).map(filePath => {
        return new Promise(resolve => {
          const cachePath = getDartFilePath(filePath.replace(inputPath, this.cachePath));
          const outputPath = getDartFilePath(filePath.replace(inputPath, this.outputPath));

          const dirPath = path.dirname(outputPath);
          if (!dirs[dirPath]) {
            dirs[dirPath] = true;
            fse.mkdirsSync(path.dirname(outputPath));
          }
          fs.linkSync(cachePath, outputPath);
          resolve();
        });
      })
    );
  }
}
