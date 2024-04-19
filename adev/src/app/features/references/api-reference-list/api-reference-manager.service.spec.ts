/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ApiReferenceManager} from './api-reference-manager.service';
import {LOCAL_STORAGE} from '@angular/docs';

describe('ApiReferenceManager', () => {
  let service: ApiReferenceManager;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LOCAL_STORAGE,
          useValue: localStorageSpy,
        },
      ],
    });
    service = TestBed.inject(ApiReferenceManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
