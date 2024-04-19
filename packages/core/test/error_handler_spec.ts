/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorHandler} from '../src/error_handler';
import {wrappedError} from '../src/util/errors';

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
});
