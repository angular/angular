/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isBrowser} from '../../lib/common/utils';
import {isSafari, zoneSymbol} from '../test-util';

// simulate @angular/facade/src/error.ts
class BaseError extends Error {
  /** @internal **/
  _nativeError: Error;

  constructor(message: string) {
    super(message);
    const nativeError = new Error(message) as any as Error;
    this._nativeError = nativeError;
  }

  override get message() {
    return this._nativeError.message;
  }
  override set message(message) {
    this._nativeError.message = message;
  }
  override get name() {
    return this._nativeError.name;
  }
  override get stack() {
    return (this._nativeError as any).stack;
  }
  override set stack(value) {
    (this._nativeError as any).stack = value;
  }
  override toString() {
    return this._nativeError.toString();
  }
}

class WrappedError extends BaseError {
  originalError: any;

  constructor(message: string, error: any) {
    super(`${message} caused by: ${error instanceof Error ? error.message : error}`);
    this.originalError = error;
  }

  override get stack() {
    return ((this.originalError instanceof Error ? this.originalError : this._nativeError) as any)
      .stack;
  }
}

class TestError extends WrappedError {
  constructor(message: string, error: any) {
    super(`${message} caused by: ${error instanceof Error ? error.message : error}`, error);
  }

  override get message() {
    return 'test ' + this.originalError.message;
  }
}

class TestMessageError extends WrappedError {
  constructor(message: string, error: any) {
    super(`${message} caused by: ${error instanceof Error ? error.message : error}`, error);
  }

  override get message() {
    return 'test ' + this.originalError.message;
  }

  override set message(value) {
    this.originalError.message = value;
  }
}

