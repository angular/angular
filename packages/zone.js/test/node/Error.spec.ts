/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('ZoneAwareError', () => {
  // If the environment does not supports stack rewrites, then these tests will fail
  // and there is no point in running them.
  if (!(Error as any)['stackRewrite']) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  it('should have all properties from NativeError', () => {
    let obj: any = new Object();
    Error.captureStackTrace(obj);
    expect(obj.stack).not.toBeUndefined();
  });

  it('should support prepareStackTrace', () => {
    const originalPrepareStackTrace = (<any>Error).prepareStackTrace;
    (<any>Error).prepareStackTrace = function(error: Error, stack: string) {
      return stack;
    };
    let obj: any = new Object();
    Error.captureStackTrace(obj);
    expect(obj.stack[0].getFileName()).not.toBeUndefined();
    (<any>Error).prepareStackTrace = originalPrepareStackTrace;
  });

  it('should not add additional stacktrace from Zone when use prepareStackTrace', () => {
    const originalPrepareStackTrace = (<any>Error).prepareStackTrace;
    (<any>Error).prepareStackTrace = function(error: Error, stack: string) {
      return stack;
    };
    let obj: any = new Object();
    Error.captureStackTrace(obj);
    expect(obj.stack.length).not.toBe(0);
    obj.stack.forEach(function(st: any) {
      expect(st.getFunctionName()).not.toEqual('zoneCaptureStackTrace');
    });
    (<any>Error).prepareStackTrace = originalPrepareStackTrace;
  });
});
