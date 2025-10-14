'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
const cmdline_utils_1 = require('../cmdline_utils');
describe('parseCommandLine', () => {
  it('should parse "help"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--help']);
    expect(options.help).toBe(true);
  });
  it('should parse "logFile"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--logFile', 'foo.log']);
    expect(options.logFile).toBe('foo.log');
  });
  it('should parse "logVerbosity"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--logVerbosity', 'normal']);
    expect(options.logVerbosity).toBe('normal');
  });
  it('should parse "ngProbeLocations"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--ngProbeLocations', '/foo,/bar']);
    expect(options.ngProbeLocations).toEqual(['/foo', '/bar']);
  });
  it('should parse "tsProbeLocations"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--tsProbeLocations', '/baz,/qux']);
    expect(options.tsProbeLocations).toEqual(['/baz', '/qux']);
  });
  it('should parse without "includeCompletionsForModuleExports"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)(['--tsProbeLocations', '/baz,/qux']);
    expect(options.includeCompletionsForModuleExports).toEqual(true);
  });
  it('should parse with "--includeCompletionsForModuleExports --help"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)([
      '--includeCompletionsForModuleExports',
      '--help',
    ]);
    expect(options.includeCompletionsForModuleExports).toEqual(true);
  });
  it('should parse with "--includeCompletionsForModuleExports true --help"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)([
      '--includeCompletionsForModuleExports',
      'true',
      '--help',
    ]);
    expect(options.includeCompletionsForModuleExports).toEqual(true);
  });
  it('should parse with "--includeCompletionsForModuleExports false --help"', () => {
    const options = (0, cmdline_utils_1.parseCommandLine)([
      '--includeCompletionsForModuleExports',
      'false',
      '--help',
    ]);
    expect(options.includeCompletionsForModuleExports).toEqual(false);
  });
});
//# sourceMappingURL=cmdline_utils_spec.js.map
