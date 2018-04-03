/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {async} from '@angular/core/testing';

describe('async', () => {
  let logs:string[] = [];
  beforeEach(() => {
    logs = [];
  });
  it ('should automatically done after all async tasks finished', async(() => {
    setTimeout(() => {
      logs.push('timeout');
    }, 100);
  }, () => {
    expect(logs).toEqual(['timeout']);
  }));

  it ('should automatically done after all sync tasks finished', async(() => {
    logs.push('sync');
  }, () => {
    expect(logs).toEqual(['sync']);
  }));
});