/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {VersionManager} from './version-manager.service';

describe('VersionManager', () => {
  let service: VersionManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
