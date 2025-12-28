/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {extractTsBuildInfoPathFromDiagnostic} from '../../src/build_mode_tsbuildinfo_recovery';

describe('build mode tsbuildinfo recovery', () => {
  it('returns null when diagnostic is unrelated', () => {
    const diag: ts.Diagnostic = {
      category: ts.DiagnosticCategory.Error,
      code: 123,
      file: undefined,
      start: undefined,
      length: undefined,
      messageText: 'Some other error',
    };

    expect(extractTsBuildInfoPathFromDiagnostic(diag)).toBeNull();
  });

  it('extracts quoted tsbuildinfo path from message', () => {
    const diag: ts.Diagnostic = {
      category: ts.DiagnosticCategory.Error,
      code: 5083,
      file: undefined,
      start: undefined,
      length: undefined,
      messageText: "Cannot read file '/tmp/proj/.tsbuildinfo'.",
    };

    expect(extractTsBuildInfoPathFromDiagnostic(diag)).toBe('/tmp/proj/.tsbuildinfo');
  });

  it('prefers diagnostic fileName when it points at a tsbuildinfo file', () => {
    const diag: ts.Diagnostic = {
      category: ts.DiagnosticCategory.Error,
      code: 0,
      file: {fileName: '/tmp/p/.tsbuildinfo'} as unknown as ts.SourceFile,
      start: undefined,
      length: undefined,
      messageText: 'oops',
    };

    expect(extractTsBuildInfoPathFromDiagnostic(diag)).toBe('/tmp/p/.tsbuildinfo');
  });
});
