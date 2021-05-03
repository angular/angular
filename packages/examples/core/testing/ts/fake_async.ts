/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {discardPeriodicTasks, fakeAsync, tick} from '@angular/core/testing';


// #docregion basic
describe('this test', () => {
  it('looks async but is synchronous', <any>fakeAsync((): void => {
       let flag = false;
       setTimeout(() => {
         flag = true;
       }, 100);
       expect(flag).toBe(false);
       tick(50);
       expect(flag).toBe(false);
       tick(50);
       expect(flag).toBe(true);
     }));
});
// #enddocregion

describe('this test', () => {
  it('aborts a periodic timer', <any>fakeAsync((): void => {
       // This timer is scheduled but doesn't need to complete for the
       // test to pass (maybe it's a timeout for some operation).
       // Leaving it will cause the test to fail...
       setInterval(() => {}, 100);

       // Unless we clean it up first.
       discardPeriodicTasks();
     }));
});
