import helpers from './broccoli-helpers';
import fs = require('fs');
import fse = require('fs-extra');
import path = require('path');
var walkSync = require('walk-sync');
var mapSeries = require('promise-map-series');

interface CacheEntry {
  hash: number;
  inputFiles: string[];
  outputFiles: string[];
  cacheFiles: string[];
}

interface FilterOptions {
  extensions?: string[];
  targetExtension?: string;
  inputEncoding?: string;
  outputEncoding?: string;
}

export default class Filter implements BroccoliTree {
  inputPath: string;
  outputPath: string;
  cachePath: string;

  private extensions: string[];
  private targetExtension: string;
  private inputEncoding: string;
  private outputEncoding: string;
  private canProcessCache: {[key: string]: string} = Object.create(null);
  private _cache: {[key: string]: CacheEntry} = Object.create(null);
  private _cacheIndex: number;

  constructor(public inputTree: BroccoliTree, options?: FilterOptions) {
    ({
      extensions: this.extensions,
      targetExtension: this.targetExtension,
      inputEncoding: this.inputEncoding,
      outputEncoding: this.outputEncoding
    } = options || {});
  }

  rebuild() {
    let srcDir = this.inputPath;
    let destDir = this.outputPath;
    let paths = walkSync(srcDir);
    return mapSeries(paths, (relativePath: string) => {
      if (relativePath.slice(-1) === '/') {
        fse.mkdirpSync(`${destDir}/${relativePath}`);
      } else {
        if (this.canProcessFile(relativePath)) {
          return this.processAndCacheFile(srcDir, destDir, relativePath);
        } else {
          helpers.copySync(`${srcDir}/${relativePath}`, `${destDir}/${relativePath}`);
        }
      }
    });
  }

  cleanup() {}

  canProcessFile(relativePath) { return this.getDestFilePath(relativePath) !== null; }

  getDestFilePath(relativePath) {
    if (!this.extensions) return null;

    let cacheKey: string = relativePath;
    let cache: string = this.canProcessCache[cacheKey];
    if (cache !== undefined) return cache;

    for (let ext of this.extensions) {
      if (relativePath.slice(-ext.length - 1) === `.${ext}`) {
        if (this.targetExtension) {
          relativePath = `${relativePath.slice(0, -ext.length)}${this.targetExtension}`;
        }
        this.canProcessCache[cacheKey] = relativePath;
        return relativePath;
      }
    }
    return this.canProcessCache[cacheKey] = null;
  }

  processAndCacheFile(srcDir, destDir, relativePath) {
    let self = this;
    this._cacheIndex = this._cacheIndex || 0;
    let cacheEntry = this._cache[relativePath];
    if (cacheEntry !== undefined && cacheEntry.hash === hash(cacheEntry.inputFiles)) {
      copyFromCache(cacheEntry);
    } else {
      return Promise.resolve()
          .then(() => this.processFile(srcDir, destDir, relativePath))
          .catch((err) => {
            err = Object(err);
            err.file = relativePath;
            err.treeDir = srcDir;
            throw err;
          })
          .then((cacheInfo) => { copyToCache(cacheInfo); });
    }

    function hash(filePaths) {
      return filePaths.map((filePath) => helpers.hashTree(`${srcDir}/${filePath}`)).join(',');
    }

    function copyFromCache(cacheEntry) {
      for (let i = 0; i < cacheEntry.outputFiles.length; ++i) {
        let cachePath = cacheEntry.cacheFiles[i];
        let filePath = cacheEntry.outputFiles[i];
        let dest = `${destDir}/${filePath}`;
        fse.mkdirpSync(path.dirname(dest));
        helpers.copySync(`${self.cachePath}/${cachePath}`, dest);
      }
    }

    function copyToCache(cacheInfo) {
      let cacheEntry: CacheEntry = {
        hash: NaN,
        inputFiles: (cacheInfo || {}).inputFiles || [relativePath],
        outputFiles: (cacheInfo || {}).outputFiles || [self.getDestFilePath(relativePath)],
        cacheFiles: []
      };

      for (let i = 0; i < cacheEntry.outputFiles.length; ++i) {
        let cacheFile = `${self._cacheIndex++}`;
        cacheEntry.cacheFiles.push(cacheFile);
        helpers.copySync(`${destDir}/${cacheEntry.outputFiles[i]}`,
                         `${self.cachePath}/${cacheFile}`);
      }
      cacheEntry.hash = hash(cacheEntry.inputFiles);
      self._cache[relativePath] = cacheEntry;
    }
  }

  processFile(srcDir, destDir, relativePath) {
    let{inputEncoding = 'utf8', outputEncoding = 'utf8'} = this;

    let contents = fs.readFileSync(`${srcDir}/${relativePath}`, {encoding: inputEncoding});

    return Promise.resolve(this.processString(contents, relativePath))
        .then((outputString) => {
          let outputPath = this.getDestFilePath(relativePath);
          fs.writeFileSync(`${destDir}/${outputPath}`, outputString, {encoding: outputEncoding});
        });
  }

  processString(contents: string, relativePath: string) { return contents; }
}
