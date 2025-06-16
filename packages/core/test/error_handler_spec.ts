/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '../testing';
import {ErrorHandler, provideBrowserGlobalErrorListeners} from '../src/error_handler';
import {isNode} from '@angular/private/testing';

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
});
