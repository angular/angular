/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorHandler, provideErrorHandler} from '../src/error_handler';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';
import {destroyPlatform, Component} from '../public_api';

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

  it(
    'should register a error handler function',
    withBody('<test-app/>', async () => {
      destroyPlatform();

      const logger = new MockConsole();

      @Component({
        selector: 'test-app',
        template: '',
      })
      class TestHostCmp {
        constructor() {
          throw new Error('message!');
        }
      }

      try {
        await bootstrapApplication(TestHostCmp, {
          providers: [provideErrorHandler((e: any) => logger.error(e))],
        });

        fail('Expected to throw');
      } catch (e: unknown) {}

      const error = logger.res[0][0];
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('message!');

      destroyPlatform();
    }),
  );
});
