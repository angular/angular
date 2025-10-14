/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
import fs from 'fs';
import {createRequire} from 'module';
import * as p from 'path';
import * as url from 'url';
/**
 * A wrapper around the Node.js file-system that supports path manipulation.
 */
export class NodeJSPathManipulation {
  pwd() {
    return this.normalize(process.cwd());
  }
  chdir(dir) {
    process.chdir(dir);
  }
  resolve(...paths) {
    return this.normalize(p.resolve(...paths));
  }
  dirname(file) {
    return this.normalize(p.dirname(file));
  }
  join(basePath, ...paths) {
    return this.normalize(p.join(basePath, ...paths));
  }
  isRoot(path) {
    return this.dirname(path) === this.normalize(path);
  }
  isRooted(path) {
    return p.isAbsolute(path);
  }
  relative(from, to) {
    return this.normalize(p.relative(from, to));
  }
  basename(filePath, extension) {
    return p.basename(filePath, extension);
  }
  extname(path) {
    return p.extname(path);
  }
  normalize(path) {
    // Convert backslashes to forward slashes
    return path.replace(/\\/g, '/');
  }
}
// G3-ESM-MARKER: G3 uses CommonJS, but externally everything in ESM.
// CommonJS/ESM interop for determining the current file name and containing dir.
const isCommonJS = typeof __filename !== 'undefined';
const currentFileUrl = isCommonJS ? null : import.meta.url;
// Note, when this code loads in the browser, `url` may be an empty `{}` due to the Closure shims.
const currentFileName = isCommonJS ? __filename : (url.fileURLToPath?.(currentFileUrl) ?? null);
/**
 * A wrapper around the Node.js file-system that supports readonly operations and path manipulation.
 */
export class NodeJSReadonlyFileSystem extends NodeJSPathManipulation {
  _caseSensitive = undefined;
  isCaseSensitive() {
    if (this._caseSensitive === undefined) {
      // Note the use of the real file-system is intentional:
      // `this.exists()` relies upon `isCaseSensitive()` so that would cause an infinite recursion.
      this._caseSensitive =
        currentFileName !== null
          ? !fs.existsSync(this.normalize(toggleCase(currentFileName)))
          : true;
    }
    return this._caseSensitive;
  }
  exists(path) {
    return fs.existsSync(path);
  }
  readFile(path) {
    return fs.readFileSync(path, 'utf8');
  }
  readFileBuffer(path) {
    return fs.readFileSync(path);
  }
  readdir(path) {
    return fs.readdirSync(path);
  }
  lstat(path) {
    return fs.lstatSync(path);
  }
  stat(path) {
    return fs.statSync(path);
  }
  realpath(path) {
    return this.resolve(fs.realpathSync(path));
  }
  getDefaultLibLocation() {
    // G3-ESM-MARKER: G3 uses CommonJS, but externally everything in ESM.
    const requireFn = isCommonJS ? require : createRequire(currentFileUrl);
    return this.resolve(requireFn.resolve('typescript'), '..');
  }
}
/**
 * A wrapper around the Node.js file-system (i.e. the `fs` package).
 */
export class NodeJSFileSystem extends NodeJSReadonlyFileSystem {
  writeFile(path, data, exclusive = false) {
    fs.writeFileSync(path, data, exclusive ? {flag: 'wx'} : undefined);
  }
  removeFile(path) {
    fs.unlinkSync(path);
  }
  symlink(target, path) {
    fs.symlinkSync(target, path);
  }
  copyFile(from, to) {
    fs.copyFileSync(from, to);
  }
  moveFile(from, to) {
    fs.renameSync(from, to);
  }
  ensureDir(path) {
    fs.mkdirSync(path, {recursive: true});
  }
  removeDeep(path) {
    fs.rmdirSync(path, {recursive: true});
  }
}
/**
 * Toggle the case of each character in a string.
 */
function toggleCase(str) {
  return str.replace(/\w/g, (ch) =>
    ch.toUpperCase() === ch ? ch.toLowerCase() : ch.toUpperCase(),
  );
}
//# sourceMappingURL=node_js_file_system.js.map
