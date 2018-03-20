/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.resolve(path.join('packages', 'bazel', 'test', 'ng_package'));

function listDirectories(p: string, depth = 0) {
  const result: string[] = [];
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(f => {
      result.push(
          '  '.repeat(depth) + path.join(p, f), ...listDirectories(path.join(p, f), depth + 1));
    });
  }
  return result;
}

function catFiles(p: string) {
  const result: string[] = [];
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(dir => { result.push(...catFiles(path.join(p, dir))); });
  } else {
    result.push(`--- ${p} ---`, '', fs.readFileSync(p, 'utf-8'), '');
  }
  return result;
}

const goldenFile = path.join(TEST_DIR, 'example_package.golden');
process.chdir(path.join(TEST_DIR, 'example/npm_package'));
const actual = [...listDirectories('.'), ...catFiles('.')].join('\n').replace(
    /bazel-out\/.*\/bin/g, 'bazel-bin');
const expected = fs.readFileSync(goldenFile, 'utf-8');

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === '--accept') {
    fs.writeFileSync(require.resolve(goldenFile), actual, 'utf-8');
  }
} else {
  describe('example ng_package', () => {
    it('should match golden file', () => {
      if (actual === expected) {
        return;
      }
      fail(`example ng_package differs from golden file
    
    Accept the new golden file:
      bazel run ${process.env['BAZEL_TARGET']}.accept
      `);
    });
  });
}
