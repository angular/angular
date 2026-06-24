/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="node"/>

'use strict';

const global: any = globalThis;
export function setupFakePolyfill(): void {
  // add custom properties to Native Error
  const NativeError = global['Error'];
  NativeError.customProperty = 'customProperty';
  NativeError.customFunction = function () {};

  // add fake cordova polyfill for test
  const fakeCordova = function () {};

  (fakeCordova as any).exec = function (
    success: Function,
    error: Function,
    service: string,
    action: string,
    args: any[],
  ) {
    if (action === 'successAction') {
      success();
    } else {
      error();
    }
  };

  global.cordova = fakeCordova;

  const TestTarget = (global.TestTarget = function () {});

  Object.defineProperties(TestTarget.prototype, {
    'onprop1': {configurable: true, writable: true},
    'onprop2': {configurable: true, writable: true},
    'onprop3': {
      configurable: true,
      get: function () {
        return this._onprop3;
      },
      set: function (_value) {
        this._onprop3 = _value;
      },
    },
    '_onprop3': {configurable: true, writable: true, value: function () {}},
    'addEventListener': {
      configurable: true,
      writable: true,
      value: function (eventName: string, callback: Function) {
        if (!this.events) {
          this.events = {};
        }
        const Zone = global.Zone;
        this.events.eventName = {zone: Zone.current, callback: callback};
      },
    },
    'removeEventListener': {
      configurable: true,
      writable: true,
      value: function (eventName: string, callback: Function) {
        if (!this.events) {
          return;
        }
        this.events.eventName = null;
      },
    },
    'dispatchEvent': {
      configurable: true,
      writable: true,
      value: function (eventName: string) {
        const zoneCallback = this.events && this.events.eventName;
        zoneCallback && zoneCallback.zone.run(zoneCallback.callback, this, [{type: eventName}]);
      },
    },
  });

  // Zone symbol prefix may be set in *-env-setup.ts (browser & node),
  // but this file is used in multiple scenarios, and Zone isn't loaded at this point yet.
  const zoneSymbolPrefix = global['__Zone_symbol_prefix'] || '__zone_symbol__';

  global['__Zone_ignore_on_properties'] = [
    {target: TestTarget.prototype, ignoreProperties: ['prop1']},
  ];
  global[zoneSymbolPrefix + 'FakeAsyncTestMacroTask'] = [{source: 'TestClass.myTimeout'}];
  // will not monkey patch scroll and wheel event.
  global[zoneSymbolPrefix + 'UNPATCHED_EVENTS'] = ['scroll', 'wheel'];
  // touchstart and scroll will be passive by default.
  global[zoneSymbolPrefix + 'PASSIVE_EVENTS'] = ['touchstart', 'scroll'];
}
