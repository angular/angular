/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {resolveDistPath} from '../serve_paths.js';
import {pathExists} from './utils.js';

const preprocessorRoot = path.resolve(import.meta.dirname, '..');

/**
 * `ngp.ts` is a library module — it exports `run` but parses no argv. Invoking it as a CLI exits 0
 * having compiled nothing. Pin every invocation site to a file that really is the CLI.
 */
describe('ngp CLI entry points', () => {
  const USAGE = 'Usage: ngp <project-dir|angular.json|tsconfig.json>';

  const isCli = async (relPath: string) => {
    const abs = path.join(preprocessorRoot, relPath);
    expect(await pathExists(abs))
      .withContext(`${relPath} does not exist`)
      .toBe(true);
    const content = await fs.readFile(abs, 'utf-8');
    return content.includes(USAGE);
  };

  it('main.js is the CLI and ngp.js is not', async () => {
    expect(await isCli('main.js')).toBe(true);
    expect(await isCli('ngp.js')).toBe(false);
  });
});

describe('resolveDistPath', () => {
  // Purely lexical — the function never touches the filesystem, so this need not exist.
  const dist = path.resolve(preprocessorRoot, '.tmp/serve-dist');

  it('strips the query string and fragment', () => {
    expect(resolveDistPath(dist, '/main.js?v=2')).toBe(path.join(dist, 'main.js'));
    expect(resolveDistPath(dist, '/main.js#top')).toBe(path.join(dist, 'main.js'));
    expect(resolveDistPath(dist, '/main.js?a=1#top')).toBe(path.join(dist, 'main.js'));
  });

  it('resolves the root to the dist directory itself', () => {
    expect(resolveDistPath(dist, '/')).toBe(dist);
    expect(resolveDistPath(dist, undefined)).toBe(dist);
  });

  it('percent-decodes the path', () => {
    expect(resolveDistPath(dist, '/my%20asset.png')).toBe(path.join(dist, 'my asset.png'));
  });

  it('clamps dot segments at the dist root', () => {
    for (const url of [
      '/../secret.txt',
      '/..',
      '/sub/../../secret.txt',
      '/./../../secret.txt',
      '//../secret.txt',
      '/%2e%2e/secret.txt',
      '/..%2f..%2fsecret.txt',
    ]) {
      const resolved = resolveDistPath(dist, url);
      const contained =
        resolved === null || resolved === dist || resolved.startsWith(dist + path.sep);
      expect(contained).withContext(`${url} escaped to ${resolved}`).toBe(true);
    }
  });

  it('rejects malformed percent-escapes and NUL bytes', () => {
    expect(resolveDistPath(dist, '/%')).toBeNull();
    expect(resolveDistPath(dist, '/%zz')).toBeNull();
    expect(resolveDistPath(dist, '/a%00.js')).toBeNull();
  });
});
