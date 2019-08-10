/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as path from 'path';

export function writeFile(absolutePath: string, contents: string | Buffer) {
  ensureDir(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, contents);
}

export function ensureDir(absolutePath: string): void {
  const parents: string[] = [];
  while (!isRoot(absolutePath) && !fs.existsSync(absolutePath)) {
    parents.push(absolutePath);
    absolutePath = path.dirname(absolutePath);
  }
  while (parents.length) {
    fs.mkdirSync(parents.pop() !);
  }
}

export function isRoot(absolutePath: string): boolean {
  return path.dirname(absolutePath) === absolutePath;
}