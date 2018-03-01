/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chai = require('chai');
import * as ts from 'typescript';
import {parseArguments, generateFileNamePairs} from '../lib/cli';


describe('cli: parseArguments', () => {
  it('should show usage with error when supplied with no arguments', () => {
    const {argv, mode, errors} = parseArguments([]);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['No input file specified.']);
  });

  it('should show usage without error when supplied with --help', () => {
    const {argv, mode, errors} = parseArguments(['--help']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, []);
  });

  it('should show usage with error when supplied with none of --out/verify[Dir]', () => {
    const {argv, mode, errors} = parseArguments(['input.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied with both of --out/verify[Dir]', () => {
    const {argv, mode, errors} =
        parseArguments(['--out', 'out.d.ts', '--verifyDir', 'golden.d.ts', 'input.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {argv, mode, errors} = parseArguments(['--out', 'output.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['No input file specified.']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {argv, mode, errors} =
        parseArguments(['--out', 'output.d.ts', 'first.d.ts', 'second.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['More than one input specified. Use --outDir instead.']);
  });

  it('should use out mode when supplied with --out', () => {
    const {argv, mode, errors} = parseArguments(['--out', 'out.d.ts', 'input.d.ts']);
    chai.assert.equal(argv['out'], 'out.d.ts');
    chai.assert.deepEqual(argv._, ['input.d.ts']);
    chai.assert.equal(mode, 'out');
    chai.assert.deepEqual(errors, []);
  });

  it('should use verify mode when supplied with --verify', () => {
    const {argv, mode, errors} = parseArguments(['--verify', 'out.d.ts', 'input.d.ts']);
    chai.assert.equal(argv['verify'], 'out.d.ts');
    chai.assert.deepEqual(argv._, ['input.d.ts']);
    chai.assert.equal(mode, 'verify');
    chai.assert.deepEqual(errors, []);
  });
});

describe('cli: generateFileNamePairs', () => {
  it('should generate one file pair in one-file mode', () => {
    chai.assert.deepEqual(
        generateFileNamePairs({_: ['input.d.ts'], out: 'output.d.ts'}, 'out'),
        [{entrypoint: 'input.d.ts', goldenFile: 'output.d.ts'}]);
  });

  it('should generate file pairs in multi-file mode according to current directory', () => {
    chai.assert.deepEqual(
        generateFileNamePairs({_: ['src/first.d.ts', 'src/second.d.ts'], outDir: 'bank'}, 'out'), [
          {entrypoint: 'src/first.d.ts', goldenFile: 'bank/src/first.d.ts'},
          {entrypoint: 'src/second.d.ts', goldenFile: 'bank/src/second.d.ts'}
        ]);
  });

  it('should generate file pairs according to rootDir if provided', () => {
    chai.assert.deepEqual(
        generateFileNamePairs(
            {_: ['src/first.d.ts', 'src/second.d.ts'], outDir: 'bank', rootDir: 'src'}, 'out'),
        [
          {entrypoint: 'src/first.d.ts', goldenFile: 'bank/first.d.ts'},
          {entrypoint: 'src/second.d.ts', goldenFile: 'bank/second.d.ts'}
        ]);
  });
});
