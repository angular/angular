/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis,undefinedVars}
 */

/**
 * Extend the Error with additional fields for rewritten stack frames
 */
interface Error {
  /**
   * Stack trace where extra frames have been removed and zone names added.
   */
  zoneAwareStack?: string;

  /**
   * Original stack trace with no modifications
   */
  originalStack?: string;
}

Zone.__load_patch('Error', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  /*
   * This code patches Error so that:
   *   - It ignores un-needed stack frames.
   *   - It Shows the associated Zone for reach frame.
   */

  const enum FrameType {
    /// Skip this frame when printing out stack
    zoneJsInternal,
    /// This frame marks zone transition
    transition
  }

  const zoneJsInternalStackFramesSymbol = api.symbol('zoneJsInternalStackFrames');
  const NativeError = global[api.symbol('Error')] = global['Error'];
  // Store the frames which should be removed from the stack frames
  const zoneJsInternalStackFrames: {[frame: string]: FrameType} = {};
  // We must find the frame where Error was created, otherwise we assume we don't understand stack
  let zoneAwareFrame1: string;
  let zoneAwareFrame2: string;
  let zoneAwareFrame1WithoutNew: string;
  let zoneAwareFrame2WithoutNew: string;
  let zoneAwareFrame3WithoutNew: string;

  global['Error'] = ZoneAwareError;
  const stackRewrite = 'stackRewrite';

  type ZoneJsInternalStackFramesPolicy = 'default'|'disable'|'lazy';
  const zoneJsInternalStackFramesPolicy: ZoneJsInternalStackFramesPolicy =
      global['__Zone_Error_BlacklistedStackFrames_policy'] ||
      global['__Zone_Error_ZoneJsInternalStackFrames_policy'] || 'default';

  interface ZoneFrameName {
    zoneName: string;
    parent?: ZoneFrameName;
  }

  function buildZoneFrameNames(zoneFrame: _ZoneFrame) {
    let zoneFrameName: ZoneFrameName = {zoneName: zoneFrame.zone.name};
    let result = zoneFrameName;
    while (zoneFrame.parent) {
      zoneFrame = zoneFrame.parent;
      const parentZoneFrameName = {zoneName: zoneFrame.zone.name};
      zoneFrameName.parent = parentZoneFrameName;
      zoneFrameName = parentZoneFrameName;
    }
    return result;
  }

  function buildZoneAwareStackFrames(
      originalStack: string, zoneFrame: _ZoneFrame|ZoneFrameName|null, isZoneFrame = true) {
    let frames: string[] = originalStack.split('\n');
    let i = 0;
    // Find the first frame
    while (!(frames[i] === zoneAwareFrame1 || frames[i] === zoneAwareFrame2 ||
             frames[i] === zoneAwareFrame1WithoutNew || frames[i] === zoneAwareFrame2WithoutNew ||
             frames[i] === zoneAwareFrame3WithoutNew) &&
           i < frames.length) {
      i++;
    }
    for (; i < frames.length && zoneFrame; i++) {
      let frame = frames[i];
      if (frame.trim()) {
        switch (zoneJsInternalStackFrames[frame]) {
          case FrameType.zoneJsInternal:
            frames.splice(i, 1);
            i--;
            break;
          case FrameType.transition:
            if (zoneFrame.parent) {
              // This is the special frame where zone changed. Print and process it accordingly
              zoneFrame = zoneFrame.parent;
            } else {
              zoneFrame = null;
            }
            frames.splice(i, 1);
            i--;
            break;
          default:
            frames[i] += isZoneFrame ? ` [${(zoneFrame as _ZoneFrame).zone.name}]` :
                                       ` [${(zoneFrame as ZoneFrameName).zoneName}]`;
        }
      }
    }
    return frames.join('\n');
  }
  /**
   * This is ZoneAwareError which processes the stack frame and cleans up extra frames as well as
   * adds zone information to it.
   */
  function ZoneAwareError(this: unknown|typeof NativeError): Error {
    // We always have to return native error otherwise the browser console will not work.
    let error: Error = NativeError.apply(this, arguments);
    // Save original stack trace
    const originalStack = (error as any)['originalStack'] = error.stack;

    // Process the stack trace and rewrite the frames.
    if ((ZoneAwareError as any)[stackRewrite] && originalStack) {
      let zoneFrame = api.currentZoneFrame();
      if (zoneJsInternalStackFramesPolicy === 'lazy') {
        // don't handle stack trace now
        (error as any)[api.symbol('zoneFrameNames')] = buildZoneFrameNames(zoneFrame);
      } else if (zoneJsInternalStackFramesPolicy === 'default') {
        try {
          error.stack = error.zoneAwareStack = buildZoneAwareStackFrames(originalStack, zoneFrame);
        } catch (e) {
          // ignore as some browsers don't allow overriding of stack
        }
      }
    }

    if (this instanceof NativeError && this.constructor != NativeError) {
      // We got called with a `new` operator AND we are subclass of ZoneAwareError
      // in that case we have to copy all of our properties to `this`.
      Object.keys(error).concat('stack', 'message').forEach((key) => {
        const value = (error as any)[key];
        if (value !== undefined) {
          try {
            this[key] = value;
          } catch (e) {
            // ignore the assignment in case it is a setter and it throws.
          }
        }
      });
      return this;
    }
    return error;
  }

  // Copy the prototype so that instanceof operator works as expected
  ZoneAwareError.prototype = NativeError.prototype;
  (ZoneAwareError as any)[zoneJsInternalStackFramesSymbol] = zoneJsInternalStackFrames;
  (ZoneAwareError as any)[stackRewrite] = false;

  const zoneAwareStackSymbol = api.symbol('zoneAwareStack');

  // try to define zoneAwareStack property when zoneJsInternal frames policy is delay
  if (zoneJsInternalStackFramesPolicy === 'lazy') {
    Object.defineProperty(ZoneAwareError.prototype, 'zoneAwareStack', {
      configurable: true,
      enumerable: true,
      get: function() {
        if (!this[zoneAwareStackSymbol]) {
          this[zoneAwareStackSymbol] = buildZoneAwareStackFrames(
              this.originalStack, this[api.symbol('zoneFrameNames')], false);
        }
        return this[zoneAwareStackSymbol];
      },
      set: function(newStack: string) {
        this.originalStack = newStack;
        this[zoneAwareStackSymbol] = buildZoneAwareStackFrames(
            this.originalStack, this[api.symbol('zoneFrameNames')], false);
      }
    });
  }

  // those properties need special handling
  const specialPropertyNames = ['stackTraceLimit', 'captureStackTrace', 'prepareStackTrace'];
  // those properties of NativeError should be set to ZoneAwareError
  const nativeErrorProperties = Object.keys(NativeError);
  if (nativeErrorProperties) {
    nativeErrorProperties.forEach(prop => {
      if (specialPropertyNames.filter(sp => sp === prop).length === 0) {
        Object.defineProperty(ZoneAwareError, prop, {
          get: function() {
            return NativeError[prop];
          },
          set: function(value) {
            NativeError[prop] = value;
          }
        });
      }
    });
  }

  if (NativeError.hasOwnProperty('stackTraceLimit')) {
    // Extend default stack limit as we will be removing few frames.
    NativeError.stackTraceLimit = Math.max(NativeError.stackTraceLimit, 15);

    // make sure that ZoneAwareError has the same property which forwards to NativeError.
    Object.defineProperty(ZoneAwareError, 'stackTraceLimit', {
      get: function() {
        return NativeError.stackTraceLimit;
      },
      set: function(value) {
        return NativeError.stackTraceLimit = value;
      }
    });
  }

  if (NativeError.hasOwnProperty('captureStackTrace')) {
    Object.defineProperty(ZoneAwareError, 'captureStackTrace', {
      // add named function here because we need to remove this
      // stack frame when prepareStackTrace below
      value: function zoneCaptureStackTrace(targetObject: Object, constructorOpt?: Function) {
        NativeError.captureStackTrace(targetObject, constructorOpt);
      }
    });
  }

  const ZONE_CAPTURESTACKTRACE = 'zoneCaptureStackTrace';
  Object.defineProperty(ZoneAwareError, 'prepareStackTrace', {
    get: function() {
      return NativeError.prepareStackTrace;
    },
    set: function(value) {
      if (!value || typeof value !== 'function') {
        return NativeError.prepareStackTrace = value;
      }
      return NativeError.prepareStackTrace = function(
                 error: Error, structuredStackTrace: {getFunctionName: Function}[]) {
        // remove additional stack information from ZoneAwareError.captureStackTrace
        if (structuredStackTrace) {
          for (let i = 0; i < structuredStackTrace.length; i++) {
            const st = structuredStackTrace[i];
            // remove the first function which name is zoneCaptureStackTrace
            if (st.getFunctionName() === ZONE_CAPTURESTACKTRACE) {
              structuredStackTrace.splice(i, 1);
              break;
            }
          }
        }
        return value.call(this, error, structuredStackTrace);
      };
    }
  });

  if (zoneJsInternalStackFramesPolicy === 'disable') {
    // don't need to run detectZone to populate zoneJs internal stack frames
    return;
  }
  // Now we need to populate the `zoneJsInternalStackFrames` as well as find the
  // run/runGuarded/runTask frames. This is done by creating a detect zone and then threading
  // the execution through all of the above methods so that we can look at the stack trace and
  // find the frames of interest.

  let detectZone: Zone = Zone.current.fork({
    name: 'detect',
    onHandleError: function(
        parentZD: ZoneDelegate, current: Zone, target: Zone, error: any): boolean {
      if (error.originalStack && Error === ZoneAwareError) {
        let frames = error.originalStack.split(/\n/);
        let runFrame = false, runGuardedFrame = false, runTaskFrame = false;
        while (frames.length) {
          let frame = frames.shift();
          // On safari it is possible to have stack frame with no line number.
          // This check makes sure that we don't filter frames on name only (must have
          // line number or exact equals to `ZoneAwareError`)
          if (/:\d+:\d+/.test(frame) || frame === 'ZoneAwareError') {
            // Get rid of the path so that we don't accidentally find function name in path.
            // In chrome the separator is `(` and `@` in FF and safari
            // Chrome: at Zone.run (zone.js:100)
            // Chrome: at Zone.run (http://localhost:9876/base/build/lib/zone.js:100:24)
            // FireFox: Zone.prototype.run@http://localhost:9876/base/build/lib/zone.js:101:24
            // Safari: run@http://localhost:9876/base/build/lib/zone.js:101:24
            let fnName: string = frame.split('(')[0].split('@')[0];
            let frameType = FrameType.transition;
            if (fnName.indexOf('ZoneAwareError') !== -1) {
              if (fnName.indexOf('new ZoneAwareError') !== -1) {
                zoneAwareFrame1 = frame;
                zoneAwareFrame2 = frame.replace('new ZoneAwareError', 'new Error.ZoneAwareError');
              } else {
                zoneAwareFrame1WithoutNew = frame;
                zoneAwareFrame2WithoutNew = frame.replace('Error.', '');
                if (frame.indexOf('Error.ZoneAwareError') === -1) {
                  zoneAwareFrame3WithoutNew =
                      frame.replace('ZoneAwareError', 'Error.ZoneAwareError');
                }
              }
              zoneJsInternalStackFrames[zoneAwareFrame2] = FrameType.zoneJsInternal;
            }
            if (fnName.indexOf('runGuarded') !== -1) {
              runGuardedFrame = true;
            } else if (fnName.indexOf('runTask') !== -1) {
              runTaskFrame = true;
            } else if (fnName.indexOf('run') !== -1) {
              runFrame = true;
            } else {
              frameType = FrameType.zoneJsInternal;
            }
            zoneJsInternalStackFrames[frame] = frameType;
            // Once we find all of the frames we can stop looking.
            if (runFrame && runGuardedFrame && runTaskFrame) {
              (ZoneAwareError as any)[stackRewrite] = true;
              break;
            }
          }
        }
      }
      return false;
    }
  }) as Zone;
  // carefully constructor a stack frame which contains all of the frames of interest which
  // need to be detected and marked as an internal zoneJs frame.

  const childDetectZone = detectZone.fork({
    name: 'child',
    onScheduleTask: function(delegate, curr, target, task) {
      return delegate.scheduleTask(target, task);
    },
    onInvokeTask: function(delegate, curr, target, task, applyThis, applyArgs) {
      return delegate.invokeTask(target, task, applyThis, applyArgs);
    },
    onCancelTask: function(delegate, curr, target, task) {
      return delegate.cancelTask(target, task);
    },
    onInvoke: function(delegate, curr, target, callback, applyThis, applyArgs, source) {
      return delegate.invoke(target, callback, applyThis, applyArgs, source);
    }
  });

  // we need to detect all zone related frames, it will
  // exceed default stackTraceLimit, so we set it to
  // larger number here, and restore it after detect finish.
  // We cast through any so we don't need to depend on nodejs typings.
  const originalStackTraceLimit = (Error as any).stackTraceLimit;
  (Error as any).stackTraceLimit = 100;
  // we schedule event/micro/macro task, and invoke them
  // when onSchedule, so we can get all stack traces for
  // all kinds of tasks with one error thrown.
  childDetectZone.run(() => {
    childDetectZone.runGuarded(() => {
      const fakeTransitionTo = () => {};
      childDetectZone.scheduleEventTask(
          zoneJsInternalStackFramesSymbol,
          () => {
            childDetectZone.scheduleMacroTask(
                zoneJsInternalStackFramesSymbol,
                () => {
                  childDetectZone.scheduleMicroTask(
                      zoneJsInternalStackFramesSymbol,
                      () => {
                        throw new Error();
                      },
                      undefined,
                      (t: Task) => {
                        (t as any)._transitionTo = fakeTransitionTo;
                        t.invoke();
                      });
                  childDetectZone.scheduleMicroTask(
                      zoneJsInternalStackFramesSymbol,
                      () => {
                        throw Error();
                      },
                      undefined,
                      (t: Task) => {
                        (t as any)._transitionTo = fakeTransitionTo;
                        t.invoke();
                      });
                },
                undefined,
                (t) => {
                  (t as any)._transitionTo = fakeTransitionTo;
                  t.invoke();
                },
                () => {});
          },
          undefined,
          (t) => {
            (t as any)._transitionTo = fakeTransitionTo;
            t.invoke();
          },
          () => {});
    });
  });

  (Error as any).stackTraceLimit = originalStackTraceLimit;
});
