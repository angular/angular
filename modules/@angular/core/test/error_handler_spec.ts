/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedError} from '@angular/core/src/facade/errors';
import {DebugContext} from '@angular/core/src/linker/debug_context';
import {ViewWrappedError} from '@angular/core/src/linker/errors';

import {ErrorHandler} from '../src/error_handler';

class MockConsole {
  res: any[] = [];
  error(s: any): void { this.res.push(s); }
}

class _CustomException {
  context = 'some context';
  toString(): string { return 'custom'; }
}

export function main() {
  function errorToString(error: any) {
    var logger = new MockConsole();
    var errorHandler = new ErrorHandler(false);
    errorHandler._console = logger as any;
    errorHandler.handleError(error);
    return logger.res.join('\n');
  }

  function getStack(error: Error): string {
    try {
      throw error;
    } catch (e) {
      return e.stack;
    }
  }

  describe('ErrorHandler', () => {
    it('should output exception', () => {
      var e = errorToString(new Error('message!'));
      expect(e).toContain('message!');
    });

    it('should output stackTrace', () => {
      var error = new Error('message!');
      var stack = getStack(error);
      if (stack) {
        var e = errorToString(error);
        expect(e).toContain(stack);
      }
    });

    describe('context', () => {
      it('should print nested context', () => {
        var cause = new Error('message!');
        var stack = getStack(cause);
        var context = {
          source: 'context!',
          toString() { return 'Context'; }
        } as any as DebugContext;
        var original = new ViewWrappedError(cause, context);
        var e = errorToString(new WrappedError('message', original));
        expect(e).toEqual(
            stack ? `EXCEPTION: message caused by: Error in context! caused by: message!
ORIGINAL EXCEPTION: message!
ORIGINAL STACKTRACE:
${stack}
ERROR CONTEXT:
Context` :
                    `EXCEPTION: message caused by: Error in context! caused by: message!
ORIGINAL EXCEPTION: message!
ERROR CONTEXT:
Context`);
      });
    });

    describe('original exception', () => {
      it('should print original exception message if available (original is Error)', () => {
        var realOriginal = new Error('inner');
        var original = new WrappedError('wrapped', realOriginal);
        var e = errorToString(new WrappedError('wrappedwrapped', original));
        expect(e).toContain('inner');
      });

      it('should print original exception message if available (original is not Error)', () => {
        var realOriginal = new _CustomException();
        var original = new WrappedError('wrapped', realOriginal);
        var e = errorToString(new WrappedError('wrappedwrapped', original));
        expect(e).toContain('custom');
      });
    });

    describe('original stack', () => {
      it('should print original stack if available', () => {
        var realOriginal = new Error('inner');
        var stack = getStack(realOriginal);
        if (stack) {
          var original = new WrappedError('wrapped', realOriginal);
          var e = errorToString(new WrappedError('wrappedwrapped', original));
          expect(e).toContain(stack);
        }
      });
    });
  });
}
