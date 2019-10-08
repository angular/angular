/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
  static readFile(absolutePath: string): string { return fs.readFileSync(absolutePath, 'utf8'); }

  static readFileBuffer(absolutePath: string): Buffer { return fs.readFileSync(absolutePath); }

  static writeFile(absolutePath: string, contents: string|Buffer) {
    FileUtils.ensureDir(path.dirname(absolutePath));
    fs.writeFileSync(absolutePath, contents);
  }

  static ensureDir(absolutePath: string): void {
    const parents: string[] = [];
    while (!FileUtils.isRoot(absolutePath) && !fs.existsSync(absolutePath)) {
      parents.push(absolutePath);
      absolutePath = path.dirname(absolutePath);
    }
    while (parents.length) {
      fs.mkdirSync(parents.pop() !);
    }
  }

  static remove(p: string): void {
    const stat = fs.statSync(p);
    if (stat.isFile()) {
      fs.unlinkSync(p);
    } else if (stat.isDirectory()) {
      fs.readdirSync(p).forEach(child => {
        const absChild = path.resolve(p, child);
        FileUtils.remove(absChild);
      });
      fs.rmdirSync(p);
    }
  }

  static isRoot(absolutePath: string): boolean {
    return path.dirname(absolutePath) === absolutePath;
  }
}
