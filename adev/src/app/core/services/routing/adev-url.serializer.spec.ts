/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {UrlSerializer} from '@angular/router';
import {AdevUrlSerializer} from './adev-url-serializer';

describe('AdevUrlSerializer', () => {
  let serializer: UrlSerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UrlSerializer,
          useClass: AdevUrlSerializer,
        },
      ],
    });

    serializer = TestBed.inject(UrlSerializer);
  });

  it('should decode encoded forward slash (%2F)', () => {
    // Uppercase hex
    expect(serializer.parse('page%2Fabout').toString()).toBe('/page/about');

    // Lowercase hex
    expect(serializer.parse('page%2fabout').toString()).toBe('/page/about');
  });
});
