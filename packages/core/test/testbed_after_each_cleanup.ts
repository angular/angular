/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestBed} from '@angular/core/testing';

describe('reset TestBed TestingModule state on afterEach', () => {
  let destroySpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    destroySpy = spyOn(TestBed, 'resetTestingModule').and.callThrough();
  });

  beforeEach(() => { expect(destroySpy).not.toHaveBeenCalled(); });

  // A test is necessary to include in the describe block to cause the beforeEach, afterEach and
  // afterAll calls to run.
  it('will pass', () => { expect(1).toBe(1); });

  afterAll(() => { expect(destroySpy).toHaveBeenCalled(); });
});