describe('ZoneAwareError', () => {
  // If the environment does not supports stack rewrites, then these tests will fail
  // and there is no point in running them.
  const _global: any = typeof window !== 'undefined' ? window : global;
  let config: any;
  const __karma__ = _global.__karma__;
  if (typeof __karma__ !== 'undefined') {
    config = __karma__ && (__karma__ as any).config;
  } else if (typeof process !== 'undefined') {
    config = process.env;
  }
  const policy = (config && config['errorpolicy']) || 'default';
  if (!(Error as any)['stackRewrite'] && policy !== 'disable') return;

  it('should keep error prototype chain correctly', () => {
    class MyError extends Error {}
    const myError = new MyError();
    expect(myError instanceof Error).toBe(true);
    expect(myError instanceof MyError).toBe(true);
    expect(myError.stack).not.toBe(undefined);
  });

  it('should instanceof error correctly', () => {
    let myError = Error('myError');
    expect(myError instanceof Error).toBe(true);
    let myError1 = Error.call(undefined, 'myError');
    expect(myError1 instanceof Error).toBe(true);
    let myError2 = Error.call(global, 'myError');
    expect(myError2 instanceof Error).toBe(true);
    let myError3 = Error.call({}, 'myError');
    expect(myError3 instanceof Error).toBe(true);
    let myError4 = Error.call({test: 'test'}, 'myError');
    expect(myError4 instanceof Error).toBe(true);
  });

  it('should return error itself from constructor', () => {
    class MyError1 extends Error {
      constructor() {
        const err: any = super('MyError1');
        this.message = err.message;
      }
    }
    let myError1 = new MyError1();
    expect(myError1.message).toEqual('MyError1');
    expect(myError1.name).toEqual('Error');
  });

  it('should return error by calling error directly', () => {
    let myError = Error('myError');
    expect(myError.message).toEqual('myError');
    let myError1 = Error.call(undefined, 'myError');
    expect(myError1.message).toEqual('myError');
    let myError2 = Error.call(global, 'myError');
    expect(myError2.message).toEqual('myError');
    let myError3 = Error.call({}, 'myError');
    expect(myError3.message).toEqual('myError');
  });

  it('should have browser specified property', () => {
    let myError = new Error('myError');
    if (Object.prototype.hasOwnProperty.call(Error.prototype, 'description')) {
      // in IE, error has description property
      expect((<any>myError).description).toEqual('myError');
    }
    if (Object.prototype.hasOwnProperty.call(Error.prototype, 'fileName')) {
      // in firefox, error has fileName property
      expect((<any>myError).fileName).toBeTruthy();
    }
  });

  it('should not use child Error class get/set in ZoneAwareError constructor', () => {
    const func = () => {
      const error = new BaseError('test');
      expect(error.message).toEqual('test');
    };

    expect(func).not.toThrow();
  });

  it('should behave correctly with wrapped error', () => {
    const error = new TestError('originalMessage', new Error('error message'));
    expect(error.message).toEqual('test error message');
    error.originalError.message = 'new error message';
    expect(error.message).toEqual('test new error message');

    const error1 = new TestMessageError('originalMessage', new Error('error message'));
    expect(error1.message).toEqual('test error message');
    error1.message = 'new error message';
    expect(error1.message).toEqual('test new error message');
  });

  it('should copy customized NativeError properties to ZoneAwareError', () => {
    const spy = jasmine.createSpy('errorCustomFunction');
    const NativeError = (global as any)[(Zone as any).__symbol__('Error')];
    NativeError.customFunction = function (args: any) {
      spy(args);
    };
    expect((Error as any)['customProperty']).toBe('customProperty');
    expect(typeof (Error as any)['customFunction']).toBe('function');
    (Error as any)['customFunction']('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should copy cause on error that extends native', () => {
    class WrappedError extends Error {
      constructor(error: unknown) {
        super(
          'wrapped',
          // @ts-ignore
          {cause: error},
        );
      }
    }
    const cause = new Error('original');
    const wrapped = new WrappedError(cause) as any;
    expect(wrapped.cause).toBe(cause);
  });

  it('should always have stack property even without throw', () => {
    // in IE, the stack will be undefined without throw
    // in ZoneAwareError, we will make stack always be
    // there event without throw
    const error = new Error('test');
    const errorWithoutNew = Error('test');
    expect(error.stack!.split('\n').length > 0).toBeTruthy();
    expect(errorWithoutNew.stack!.split('\n').length > 0).toBeTruthy();
  });

  it('should show zone names in stack frames and remove extra frames', () => {
    if (policy === 'disable' || !(Error as any)['stackRewrite']) {
      return;
    }
    if (isBrowser && isSafari()) {
      return;
    }
    const rootZone = Zone.root;
    const innerZone = rootZone.fork({name: 'InnerZone'});

    rootZone.run(testFn);
    function testFn() {
      let outside: any;
      let inside: any;
      let outsideWithoutNew: any;
      let insideWithoutNew: any;
      try {
        throw new Error('Outside');
      } catch (e) {
        outside = e;
      }
      try {
        throw Error('Outside');
      } catch (e) {
        outsideWithoutNew = e;
      }
      innerZone.run(function insideRun() {
        try {
          throw new Error('Inside');
        } catch (e) {
          inside = e;
        }
        try {
          throw Error('Inside');
        } catch (e) {
          insideWithoutNew = e;
        }
      });

      if (policy === 'lazy') {
        outside.stack = outside.zoneAwareStack;
        outsideWithoutNew.stack = outsideWithoutNew.zoneAwareStack;
        inside.stack = inside.zoneAwareStack;
        insideWithoutNew.stack = insideWithoutNew.zoneAwareStack;
      }

      expect(outside.stack).toEqual(outside.zoneAwareStack);
      expect(outsideWithoutNew.stack).toEqual(outsideWithoutNew.zoneAwareStack);
      expect(inside!.stack).toEqual(inside!.zoneAwareStack);
      expect(insideWithoutNew!.stack).toEqual(insideWithoutNew!.zoneAwareStack);
      expect(typeof inside!.originalStack).toEqual('string');
      expect(typeof insideWithoutNew!.originalStack).toEqual('string');
      const outsideFrames = outside.stack!.split(/\n/);
      const insideFrames = inside!.stack!.split(/\n/);
      const outsideWithoutNewFrames = outsideWithoutNew!.stack!.split(/\n/);
      const insideWithoutNewFrames = insideWithoutNew!.stack!.split(/\n/);

      // throw away first line if it contains the error
      if (/Outside/.test(outsideFrames[0])) {
        outsideFrames.shift();
      }
      if (/Error /.test(outsideFrames[0])) {
        outsideFrames.shift();
      }

      if (/Outside/.test(outsideWithoutNewFrames[0])) {
        outsideWithoutNewFrames.shift();
      }
      if (/Error /.test(outsideWithoutNewFrames[0])) {
        outsideWithoutNewFrames.shift();
      }

      if (/Inside/.test(insideFrames[0])) {
        insideFrames.shift();
      }
      if (/Error /.test(insideFrames[0])) {
        insideFrames.shift();
      }

      if (/Inside/.test(insideWithoutNewFrames[0])) {
        insideWithoutNewFrames.shift();
      }
      if (/Error /.test(insideWithoutNewFrames[0])) {
        insideWithoutNewFrames.shift();
      }
      expect(outsideFrames[0]).toMatch(/testFn.*[<root>]/);

      expect(insideFrames[0]).toMatch(/insideRun.*[InnerZone]]/);
      expect(insideFrames[1]).toMatch(/testFn.*[<root>]]/);

      expect(outsideWithoutNewFrames[0]).toMatch(/testFn.*[<root>]/);

      expect(insideWithoutNewFrames[0]).toMatch(/insideRun.*[InnerZone]]/);
      expect(insideWithoutNewFrames[1]).toMatch(/testFn.*[<root>]]/);
    }
  });

  const zoneAwareFrames = [
    'Zone.run',
    'Zone.runGuarded',
    'Zone.scheduleEventTask',
    'Zone.scheduleMicroTask',
    'Zone.scheduleMacroTask',
    'Zone.runTask',
    'ZoneDelegate.scheduleTask',
    'ZoneDelegate.invokeTask',
    'zoneAwareAddListener',
    'Zone.prototype.run',
    'Zone.prototype.runGuarded',
    'Zone.prototype.scheduleEventTask',
    'Zone.prototype.scheduleMicroTask',
    'Zone.prototype.scheduleMacroTask',
    'Zone.prototype.runTask',
    'ZoneDelegate.prototype.scheduleTask',
    'ZoneDelegate.prototype.invokeTask',
    'ZoneTask.invokeTask',
  ];

  function assertStackDoesNotContainZoneFrames(err: any) {
    const frames = policy === 'lazy' ? err.zoneAwareStack.split('\n') : err.stack.split('\n');
    if (policy === 'disable') {
      let hasZoneStack = false;
      for (let i = 0; i < frames.length; i++) {
        if (hasZoneStack) {
          break;
        }
        hasZoneStack = zoneAwareFrames.filter((f) => frames[i].indexOf(f) !== -1).length > 0;
      }
      if (!hasZoneStack) {
        console.log('stack', hasZoneStack, frames, err.originalStack);
      }
      expect(hasZoneStack).toBe(true);
    } else {
      for (let i = 0; i < frames.length; i++) {
        expect(zoneAwareFrames.filter((f) => frames[i].indexOf(f) !== -1)).toEqual([]);
      }
    }
  }

  const errorZoneSpec = {
    name: 'errorZone',
    done: <(() => void) | null>null,
    onHandleError: (
      parentDelegate: ZoneDelegate,
      currentZone: Zone,
      targetZone: Zone,
      error: Error,
    ) => {
      assertStackDoesNotContainZoneFrames(error);
      setTimeout(() => {
        errorZoneSpec.done && errorZoneSpec.done();
      }, 0);
      return false;
    },
  };

  const errorZone = Zone.root.fork(errorZoneSpec);

  const assertStackDoesNotContainZoneFramesTest = function (testFn: Function) {
    return function (done: () => void) {
      errorZoneSpec.done = done;
      errorZone.run(testFn);
    };
  };

  describe('Error stack', () => {
    it(
      'Error with new which occurs in setTimeout callback should not have zone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        setTimeout(() => {
          throw new Error('timeout test error');
        }, 10);
      }),
    );

    it(
      'Error without new which occurs in setTimeout callback should not have zone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        setTimeout(() => {
          throw Error('test error');
        }, 10);
      }),
    );

    it('Error with new which cause by promise rejection should not have zone frames visible', (done) => {
      const p = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('test error'));
        });
      });
      p.catch((err) => {
        assertStackDoesNotContainZoneFrames(err);
        done();
      });
    });

    it('Error without new which cause by promise rejection should not have zone frames visible', (done) => {
      const p = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(Error('test error'));
        });
      });
      p.catch((err) => {
        assertStackDoesNotContainZoneFrames(err);
        done();
      });
    });

    it(
      'Error with new which occurs in eventTask callback should not have zone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        const task = Zone.current.scheduleEventTask(
          'errorEvent',
          () => {
            throw new Error('test error');
          },
          undefined,
          () => null,
          undefined,
        );
        task.invoke();
      }),
    );

    it(
      'Error without new which occurs in eventTask callback should not have zone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        const task = Zone.current.scheduleEventTask(
          'errorEvent',
          () => {
            throw Error('test error');
          },
          undefined,
          () => null,
          undefined,
        );
        task.invoke();
      }),
    );

    it(
      'Error with new which occurs in longStackTraceZone should not have zone frames and longStackTraceZone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        const task = Zone.current.fork((Zone as any)['longStackTraceZoneSpec']).scheduleEventTask(
          'errorEvent',
          () => {
            throw new Error('test error');
          },
          undefined,
          () => null,
          undefined,
        );
        task.invoke();
      }),
    );

    it(
      'Error without new which occurs in longStackTraceZone should not have zone frames and longStackTraceZone frames visible',
      assertStackDoesNotContainZoneFramesTest(() => {
        const task = Zone.current.fork((Zone as any)['longStackTraceZoneSpec']).scheduleEventTask(
          'errorEvent',
          () => {
            throw Error('test error');
          },
          undefined,
          () => null,
          undefined,
        );
        task.invoke();
      }),
    );

    it(
      'stack frames of the callback in user customized zoneSpec should be kept',
      assertStackDoesNotContainZoneFramesTest(() => {
        const task = Zone.current
          .fork((Zone as any)['longStackTraceZoneSpec'])
          .fork({
            name: 'customZone',
            onScheduleTask: (parentDelegate, currentZone, targetZone, task) => {
              return parentDelegate.scheduleTask(targetZone, task);
            },
            onHandleError: (parentDelegate, currentZone, targetZone, error) => {
              parentDelegate.handleError(targetZone, error);
              const containsCustomZoneSpecStackTrace = error.stack.indexOf('onScheduleTask') !== -1;
              expect(containsCustomZoneSpecStackTrace).toBeTruthy();
              return false;
            },
          })
          .scheduleEventTask(
            'errorEvent',
            () => {
              throw new Error('test error');
            },
            undefined,
            () => null,
            undefined,
          );
        task.invoke();
      }),
    );

    it('should be able to generate zone free stack even NativeError stack is readonly', function () {
      const _global: any =
        (typeof window === 'object' && window) || (typeof self === 'object' && self) || global;
      const NativeError = _global[zoneSymbol('Error')];
      const desc = Object.getOwnPropertyDescriptor(NativeError.prototype, 'stack');
      if (desc) {
        const originalSet: ((value: any) => void) | undefined = desc.set;
        // make stack readonly
        desc.set = null as any;

        try {
          const error = new Error('test error');
          expect(error.stack).toBeTruthy();
          assertStackDoesNotContainZoneFrames(error);
        } finally {
          desc.set = originalSet;
        }
      }
    });
  });
});
