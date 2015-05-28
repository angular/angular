/// <reference path="../typings/node/node.d.ts" />

import fs = require('fs');
import path = require('path');
let minimatch = require('minimatch');


function tryStatSync(path) {
  try {
    return fs.statSync(path);
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}


export class TreeDiffer {
  private fingerprints: {[key: string]: string} = Object.create(null);
  private nextFingerprints: {[key: string]: string} = Object.create(null);
  private rootDirName: string;
  private include: RegExp = null;
  private exclude: RegExp = null;

  constructor(private label: string, private rootPath: string, includeExtensions?: string[],
              excludeExtensions?: string[], private includes?: string[],
              private excludes?: string[], private files? : string[]) {
    if (this.files && (this.include || this.includes || this.exclude || this.excludes)) {
      throw new Error(
        "Mixing 'files' filter with 'includes' or 'excludes' filters is not supported");
    }

    this.rootDirName = path.basename(rootPath);

    let buildRegexp = (arr) => new RegExp(`(${arr.reduce(combine, "")})$`, "i");

    this.include = (includeExtensions || []).length ? buildRegexp(includeExtensions) : null;
    this.exclude = (excludeExtensions || []).length ? buildRegexp(excludeExtensions) : null;

    function combine(prev, curr) {
      if (curr.charAt(0) !== ".") {
        throw new Error(`Extension must begin with '.'. Was: '${curr}'`);
      }
      let kSpecialRegexpChars = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
      curr = '(' + curr.replace(kSpecialRegexpChars, '\\$&') + ')';
      return prev ? (prev + '|' + curr) : curr;
    }
  }


  public diffTree(): DiffResult {
    let result = new DirtyCheckingDiffResult(this.label, this.rootDirName);
    this.dirtyCheckPath(this.rootPath, result);
    this.detectDeletionsAndUpdateFingerprints(result);
    result.endTime = Date.now();
    return result;
  }


  private dirtyCheckPath(rootDir: string, result: DirtyCheckingDiffResult) {
    fs.readdirSync(rootDir).forEach((segment) => {
      let absolutePath = path.join(rootDir, segment);
      let pathStat = fs.lstatSync(absolutePath);
      if (pathStat.isSymbolicLink()) {
        pathStat = tryStatSync(absolutePath);
        if (pathStat === null) return;
      }

      if (pathStat.isDirectory()) {
        result.directoriesChecked++;
        this.dirtyCheckPath(absolutePath, result);
      } else {
        if (this.passesIncludeExcludeFilters(absolutePath)) {
          result.filesChecked++;
          if (this.isFileDirty(absolutePath, pathStat)) {
            result.changedPaths.push(path.relative(this.rootPath, absolutePath));
          }
        }
      }
    });

    return result;
  }


  private isFileDirty(path: string, stat: fs.Stats): boolean {
    let oldFingerprint = this.fingerprints[path];
    let newFingerprint = `${stat.mtime.getTime()} # ${stat.size}`;

    this.nextFingerprints[path] = newFingerprint;

    if (oldFingerprint) {
      this.fingerprints[path] = null;

      if (oldFingerprint === newFingerprint) {
        // nothing changed
        return false;
      }
    }

    return true;
  }


  private detectDeletionsAndUpdateFingerprints(result: DiffResult) {
    for (let absolutePath in this.fingerprints) {
      if (this.fingerprints[absolutePath] !== null) {
        let relativePath = path.relative(this.rootPath, absolutePath);
        result.removedPaths.push(relativePath);
      }
    }

    this.fingerprints = this.nextFingerprints;
    this.nextFingerprints = Object.create(null);
  }


  private passesIncludeExcludeFilters(absolutePath: string) {
    if (this.files) {
      for (let file of this.files) {
        if (path.join(this.rootPath, file) === absolutePath) {
          return true;
        }
      }
      return false;
    }

    if (this.include && !absolutePath.match(this.include)) return false;
    if (this.includes) {
      for (let glob of this.includes) {
        if (!minimatch(absolutePath, glob)) return false;
      }
    }
    if (this.exclude && absolutePath.match(this.exclude)) return false;
    if (this.excludes) {
      for (let glob of this.excludes) {
        if (minimatch(absolutePath, glob)) return false;
      }
    }

    return  true;
  }
}


export interface DiffResult {
  changedPaths: string[];
  removedPaths: string[];
  log(verbose: boolean): void;
  toString(): string;
}


class DirtyCheckingDiffResult {
  public filesChecked: number = 0;
  public directoriesChecked: number = 0;
  public changedPaths: string[] = [];
  public removedPaths: string[] = [];
  public startTime: number = Date.now();
  public endTime: number = null;

  constructor(public label:string, public directoryName: string) {}

  toString() {
    return `${pad(this.label, 30)}, ${pad(this.endTime - this.startTime, 5)}ms, ` +
           `${pad(this.changedPaths.length + this.removedPaths.length, 5)} changes ` +
           `(files: ${pad(this.filesChecked, 5)}, dirs: ${pad(this.directoriesChecked, 4)})`;
  }

  log(verbose) {
    let prefixedPaths =
        this.changedPaths.map((p) => `* ${p}`).concat(this.removedPaths.map((p) => `- ${p}`));
    console.log(`Tree diff: ${this}` + ((verbose && prefixedPaths.length) ?
                                             ` [\n  ${prefixedPaths.join('\n  ')}\n]` :
                                             ''));
  }
}


function pad(value, length) {
  value = '' + value;
  let whitespaceLength = (value.length < length) ? length - value.length : 0;
  whitespaceLength = whitespaceLength + 1;
  return new Array(whitespaceLength).join(' ') + value;
}
