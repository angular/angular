/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {Diagnostic} from '@codemirror/lint';
import {BehaviorSubject, distinctUntilChanged} from 'rxjs';

export interface DiagnosticWithLocation extends Diagnostic {
  lineNumber: number;
  characterPosition: number;
}

@Injectable({
  providedIn: 'root',
})
export class DiagnosticsState {
  private readonly _diagnostics$ = new BehaviorSubject<DiagnosticWithLocation[]>([]);

  // TODO: use signals when zoneless will be turned off
  diagnostics$ = this._diagnostics$.asObservable().pipe(distinctUntilChanged());

  setDiagnostics(diagnostics: DiagnosticWithLocation[]): void {
    this._diagnostics$.next(diagnostics);
  }
}
