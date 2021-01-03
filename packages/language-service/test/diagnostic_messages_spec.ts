/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createDiagnostic, DiagnosticMessage} from '../src/diagnostic_messages';

describe('create diagnostic', () => {
  it('should format and create diagnostics correctly', () => {
    const diagnosticMessage: DiagnosticMessage = {
      message: 'Check that %1 contains %2',
      kind: 'Error',
    };

    const diagnostic =
        createDiagnostic({start: 0, end: 1}, diagnosticMessage, 'testCls', 'testMethod');

    expect(diagnostic).toEqual({
      kind: ts.DiagnosticCategory.Error,
      message: 'Check that testCls contains testMethod',
      span: {start: 0, end: 1},
    });
  });
});
