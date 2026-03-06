/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

import {
  activate,
  DIAGNOSTICS_TEST_COMPONENT_URI,
  DIAGNOSTICS_TEST_TEMPLATE_URI,
  getAngularDiagnostics,
} from './helper';

interface ServerCapabilities {
  diagnosticProvider: {
    identifier: string;
    interFileDependencies: boolean;
    workspaceDiagnostics: boolean;
  } | null;
}

describe('Pull-based diagnostics', () => {
  describe('server capabilities', () => {
    it('should advertise pull diagnostics support', async () => {
      const caps = await vscode.commands.executeCommand<ServerCapabilities>(
        'angular.getServerCapabilities',
      );
      expect(caps?.diagnosticProvider).not.toBeNull();
      expect(caps?.diagnosticProvider?.interFileDependencies).toBe(true);
      expect(caps?.diagnosticProvider?.workspaceDiagnostics).toBe(true);
    });
  });

  describe('template diagnostics', () => {
    beforeAll(async () => {
      await activate(DIAGNOSTICS_TEST_TEMPLATE_URI);
    });

    it('should report diagnostics for unknown properties in external templates', () => {
      const diagnostics = getAngularDiagnostics(DIAGNOSTICS_TEST_TEMPLATE_URI);
      expect(diagnostics.length).toBeGreaterThanOrEqual(1);
      const messages = diagnostics.map((d) => d.message);
      expect(messages.some((m) => m.includes('nonExistentProperty'))).toBe(true);
    });

    it('should report diagnostics with correct severity', () => {
      const diagnostics = getAngularDiagnostics(DIAGNOSTICS_TEST_TEMPLATE_URI);
      expect(diagnostics.every((d) => d.severity === vscode.DiagnosticSeverity.Error)).toBe(true);
    });

    it('should report diagnostics with correct source', () => {
      const diagnostics = getAngularDiagnostics(DIAGNOSTICS_TEST_TEMPLATE_URI);
      expect(diagnostics.every((d) => d.source === 'ngtsc')).toBe(true);
    });
  });

  describe('component diagnostics', () => {
    beforeAll(async () => {
      await activate(DIAGNOSTICS_TEST_COMPONENT_URI);
    });

    it('should report no diagnostics for a valid component', () => {
      // The component itself has no errors — only its template does.
      const diagnostics = getAngularDiagnostics(DIAGNOSTICS_TEST_COMPONENT_URI);
      const ngErrors = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Error,
      );
      expect(ngErrors.length).toBe(0);
    });
  });
});
