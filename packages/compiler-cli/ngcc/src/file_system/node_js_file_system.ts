/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import {cp, mkdir, mv} from 'shelljs';
import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {FileSystem} from './file_system';

/**
 * A wrapper around the Node.js file-system (i.e the `fs` package).
 */
export class NodeJSFileSystem implements FileSystem {
  exists(path: AbsoluteFsPath): boolean { return fs.existsSync(path.toString()); }
  readFile(path: AbsoluteFsPath): string { return fs.readFileSync(path.toString(), 'utf8'); }
  writeFile(path: AbsoluteFsPath, data: string): void {
    return fs.writeFileSync(path.toString(), data, 'utf8');
  }
  readdir(path: AbsoluteFsPath): PathSegment[] {
    return fs.readdirSync(path.toString()).map(p => PathSegment.fromFsPath(p));
  }
  lstat(path: AbsoluteFsPath): fs.Stats { return fs.lstatSync(path.toString()); }
  stat(path: AbsoluteFsPath): fs.Stats { return fs.statSync(path.toString()); }
  pwd() { return AbsoluteFsPath.from(process.cwd()); }
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void { cp(from.toString(), to.toString()); }
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void { mv(from.toString(), to.toString()); }
  ensureDir(path: AbsoluteFsPath): void { mkdir('-p', path.toString()); }
}
