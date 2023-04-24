/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A different implementation for monkey patching Promise.
 * Currently Zone.js patches Promise itself with ZoneAwarePromise and also Promise.prototype.then
 * The reason is:
 *
 * 1. Promise.prototype.then should trigger ZoneSpec.scheduleTask and acts as a microTask
 * 2. Promise should be able to controlled by fakeAsync(), so Promise.prototype.then can work as
 * sync operation in fakeAsync()
 * 3. Promise unhandledRejection can be handled by ZoneSpec.onHandleError hook
 *
 * And this implementation also has it's disadvantage.
 *
 * 1. We need to implement a full Promise spec by ourselves.
 * 2. We need to implement the new APIs for Promise such as (all, allSettled, any...) when the new
 * APIs are available.
 * 3. Promise behavior is different with the native one, such as the timing of then callback.
 * 4. Can not handle the some vm operation requires native Promise such as async/await or
 * SafePromise.
 *
 * And this new implementation try to address most of these disadvantages.
 * 1. We don't monkey patch Promise itself any longer.
 * 2. We only monkey patches Promise.prototype.then and schedule microTask from there.
 * 3. The Promise APIs are all using native ones.
 * 4. SafePromise issues are gone, and the timing will be the same with the native one.
 *
 * Also this new implementation introduces breaking changes.
 *
 * 1. Promise can not be easily handled by fakeAsync(), and since we will deprecate fakeAsync() in
 * the future, this is the first step.
 * 2. Promise unhandled rejection happened inside new Promise(callback) will not be handled by
 * ZoneSpec.onHandleError(thenCallback error will not be be impacted).
 *
 * So now we only introduces this change to `zone-node` bundle, since the breaking change will be
 * minor for NodeJS environment,
 * @TODO: JiaLiPassion, we will introduce this change to browser later.
 */
Zone.__load_patch('ZoneAwarePromise', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const __symbol__ = api.symbol;
  const symbolThen = __symbol__('then');

  api.onUnhandledError = (e: any) => {
    if (api.showUncaughtError()) {
      const rejection = e && e.rejection;
      if (rejection) {
        console.error(
            'Unhandled Promise rejection:',
            rejection instanceof Error ? rejection?.message : rejection,
            '; Zone:', (<Zone>e.zone).name, '; Task:', e.task && (<Task>e.task).source,
            '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
      } else {
        console.error(e);
      }
    }
  };

  api.microtaskDrainDone = () => {};

  const symbolThenPatched = __symbol__('thenPatched');

  function patchThen(Ctor: Function) {
    const proto = Ctor.prototype;
    if ((Ctor as any)[symbolThenPatched] === true) {
      return;
    }

    const prop = Object.getOwnPropertyDescriptor(proto, 'then');
    if (prop && (prop.writable === false || !prop.configurable)) {
      // check Ctor.prototype.then propertyDescriptor is writable or not
      // in meteor env, writable is false, we should ignore such case
      return;
    }

    const originalThen = proto.then;
    // Keep a reference to the original method.
    proto[symbolThen] = originalThen;

    const makeResolver = function(resolveFunc: any, zone: Zone, source: string, isReject: boolean) {
      if (!resolveFunc) {
        return resolveFunc;
      }
      return (val: any) => {
        const task = zone.scheduleMicroTask(source, () => {
          return typeof resolveFunc === 'function' ? resolveFunc(val) :
                                                     (isReject ? Promise.reject(val) : val);
        }, undefined, () => {});
        return zone.runGuarded(() => {
          return task.invoke();
        }, undefined, []);
      };
    };

    Ctor.prototype.then = function(onResolve: any, onReject: any) {
      const zone = Zone.current;
      return originalThen.call(
          this, makeResolver(onResolve, zone, 'Promise.prototype.then', false),
          makeResolver(onReject, zone, 'Promise.prototype.reject', true));
    };
    (Ctor as any)[symbolThenPatched] = true;
  }

  api.patchThen = patchThen;

  if (Promise) {
    patchThen(Promise);
  }

  global[api.symbol('Promise')] = Promise;
  return Promise;
});
