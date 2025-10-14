/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
/**
 * Convert ts.Diagnostic to lsp.Diagnostic
 * @param tsDiag TS diagnostic
 * @param scriptInfo Used to compute proper offset.
 */
export declare function tsDiagnosticToLspDiagnostic(tsDiag: ts.Diagnostic, projectService: ts.server.ProjectService): lsp.Diagnostic;
