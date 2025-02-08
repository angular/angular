/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: We uninstall the clock before starting the tests. This is necessary because
// ZoneJS is loaded after Jasmine has captured the global timing functions. Jasmine
// now doesn't allow `clock().install` because Zone modified e.g. `setTimeout`.
// Uninstalling results in Jasmine resetting to the original NodeJS globals.
// This is fine for this test as it doesn't rely on e.g. patched `setTimeout`.
// https://github.com/jasmine/jasmine/blob/169a2a8ad23a7e5cb12be0a2df02ea4337b9811a/src/core/Clock.js#L17.
jasmine.clock().uninstall();

describe('fake async unpatched clock tests', () => {
  const fakeAsync = (Zone as any)[Zone.__symbol__('fakeAsyncTest')].fakeAsync;
  let spy: any;

  beforeEach(() => {
    spy = jasmine.createSpy('timer');
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should check date type correctly', fakeAsync(() => {
    const d: any = new Date();
    expect(d instanceof Date).toBe(true);
  }));

  it('should check date type correctly without fakeAsync', () => {
    const d: any = new Date();
    expect(d instanceof Date).toBe(true);
  });

  it('should tick correctly', fakeAsync(() => {
    jasmine.clock().mockDate();
    const start = Date.now();
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
  }));

  it('should tick correctly without fakeAsync', () => {
    jasmine.clock().mockDate();
    const start = Date.now();
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
  });

  it('should mock date correctly', fakeAsync(() => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = Date.now();
    expect(start).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
    expect(end).toBe(baseTime.getTime() + 100);
    expect(new Date().getFullYear()).toEqual(2013);
  }));

  it('should mock date correctly without fakeAsync', () => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = Date.now();
    expect(start).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
    expect(end).toBe(baseTime.getTime() + 100);
    expect(new Date().getFullYear()).toEqual(2013);
  });

  it('should handle new Date correctly', fakeAsync(() => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = new Date();
    expect(start.getTime()).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = new Date();
    expect(end.getTime() - start.getTime()).toBe(100);
    expect(end.getTime()).toBe(baseTime.getTime() + 100);
  }));

  it('should handle new Date correctly without fakeAsync', () => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = new Date();
    expect(start.getTime()).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = new Date();
    expect(end.getTime() - start.getTime()).toBe(100);
    expect(end.getTime()).toBe(baseTime.getTime() + 100);
  });

  it('should handle setTimeout correctly', fakeAsync(() => {
    setTimeout(spy, 100);
    expect(spy).not.toHaveBeenCalled();
    jasmine.clock().tick(100);
    expect(spy).toHaveBeenCalled();
  }));

  it('should handle setTimeout correctly without fakeAsync', () => {
    setTimeout(spy, 100);
    expect(spy).not.toHaveBeenCalled();
    jasmine.clock().tick(100);
    expect(spy).toHaveBeenCalled();
  });
});
