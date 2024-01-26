/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ErrorType, NodeRuntimeState} from './node-runtime-state.service';
import {OUT_OF_MEMORY_MSG} from './node-runtime-sandbox.service';

describe('NodeRuntimeState', () => {
  let service: NodeRuntimeState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodeRuntimeState],
    });
    service = TestBed.inject(NodeRuntimeState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set cookies error type based on error message', () => {
    service.setError({message: 'service worker', type: undefined});

    expect(service['error']()!.type).toBe(ErrorType.COOKIES);
  });

  it('should set out of memory error type based on error message', () => {
    service.setError({message: OUT_OF_MEMORY_MSG, type: undefined});
    expect(service['error']()!.type).toBe(ErrorType.OUT_OF_MEMORY);
  });

  it('should set unknown error type based on error message', () => {
    service.setError({message: 'something else', type: undefined});
    expect(service['error']()!.type).toBe(ErrorType.UNKNOWN);
  });

  it('should set unknown error type if error message is undefined', () => {
    service.setError({message: undefined, type: undefined});
    expect(service['error']()!.type).toBe(ErrorType.UNKNOWN);
  });
});
