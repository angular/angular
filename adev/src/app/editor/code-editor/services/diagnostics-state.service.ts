/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Service, signal} from '@angular/core';
import {Diagnostic} from '@codemirror/lint';

export interface DiagnosticWithLocation extends Diagnostic {
  lineNumber: number;
  characterPosition: number;
}

@Service()
export class DiagnosticsState {
  private readonly _diagnostics = signal<DiagnosticWithLocation[]>([]);

  readonly diagnostics = this._diagnostics.asReadonly();

  setDiagnostics(diagnostics: DiagnosticWithLocation[]): void {
    this._diagnostics.set(diagnostics);
  }
}
