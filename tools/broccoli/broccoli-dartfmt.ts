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
const exec = require('child_process').exec;


const promiseExec = (cmd: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(shortenFormatterOutput(stderr));
        reject('Formatting failed.');
      } else {
        resolve();
      }
    });
  });
};


export default class DartFormatter extends Plugin {
  private DARTFMT: string;
  private cache: {[filePath: string]: CacheEntry} = Object.create(null);

  constructor(inputPaths: any[], options: any) {
    super(inputPaths, options);
    if (!options.dartSDK) throw new Error("Missing Dart SDK");
    this.DARTFMT = options.dartSDK.DARTFMT;
  }

  build(): Promise<any> {
    const dartEntries = this.listEntries().filter(entry => entry.relativePath.match(/\.dart$/));

    const changedEntries: any[] = dartEntries.map(entry => {
      const filePath = entry.relativePath;
      const inputPath = path.join(this.inputPaths[0], filePath);
      const cachePath = path.join(this.cachePath, filePath);

      if (!this.cache[inputPath]) {
        this.cache[inputPath] = { version: entry.mtime };
      } else if (this.cache[inputPath].version >= entry.mtime) {
        // Ignore this, cache is as young as input.
        return;
      }

      fse.copySync(inputPath, cachePath);
    }).filter(x => !!x);

    return Promise.all(
      changedEntries.map(entry => {
        const filePath = entry.relativePath;
        const cachePath = path.join(this.cachePath, filePath);
        return promiseExec(this.DARTFMT + ' ' + cachePath);
      }))
      .then(() => Promise.all(
        Object.keys(this.cache).map(filePath => {
          const cachePath = filePath.replace(this.inputPaths[0], this.cachePath);
          const outputPath = filePath.replace(this.inputPaths[0], this.outputPath);

          return new Promise(resolve => {
            fse.mkdirsSync(path.dirname(outputPath));
            fs.linkSync(cachePath, outputPath);
            resolve();
          });
        })
      ));
  }
}

var ARROW_LINE = /^(\s+)\^+/;
var BEFORE_CHARS = 15;
var stripAnsi = require('strip-ansi');
function shortenFormatterOutput(formatterOutput) {
  var lines = formatterOutput.split('\n');
  var match, line;
  for (var i = 0; i < lines.length; i += 1) {
    line = lines[i];
    if (match = stripAnsi(line).match(ARROW_LINE)) {
      let leadingWhitespace = match[1].length;
      let leadingCodeChars = Math.min(leadingWhitespace, BEFORE_CHARS);
      lines[i] = line.substr(leadingWhitespace - leadingCodeChars);
      lines[i - 1] = lines[i - 1].substr(leadingWhitespace - leadingCodeChars, 80) + '…';
    }
  }
  return lines.join('\n');
}
