/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chai = require('chai');
import {parseArguments} from '../lib/cli';

describe('cli: parseArguments', () => {
  it('should show usage with error when supplied with no arguments', () => {
    const {mode, errors} = parseArguments([]);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['No input file specified.']);
  });

  it('should show usage without error when supplied with --help', () => {
    const {mode, errors} = parseArguments(['--help']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, []);
  });

  it('should show usage with error when supplied with none of --out/verify[Dir]', () => {
    const {mode, errors} = parseArguments(['input.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied with both of --out/verify[Dir]', () => {
    const {mode, errors} =
        parseArguments(['--out', 'out.d.ts', '--verifyDir', 'golden.d.ts', 'input.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {mode, errors} = parseArguments(['--out', 'output.d.ts']);
    chai.assert.equal(mode, 'help');
    chai.assert.deepEqual(errors, ['No input file specified.']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {mode, errors} = parseArguments(['--out', 'output.d.ts', 'first.d.ts', 'second.d.ts']);
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

  it('should show usage with error when supplied with --autoDiscoverEntrypoints without --baseDir',
     () => {
       const {mode, errors} =
           parseArguments(['--autoDiscoverEntrypoints', '--outDir', 'something']);
       chai.assert.equal(mode, 'help');
       chai.assert.deepEqual(
           errors, ['--rootDir must be provided with --autoDiscoverEntrypoints.']);
     });

  it('should show usage with error when supplied with --autoDiscoverEntrypoints without --outDir/verifyDir',
     () => {
       const {mode, errors} =
           parseArguments(['--autoDiscoverEntrypoints', '--rootDir', 'something']);
       chai.assert.equal(mode, 'help');
       chai.assert.deepEqual(
           errors, ['--outDir or --verifyDir must be used with --autoDiscoverEntrypoints.']);
     });
});
