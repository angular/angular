/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '../testing';
import {ErrorHandler, provideBrowserGlobalErrorListeners} from '../src/error_handler';
import {isNode, withBody} from '@angular/private/testing';
import {ApplicationRef, Component, destroyPlatform, inject} from '../src/core';
import {bootstrapApplication} from '@angular/platform-browser';

class MockConsole {
  res: any[][] = [];
  error(...s: any[]): void {
    this.res.push(s);
  }
}

function errorToString(error: any) {
  const logger = new MockConsole();
  const errorHandler = new ErrorHandler();
  (errorHandler as any)._console = logger as any;
  errorHandler.handleError(error);
  return logger.res.map((line) => line.map((x) => `${x}`).join('#')).join('\n');
}

describe('ErrorHandler', () => {
  it('should output exception', () => {
    const e = errorToString(new Error('message!'));
    expect(e).toContain('message!');
  });

  it('should correctly handle primitive values', () => {
    expect(errorToString('message')).toBe('ERROR#message');
    expect(errorToString(404)).toBe('ERROR#404');
    expect(errorToString(0)).toBe('ERROR#0');
    expect(errorToString(true)).toBe('ERROR#true');
    expect(errorToString(false)).toBe('ERROR#false');
    expect(errorToString(null)).toBe('ERROR#null');
    expect(errorToString(undefined)).toBe('ERROR#undefined');
  });

  it('installs global error handler once', async () => {
    if (isNode) {
      return;
    }
    // override global.onerror to prevent jasmine report error
    let originalWindowOnError = window.onerror;
    window.onerror = function () {};
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [provideBrowserGlobalErrorListeners(), provideBrowserGlobalErrorListeners()],
    });

    const spy = spyOn(TestBed.inject(ErrorHandler), 'handleError');
    await new Promise((resolve) => {
      setTimeout(() => {
        throw new Error('abc');
      });
      setTimeout(resolve, 1);
    });

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({message: 'abc'}));
    expect(spy.calls.count()).toBe(1);
    window.onerror = originalWindowOnError;
  });

  it('handles error events without error', async () => {
    if (isNode) {
      return;
    }
    // override global.onerror to prevent jasmine report error
    let originalWindowOnError = window.onerror;
    window.onerror = function () {};
    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
      providers: [provideBrowserGlobalErrorListeners()],
    });

    const spy = spyOn(TestBed.inject(ErrorHandler), 'handleError');
    await new Promise((resolve) => {
      setTimeout(() => {
        window.dispatchEvent(new ErrorEvent('error', {message: 'error event without error'}));
      });
      setTimeout(resolve, 1);
    });

    expect(spy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message:
          'An ErrorEvent with no error occurred. See Error.cause for details: error event without error',
      }),
    );
    expect(spy.calls.count()).toBe(1);
    window.onerror = originalWindowOnError;
  });

  it(
    'should not try to inject the `ErrorHandler` lazily once app is destroyed',
    withBody('<app></app>', async () => {
      destroyPlatform();

      let dispatched = false;
      // Prevents Jasmine from reporting an error.
      const originalWindowOnError = window.onerror;
      window.onerror = () => {};

      @Component({
        selector: 'app',
        template: '',
      })
      class App {
        constructor() {
          inject(ApplicationRef).onDestroy(() => {
            // Note: The unit test environment differs from the real browser environment.
            // This is a simple test that ensures that if an error event is dispatched
            // during destruction, it does not attempt to inject the `ErrorHandler`.
            // Before the `if (injector.destroyed)` checks were added, this would
            // throw a "destroyed injector" error.
            dispatched = window.dispatchEvent(new Event('error'));
          });
        }
      }

      await jasmine.spyOnGlobalErrorsAsync(async () => {
        const appRef = await bootstrapApplication(App, {
          providers: [provideBrowserGlobalErrorListeners()],
        });
        appRef.destroy();

        // We assert that `dispatched` is truthy because Angular's error handler
        // calls `preventDefault()` on the event object, which would cause `dispatchEvent`
        // to return false. This assertion ensures that Angular's error handler was not invoked.
        expect(dispatched).toEqual(true);

        // Wait until the error is re-thrown, so we can reset the original error handler.
        await new Promise((resolve) => setTimeout(resolve, 1));
      });

      window.onerror = originalWindowOnError;
      destroyPlatform();
    }),
  );
});
