/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

class TestRejection {
  prop1?: string;
  prop2?: string;
}

describe('disable wrap uncaught promise rejection', () => {
  it('should notify Zone.onHandleError if promise is uncaught', (done) => {
    let promiseError: Error | null = null;
    let zone: Zone | null = null;
    let task: Task | null = null;
    let error: Error | null = null;
    Zone.current
      .fork({
        name: 'promise-error',
        onHandleError: (
          delegate: ZoneDelegate,
          current: Zone,
          target: Zone,
          error: any,
        ): boolean => {
          promiseError = error;
          delegate.handleError(target, error);
          return false;
        },
      })
      .run(() => {
        zone = Zone.current;
        task = Zone.currentTask;
        error = new Error('rejectedErrorShouldBeHandled');
        try {
          // throw so that the stack trace is captured
          throw error;
        } catch (e) {}
        Promise.reject(error);
        expect(promiseError).toBe(null);
      });
    setTimeout((): any => null);
    setTimeout(() => {
      expect(promiseError).toBe(error);
      expect((promiseError as any)['rejection']).toBe(undefined);
      expect((promiseError as any)['zone']).toBe(undefined);
      expect((promiseError as any)['task']).toBe(undefined);
      done();
    });
  });

  it('should print original information when a non-Error object is used for rejection', (done) => {
    let promiseError: Error | null = null;
    let rejectObj: TestRejection;
    Zone.current
      .fork({
        name: 'promise-error',
        onHandleError: (
          delegate: ZoneDelegate,
          current: Zone,
          target: Zone,
          error: any,
        ): boolean => {
          promiseError = error;
          delegate.handleError(target, error);
          return false;
        },
      })
      .run(() => {
        rejectObj = new TestRejection();
        rejectObj.prop1 = 'value1';
        rejectObj.prop2 = 'value2';
        (rejectObj as any).message = 'rejectMessage';
        Promise.reject(rejectObj);
        expect(promiseError).toBe(null);
      });
    setTimeout((): any => null);
    setTimeout(() => {
      expect(promiseError).toEqual(rejectObj as any);
      done();
    });
  });

  it('should print original information when a primitive value is used for rejection', (done) => {
    let promiseError: number | null = null;
    Zone.current
      .fork({
        name: 'promise-error',
        onHandleError: (
          delegate: ZoneDelegate,
          current: Zone,
          target: Zone,
          error: any,
        ): boolean => {
          promiseError = error;
          delegate.handleError(target, error);
          return false;
        },
      })
      .run(() => {
        Promise.reject(42);
        expect(promiseError).toBe(null);
      });
    setTimeout((): any => null);
    setTimeout(() => {
      expect(promiseError).toBe(42);
      done();
    });
  });

  it('should handle a custom object rejection with a rejection property without crashing the error logger', async () => {
    await jasmine.spyOnGlobalErrorsAsync(() => {
      const originalConsoleError = console.error;
      console.error = jasmine.createSpy('consoleErr');

      const rejectObj = {
        rejection: 'custom-inner-rejection',
        message: 'custom-error-message',
      };

      Zone.current.fork({name: 'promise-error-zone'}).run(() => {
        Promise.reject(rejectObj);
      });

      return new Promise<void>((res) => {
        setTimeout(() => {
          expect(console.error).toHaveBeenCalledWith(rejectObj);
          console.error = originalConsoleError;
          res();
        });
      });
    });
  });
});
