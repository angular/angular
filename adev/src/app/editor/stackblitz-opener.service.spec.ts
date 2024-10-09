/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {StackBlitzOpener} from './stackblitz-opener.service';

describe('StackBlitzOpener', () => {
  let service: StackBlitzOpener;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StackBlitzOpener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
