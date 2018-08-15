/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chai = require('chai');
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {assertFileEqual, unlinkRecursively} from './helpers';

const BINARY_PATH = require.resolve('../ts-api-guardian/bin/ts-api-guardian');

describe('cli: e2e test', () => {
  const outDir = path.join(process.env['TEST_TMPDIR'], 'tmp');

  beforeEach(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  });

  afterEach(() => {
    unlinkRecursively(outDir);
  });

  it('should print usage without any argument', () => {
    const {stderr} = execute([]);
    chai.assert.match(stderr, /Usage/);
  });

  it('should show help message with --help', () => {
    const {stdout} = execute(['--help']);
    chai.assert.match(stdout, /Usage/);
  });

  it('should generate golden file with --out', () => {
    const simpleFile = path.join(outDir, 'simple.d.ts');
    const {status, stderr} = execute(['--out', simpleFile, 'test/fixtures/simple.d.ts']);
    chai.assert.equal(status, 0, stderr);
    assertFileEqual(simpleFile, 'test/fixtures/simple_expected.d.ts');
  });

  it('should verify golden file with --verify and exit cleanly on no difference', () => {
    const {stdout, status} =
        execute(['--verify', 'test/fixtures/simple_expected.d.ts', 'test/fixtures/simple.d.ts']);
    chai.assert.equal(stdout, '');
    chai.assert.equal(status, 0);
  });

  it('should verify golden file with --verify and exit with error on difference', () => {
    const {stdout, status} = execute(
        ['--verify', 'test/fixtures/verify_expected.d.ts', 'test/fixtures/verify_entrypoint.d.ts']);
    chai.assert.equal(stdout, fs.readFileSync('test/fixtures/verify.patch').toString());
    chai.assert.equal(status, 1);
  });

  it('should generate multiple golden files with --outDir and --rootDir', () => {
    const {status} = execute([
      '--outDir', outDir, '--rootDir', 'test/fixtures', 'test/fixtures/simple.d.ts',
      'test/fixtures/sorting.d.ts'
    ]);
    chai.assert.equal(status, 0);
    assertFileEqual(path.join(outDir, 'simple.d.ts'), 'test/fixtures/simple_expected.d.ts');
    assertFileEqual(path.join(outDir, 'sorting.d.ts'), 'test/fixtures/sorting_expected.d.ts');
  });

  it('should verify multiple golden files with --verifyDir and --rootDir', () => {
    copyFile('test/fixtures/simple_expected.d.ts', path.join(outDir, 'simple.d.ts'));
    copyFile('test/fixtures/sorting_expected.d.ts', path.join(outDir, 'sorting.d.ts'));
    const {stdout, status} = execute([
      '--verifyDir', outDir, '--rootDir', 'test/fixtures', 'test/fixtures/simple.d.ts',
      'test/fixtures/sorting.d.ts'
    ]);
    chai.assert.equal(stdout, '');
    chai.assert.equal(status, 0);
  });

  it('should generate respecting --stripExportPattern', () => {
    const {status} = execute([
      '--out', path.join(outDir, 'underscored.d.ts'), '--stripExportPattern', '^__.*',
      'test/fixtures/underscored.d.ts'
    ]);
    chai.assert.equal(status, 0);
    assertFileEqual(
        path.join(outDir, 'underscored.d.ts'), 'test/fixtures/underscored_expected.d.ts');
  });

  it('should not throw for aliased stripped exports', () => {
    const {status} = execute([
      '--out', path.join(outDir, 'stripped_alias.d.ts'), '--stripExportPattern', '^__.*',
      'test/fixtures/stripped_alias.d.ts'
    ]);
    chai.assert.equal(status, 0);
    assertFileEqual(
        path.join(outDir, 'stripped_alias.d.ts'), 'test/fixtures/stripped_alias_expected.d.ts');
  });

  it('should verify respecting --stripExportPattern', () => {
    const {stdout, status} = execute([
      '--verify', 'test/fixtures/underscored_expected.d.ts', 'test/fixtures/underscored.d.ts',
      '--stripExportPattern', '^__.*'
    ]);
    chai.assert.equal(stdout, '');
    chai.assert.equal(status, 0);
  });

  it('should respect --allowModuleIdentifiers', () => {
    const {stdout, status} = execute([
      '--verify', 'test/fixtures/module_identifier_expected.d.ts', '--allowModuleIdentifiers',
      'foo', 'test/fixtures/module_identifier.d.ts'
    ]);
    chai.assert.equal(stdout, '');
    chai.assert.equal(status, 0);
  });
});

function copyFile(sourceFile: string, targetFile: string) {
  fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
}

function execute(args: string[]): {stdout: string, stderr: string, status: number} {
  // We need to determine the directory that includes the `ts-api-guardian` npm_package that
  // will be used to spawn the CLI binary. This is a workaround because technically we shouldn't
  // spawn a child process that doesn't have the custom NodeJS module resolution for Bazel.
  const nodePath = [
    path.join(require.resolve('npm/node_modules/chalk/package.json'), '../../'),
    path.join(require.resolve('../lib/cli.js'), '../../'),
  ].join(process.platform === 'win32' ? ';' : ':');

  const output = child_process.spawnSync(process.execPath, [BINARY_PATH, ...args], {
    env: {
      'NODE_PATH': nodePath,
    }
  });
  chai.assert(!output.error, 'Child process failed or timed out: ' + output.error);
  chai.assert(!output.signal, `Child process killed by signal ${output.signal}`);

  return {
    stdout: output.stdout.toString(),
    stderr: output.stderr.toString(),
    status: output.status
  };
}
