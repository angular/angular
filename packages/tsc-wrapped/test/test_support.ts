/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const tmpdir = process.env.TEST_TMPDIR || os.tmpdir();

export function writeTempFile(name: string, contents: string): string {
  // TEST_TMPDIR is set by bazel.
  const id = (Math.random() * 1000000).toFixed(0);
  const fn = path.join(tmpdir, `tmp.${id}.${name}`);
  fs.writeFileSync(fn, contents);
  return fn;
}

export function makeTempDir(): string {
  const id = (Math.random() * 1000000).toFixed(0);
  const dir = path.join(tmpdir, `tmp.${id}`);
  fs.mkdirSync(dir);
  return dir;
}
