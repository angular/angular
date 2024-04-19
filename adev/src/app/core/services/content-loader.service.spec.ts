/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ContentLoader} from './content-loader.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ContentLoader', () => {
  let service: ContentLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentLoader],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ContentLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
