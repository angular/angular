/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Injector, NgZone} from '@angular/core';
import {NgElementApplicationContext} from '../src/ng-element-application-context';

describe('NgElementApplicationContext', () => {
  let mockInjector: Injector;
  let mockZone: NgZone;
  let ctx: NgElementApplicationContext;

  beforeEach(() => {
    mockZone = new NgZone({});
    mockInjector = Injector.create([
      {provide: ApplicationRef, useValue: 'mockApplicationRef'},
      {provide: NgZone, useValue: mockZone},
    ]);

    ctx = new NgElementApplicationContext(mockInjector);
  });

  it('should expose the `ApplicationRef`',
     () => { expect(ctx.applicationRef as any).toBe('mockApplicationRef'); });

  it('should expose the `Injector`', () => { expect(ctx.injector).toBe(mockInjector); });

  it('should expose the `NgZone`', () => { expect(ctx.ngZone).toBe(mockZone); });

  describe('runInNgZone()', () => {
    it('should always run the callback inside the Angular zone', () => {
      (spyOn(NgZone, 'isInAngularZone').and as any).returnValues(false, true);
      spyOn(mockZone, 'run').and.callThrough();
      const callbackSpy = (jasmine.createSpy('callback').and as any).returnValues('foo', 'bar');

      const retValues = [
        ctx.runInNgZone(callbackSpy),
        ctx.runInNgZone(callbackSpy),
      ];

      expect(mockZone.run).toHaveBeenCalledTimes(2);
      expect(callbackSpy).toHaveBeenCalledTimes(2);
      expect(retValues).toEqual(['foo', 'bar']);
    });
  });
});
