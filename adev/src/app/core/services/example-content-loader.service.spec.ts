/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ExampleContentLoader} from './example-content-loader.service';
import {PREVIEWS_COMPONENTS} from '@angular/docs';

describe('ExampleContentLoader', () => {
  let service: ExampleContentLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExampleContentLoader, {provide: PREVIEWS_COMPONENTS, useValue: []}],
    });
    service = TestBed.inject(ExampleContentLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
