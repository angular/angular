/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Subject} from 'rxjs';
/**
 *  Class for profiling angular applications. Handles hook subscriptions and emitting change
 * detection events.
 */
export class Profiler {
  constructor(config = {}) {
    /** @internal */
    this._inChangeDetection = false;
    this.changeDetection$ = new Subject();
    this._hooks = [];
    this._hooks.push(config);
  }
  subscribe(config) {
    this._hooks.push(config);
  }
  unsubscribe(config) {
    this._hooks.splice(this._hooks.indexOf(config), 1);
  }
  /** @internal */
  _onCreate(_, __, id, ___, position) {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onCreate', arguments);
  }
  /** @internal */
  _onDestroy(_, __, id, ___, position) {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onDestroy', arguments);
  }
  /** @internal */
  _onChangeDetectionStart(_, __, id, position) {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionStart', arguments);
  }
  /** @internal */
  _onChangeDetectionEnd(_, __, id, position) {
    if (id === undefined || position === undefined) {
      return;
    }
    this._invokeCallback('onChangeDetectionEnd', arguments);
  }
  /** @internal */
  _onLifecycleHookStart(_, __, ___, id, ____) {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onLifecycleHookStart', arguments);
  }
  /** @internal */
  _onLifecycleHookEnd(_, __, ___, id, ____) {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onLifecycleHookEnd', arguments);
  }
  /** @internal */
  _onOutputStart(_, __, ___, id, ____) {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onOutputStart', arguments);
  }
  /** @internal */
  _onOutputEnd(_, __, ___, id, ____) {
    if (id === undefined) {
      return;
    }
    this._invokeCallback('onOutputEnd', arguments);
  }
  /** @internal */
  _invokeCallback(name, args) {
    this._hooks.forEach((config) => {
      const cb = config[name];
      if (typeof cb === 'function') {
        cb.apply(null, args);
      }
    });
  }
}
const hookNames = [
  'OnInit',
  'OnDestroy',
  'OnChanges',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
];
const hookMethodNames = new Set(hookNames.map((hook) => `ng${hook}`));
export const getLifeCycleName = (obj, fn) => {
  const proto = Object.getPrototypeOf(obj);
  const keys = Object.getOwnPropertyNames(proto);
  for (const propName of keys) {
    // We don't want to touch random get accessors.
    if (!hookMethodNames.has(propName)) {
      continue;
    }
    if (proto[propName] === fn) {
      return propName;
    }
  }
  const fnName = fn.name;
  if (typeof fnName !== 'string') {
    return 'unknown';
  }
  for (const hookName of hookNames) {
    if (fnName.indexOf(hookName) >= 0) {
      return `ng${hookName}`;
    }
  }
  return 'unknown';
};
//# sourceMappingURL=shared.js.map
