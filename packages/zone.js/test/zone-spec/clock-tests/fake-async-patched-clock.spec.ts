/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('fake async unpatched clock tests', () => {
  let spy: any;

  beforeEach(() => {
    spy = jasmine.createSpy('timer');
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should check date type correctly', () => {
    const d: any = new Date();
    expect(d instanceof Date).toBe(true);
  });

  it('should get date diff correctly', () => {
    const start = Date.now();
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
  });
  it('should tick correctly', () => {
    const start = Date.now();
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
  });

  it('should mock date correctly', () => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = Date.now();
    expect(start).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = Date.now();
    expect(end - start).toBe(100);
    expect(end).toBe(baseTime.getTime() + 100);
  });

  it('should handle new Date correctly', () => {
    const baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    const start = new Date();
    expect(start.getTime()).toBe(baseTime.getTime());
    jasmine.clock().tick(100);
    const end = new Date();
    expect(end.getTime() - start.getTime()).toBe(100);
    expect(end.getTime()).toBe(baseTime.getTime() + 100);
  });

  it('should handle setTimeout correctly', () => {
    setTimeout(spy, 100);
    expect(spy).not.toHaveBeenCalled();
    jasmine.clock().tick(100);
    expect(spy).toHaveBeenCalled();
  });
})
