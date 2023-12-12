/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {DownloadManager} from './download-manager.service';

describe('DownloadManager', () => {
  let service: DownloadManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
