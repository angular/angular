/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_DEBUG_CONTEXT, ERROR_LOGGER, ERROR_TYPE, wrappedError} from '@angular/core/src/util/errors';

import {ErrorHandler} from '../src/error_handler';

class MockConsole {
  res: any[][] = [];
  error(...s: any[]): void {
    this.res.push(s);
  }
}

(function() {
function errorToString(error: any) {
  const logger = new MockConsole();
  const errorHandler = new ErrorHandler();
  (errorHandler as any)._console = logger as any;
  errorHandler.handleError(error);
  return logger.res.map(line => line.map(x => `${x}`).join('#')).join('\n');
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

  describe('context', () => {
    it('should print nested context', () => {
      const cause = new Error('message!');
      const context = {
        source: 'context!',
        toString() {
          return 'Context';
        }
      } as any;
      const original = debugError(cause, context);
      const e = errorToString(wrappedError('message', original));
      expect(e).toEqual(`ERROR#Error: message caused by: Error in context! caused by: message!
ORIGINAL ERROR#Error: message!
ERROR CONTEXT#Context`);
    });
  });

  describe('original exception', () => {
    it('should print original exception message if available (original is Error)', () => {
      const realOriginal = new Error('inner');
      const original = wrappedError('wrapped', realOriginal);
      const e = errorToString(wrappedError('wrappedwrapped', original));
      expect(e).toContain('inner');
    });

    it('should print original exception message if available (original is not Error)', () => {
      const realOriginal = new Error('custom');
      const original = wrappedError('wrapped', realOriginal);
      const e = errorToString(wrappedError('wrappedwrapped', original));
      expect(e).toContain('custom');
    });
  });

  it('should use the error logger on the error', () => {
    const err = new Error('test');
    const console = new MockConsole();
    const errorHandler = new ErrorHandler();
    (errorHandler as any)._console = console as any;
    const logger = jasmine.createSpy('logger');
    (err as any)[ERROR_LOGGER] = logger;

    errorHandler.handleError(err);

    expect(console.res).toEqual([]);
    expect(logger).toHaveBeenCalledWith(console, 'ERROR', err);
  });
});
})();

function debugError(originalError: any, context: any): Error {
  const error = wrappedError(`Error in ${context.source}`, originalError);
  (error as any)[ERROR_DEBUG_CONTEXT] = context;
  (error as any)[ERROR_TYPE] = debugError;
  return error;
}
