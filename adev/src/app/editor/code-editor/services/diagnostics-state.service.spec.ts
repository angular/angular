/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {DiagnosticWithLocation, DiagnosticsState} from './diagnostics-state.service';

describe('DiagnosticsState', () => {
  let service: DiagnosticsState;

  const diagnostic = (message: string): DiagnosticWithLocation => ({
    from: 0,
    to: 1,
    severity: 'error',
    message,
    lineNumber: 1,
    characterPosition: 0,
  });

  beforeEach(() => {
    service = TestBed.inject(DiagnosticsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no diagnostics', () => {
    expect(service.diagnostics()).toEqual([]);
  });

  it('should expose the diagnostics it is given', () => {
    const diagnostics = [diagnostic('first'), diagnostic('second')];

    service.setDiagnostics(diagnostics);

    expect(service.diagnostics()).toEqual(diagnostics);
  });

  it('should replace the previous diagnostics', () => {
    service.setDiagnostics([diagnostic('first')]);
    service.setDiagnostics([]);

    expect(service.diagnostics()).toEqual([]);
  });

  it('should not expose a way to write to the diagnostics signal', () => {
    expect((service.diagnostics as Partial<WritableSignal<unknown>>).set).toBeUndefined();
  });
});
