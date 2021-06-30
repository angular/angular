/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthService, MockTokenService } from '../model/auth.service';

import { AuthComponent } from './auth.component';

let fixture: ComponentFixture<AuthComponent>;

// #docregion wrap
describe('AuthComponent', () => {
  // Wrap `fakeAsync()` to add `beforeEach()` and `afterEach()` hooks.
  // In the `beforeEach()` hook, creating the fixture and call `detectChanges()`
  // to render for the first time.
  // In the `afterEach()` hook, destroy the fixture to clear the async timer.
  // Both `beforeEach()` and `afterEach()` runs in the same `fakeAsync()` scope
  // with the test body `it()`.

  const fakeAsyncWithFixture = fakeAsync.wrap({
    beforeEach: () => {
      const tokenService = new MockTokenService();
      const authService = new AuthService(tokenService);
      fixture = TestBed.configureTestingModule({
        declarations: [ AuthComponent ],
        providers: [{provide: AuthService, useValue: authService}],
      }).createComponent(AuthComponent);
      fixture.componentInstance.user = 'user1';
      fixture.detectChanges();
    },
    afterEach: () => fixture.destroy()
  });

  it('shouldWork1 should work correctly', fakeAsyncWithFixture(() => {
    fixture.componentInstance.doSomeWork1();
    tick();
    expect(fixture.componentInstance.result).toBe(undefined);
    tick(1000);
    expect(fixture.componentInstance.result).toEqual('work1 done after auth with token user1 token');
  }));

  it('shouldWork2 should work correctly', fakeAsyncWithFixture(() => {
    fixture.componentInstance.doSomeWork2();
    tick();
    expect(fixture.componentInstance.result).toBe(undefined);
    tick(1000);
    expect(fixture.componentInstance.result).toEqual('work2 done after auth with token user1 token');
  }));

  describe('increase with token', () => {
    const fakeAsyncNested = fakeAsyncWithFixture.wrap({
      beforeEach: () => {
        fixture.componentInstance.reset();
      },
      afterEach: () => {
        fixture.componentInstance.stop();
        fixture.componentInstance.reset();
      }
    });

    it('start should increase the counter with token', fakeAsyncNested(() => {
      expect(fixture.componentInstance.token).toBe(undefined);
      fixture.componentInstance.start();
      tick(1200);
      expect(fixture.componentInstance.token).toBe('user1 token');
      expect(fixture.componentInstance.counter).toBe(2);
    }));
  });
  // #enddocregion wrap
});
