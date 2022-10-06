/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as fs from 'fs';
import module from 'module';
import * as p from 'path';
import {fileURLToPath} from 'url';

import {AbsoluteFsPath, FileStats, FileSystem, PathManipulation, PathSegment, PathString, ReadonlyFileSystem} from './types';

/**
 * A wrapper around the Node.js file-system that supports path manipulation.
 */
export class NodeJSPathManipulation implements PathManipulation {
  pwd(): AbsoluteFsPath {
    return this.normalize(process.cwd()) as AbsoluteFsPath;
  }
  chdir(dir: AbsoluteFsPath): void {
    process.chdir(dir);
  }
  resolve(...paths: string[]): AbsoluteFsPath {
    return this.normalize(p.resolve(...paths)) as AbsoluteFsPath;
  }

  dirname<T extends string>(file: T): T {
    return this.normalize(p.dirname(file)) as T;
  }
  join<T extends string>(basePath: T, ...paths: string[]): T {
    return this.normalize(p.join(basePath, ...paths)) as T;
  }
  isRoot(path: AbsoluteFsPath): boolean {
    return this.dirname(path) === this.normalize(path);
  }
  isRooted(path: string): boolean {
    return p.isAbsolute(path);
  }
  relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath {
    return this.normalize(p.relative(from, to)) as PathSegment | AbsoluteFsPath;
  }
  basename(filePath: string, extension?: string): PathSegment {
    return p.basename(filePath, extension) as PathSegment;
  }
  extname(path: AbsoluteFsPath|PathSegment): string {
    return p.extname(path);
  }
  normalize<T extends string>(path: T): T {
    // Convert backslashes to forward slashes
    return path.replace(/\\/g, '/') as T;
  }
}

// CommonJS/ESM interop for determining the current file name and containing
// directory. These paths are needed for detecting whether the file system
// is case sensitive, or for finding the TypeScript default libraries.
// TODO(devversion): Simplify this in the future if devmode uses ESM as well.
const isCommonJS = typeof __filename !== 'undefined';
const currentFileUrl = isCommonJS ? null : __ESM_IMPORT_META_URL__;
const currentFileName = isCommonJS ? __filename : fileURLToPath(currentFileUrl!);

/**
 * A wrapper around the Node.js file-system that supports readonly operations and path manipulation.
 */
export class NodeJSReadonlyFileSystem extends NodeJSPathManipulation implements ReadonlyFileSystem {
  private _caseSensitive: boolean|undefined = undefined;
  isCaseSensitive(): boolean {
    if (this._caseSensitive === undefined) {
      // Note the use of the real file-system is intentional:
      // `this.exists()` relies upon `isCaseSensitive()` so that would cause an infinite recursion.
      this._caseSensitive = !fs.existsSync(this.normalize(toggleCase(currentFileName)));
    }
    return this._caseSensitive;
  }
  exists(path: AbsoluteFsPath): boolean {
    return fs.existsSync(path);
  }
  readFile(path: AbsoluteFsPath): string {
    return fs.readFileSync(path, 'utf8');
  }
  readFileBuffer(path: AbsoluteFsPath): Uint8Array {
    return fs.readFileSync(path);
  }
  readdir(path: AbsoluteFsPath): PathSegment[] {
    return fs.readdirSync(path) as PathSegment[];
  }
  lstat(path: AbsoluteFsPath): FileStats {
    return fs.lstatSync(path);
  }
  stat(path: AbsoluteFsPath): FileStats {
    return fs.statSync(path);
  }
  realpath(path: AbsoluteFsPath): AbsoluteFsPath {
    return this.resolve(fs.realpathSync(path));
  }
  getDefaultLibLocation(): AbsoluteFsPath {
    // TODO(devversion): Once devmode output uses ESM, we can simplify this.
    const requireFn = isCommonJS ? require : module.createRequire(currentFileUrl!);
    return this.resolve(requireFn.resolve('typescript'), '..');
  }
}

/**
 * A wrapper around the Node.js file-system (i.e. the `fs` package).
 */
export class NodeJSFileSystem extends NodeJSReadonlyFileSystem implements FileSystem {
  writeFile(path: AbsoluteFsPath, data: string|Uint8Array, exclusive: boolean = false): void {
    fs.writeFileSync(path, data, exclusive ? {flag: 'wx'} : undefined);
  }
  removeFile(path: AbsoluteFsPath): void {
    fs.unlinkSync(path);
  }
  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void {
    fs.symlinkSync(target, path);
  }
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    fs.copyFileSync(from, to);
  }
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    fs.renameSync(from, to);
  }
  ensureDir(path: AbsoluteFsPath): void {
    fs.mkdirSync(path, {recursive: true});
  }
  removeDeep(path: AbsoluteFsPath): void {
    fs.rmdirSync(path, {recursive: true});
  }
}

/**
 * Toggle the case of each character in a string.
 */
function toggleCase(str: string): string {
  return str.replace(/\w/g, ch => ch.toUpperCase() === ch ? ch.toLowerCase() : ch.toUpperCase());
}
