/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseArguments} from '../lib/cli';

describe('cli: parseArguments', () => {
  it('should show usage with error when supplied with no arguments', () => {
    const {mode, errors} = parseArguments([]);
    expect(mode).toBe('help');
    expect(errors).toEqual(['No input file specified.']);
  });

  it('should show usage without error when supplied with --help', () => {
    const {mode, errors} = parseArguments(['--help']);
    expect(mode).toBe('help');
    expect(errors).toEqual([]);
  });

  it('should show usage with error when supplied with none of --out/verify[Dir]', () => {
    const {mode, errors} = parseArguments(['input.d.ts']);
    expect(mode).toBe('help');
    expect(errors).toEqual(['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied with both of --out/verify[Dir]', () => {
    const {mode, errors} =
        parseArguments(['--out', 'out.d.ts', '--verifyDir', 'golden.d.ts', 'input.d.ts']);
    expect(mode).toBe('help');
    expect(errors).toEqual(['Specify either --out[Dir] or --verify[Dir]']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {mode, errors} = parseArguments(['--out', 'output.d.ts']);
    expect(mode).toBe('help');
    expect(errors).toEqual(['No input file specified.']);
  });

  it('should show usage with error when supplied without input file', () => {
    const {mode, errors} = parseArguments(['--out', 'output.d.ts', 'first.d.ts', 'second.d.ts']);
    expect(mode).toBe('help');
    expect(errors).toEqual(['More than one input specified. Use --outDir instead.']);
  });

  it('should use out mode when supplied with --out', () => {
    const {argv, mode, errors} = parseArguments(['--out', 'out.d.ts', 'input.d.ts']);
    expect(argv['out']).toBe('out.d.ts');
    expect(argv._).toEqual(['input.d.ts']);
    expect(mode).toBe('out');
    expect(errors).toEqual([]);
  });

  it('should use verify mode when supplied with --verify', () => {
    const {argv, mode, errors} = parseArguments(['--verify', 'out.d.ts', 'input.d.ts']);
    expect(argv['verify']).toBe('out.d.ts');
    expect(argv._).toEqual(['input.d.ts']);
    expect(mode).toBe('verify');
    expect(errors).toEqual([]);
  });

  it('should show usage with error when supplied with --autoDiscoverEntrypoints without --baseDir',
     () => {
       const {mode, errors} =
           parseArguments(['--autoDiscoverEntrypoints', '--outDir', 'something']);
       expect(mode).toBe('help');
       expect(errors).toEqual(['--rootDir must be provided with --autoDiscoverEntrypoints.']);
     });

  it('should show usage with error when supplied with --autoDiscoverEntrypoints without --outDir/verifyDir',
     () => {
       const {mode, errors} =
           parseArguments(['--autoDiscoverEntrypoints', '--rootDir', 'something']);
       expect(mode).toBe('help');
       expect(errors).toEqual(
           ['--outDir or --verifyDir must be used with --autoDiscoverEntrypoints.']);
     });
});
