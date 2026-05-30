/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine"/>

'use strict';
(function (global) {
  const log: string[] = [];
  const logArgs: any[][] = [];
  const wtfMock = {
    log: log,
    logArgs: logArgs,
    reset: function () {
      log.length = 0;
      logArgs.length = 0;
    },
    trace: {
      leaveScope: function (scope: any, returnValue: any) {
        return scope(returnValue);
      },
      beginTimeRange: function (type: any, action: any) {
        logArgs.push([]);
        log.push('>>> ' + type + '[' + action + ']');
        return function () {
          logArgs.push([]);
          log.push('<<< ' + type);
        };
      },
      endTimeRange: function (range: Function) {
        range();
      },
      events: {
        createScope: function (signature: string, flags: any) {
          const parts = signature.split('(');
          const name = parts[0];
          return function scopeFn() {
            const args = [];
            for (let i = arguments.length - 1; i >= 0; i--) {
              const arg = arguments[i];
              if (arg !== undefined) {
                args.unshift(__stringify(arg));
              }
            }
            log.push('> ' + name + '(' + args.join(', ') + ')');
            logArgs.push(args);
            return function (retValue: any) {
              log.push('< ' + name + (retValue == undefined ? '' : ' => ' + retValue));
              logArgs.push(retValue);
              return retValue;
            };
          };
        },
        createInstance: function (signature: string, flags: any) {
          const parts = signature.split('(');
          const name = parts[0];
          return function eventFn() {
            const args = [];
            for (let i = arguments.length - 1; i >= 0; i--) {
              const arg = arguments[i];
              if (arg !== undefined) {
                args.unshift(__stringify(arg));
              }
            }
            log.push('# ' + name + '(' + args.join(', ') + ')');
            logArgs.push(args);
          };
        },
      },
    },
  };

  function __stringify(obj: any): string {
    let str = typeof obj == 'string' || !obj ? JSON.stringify(obj) : obj.toString();
    if (str == '[object Arguments]') {
      str = JSON.stringify(Array.prototype.slice.call(obj));
    } else if (str == '[object Object]') {
      str = JSON.stringify(obj);
    }
    return str;
  }

  beforeEach(function () {
    wtfMock.reset();
  });

  (<any>global).wtfMock = wtfMock;
  (<any>global).wtf = wtfMock;
})(globalThis);

declare const wtfMock: any;
