/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {DiagnosticsState} from './diagnostics-state.service';

describe('DiagnosticsState', () => {
  let service: DiagnosticsState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagnosticsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
