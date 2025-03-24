/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '../lib/mocha/mocha';
declare const global: any;

((context: any) => {
  context['jasmine'] = context['jasmine'] || {};
  context['jasmine'].createSpy = function (spyName: string) {
    let spy: any = function (...params: any[]) {
      spy.countCall++;
      spy.callArgs = params;
    };

    spy.countCall = 0;

    return spy;
  };

  function eq(a: any, b: any) {
    if (a === b) {
      return true;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }

      let isEqual = true;

      for (let prop in a) {
        if (a.hasOwnProperty(prop)) {
          if (!eq(a[prop], b[prop])) {
            isEqual = false;
            break;
          }
        }
      }

      return isEqual;
    } else if (typeof a === 'object' && typeof b === 'object') {
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }

      let isEqual = true;

      for (let prop in a) {
        if (a.hasOwnProperty(prop)) {
          if (!eq(a[prop], b[prop])) {
            isEqual = false;
            break;
          }
        }
      }

      return isEqual;
    }

    return false;
  }

  context['expect'] = function (expected: any) {
    return {
      toBe: function (actual: any) {
        if (expected !== actual) {
          throw new Error(`Expected ${expected} to be ${actual}`);
        }
      },
      toEqual: function (actual: any) {
        if (!eq(expected, actual)) {
          throw new Error(`Expected ${expected} to be ${actual}`);
        }
      },
      toBeGreaterThan: function (actual: number) {
        if (expected <= actual) {
          throw new Error(`Expected ${expected} to be greater than ${actual}`);
        }
      },
      toBeLessThan: function (actual: number) {
        if (expected >= actual) {
          throw new Error(`Expected ${expected} to be lesser than ${actual}`);
        }
      },
      toBeDefined: function () {
        if (!expected) {
          throw new Error(`Expected ${expected} to be defined`);
        }
      },
      toThrow: function () {
        try {
          expected();
        } catch (error) {
          return;
        }

        throw new Error(`Expected ${expected} to throw`);
      },
      toThrowError: function (errorToBeThrow: any) {
        try {
          expected();
        } catch (error) {
          return;
        }

        throw Error(`Expected ${expected} to throw: ${errorToBeThrow}`);
      },
      toBeTruthy: function () {
        if (!expected) {
          throw new Error(`Expected ${expected} to be truthy`);
        }
      },
      toBeFalsy: function (actual: any) {
        if (!!actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: function (actual: any) {
        if (expected.indexOf(actual) === -1) {
          throw new Error(`Expected ${expected} to contain ${actual}`);
        }
      },
      toHaveBeenCalled: function () {
        if (expected.countCall === 0) {
          throw new Error(`Expected ${expected} to been called`);
        }
      },
      toHaveBeenCalledWith: function (...params: any[]) {
        if (!eq(expected.callArgs, params)) {
          throw new Error(
            `Expected ${expected} to been called with ${expected.callArgs}, called with: ${params}`,
          );
        }
      },
      toMatch: function (actual: any) {
        if (!new RegExp(actual).test(expected)) {
          throw new Error(`Expected ${expected} to match ${actual}`);
        }
      },
      not: {
        toBe: function (actual: any) {
          if (expected === actual) {
            throw new Error(`Expected ${expected} not to be ${actual}`);
          }
        },
        toHaveBeenCalled: function () {
          if (expected.countCall > 0) {
            throw new Error(`Expected ${expected} to not been called`);
          }
        },
        toThrow: function () {
          try {
            expected();
          } catch (error) {
            throw new Error(`Expected ${expected} to not throw`);
          }
        },
        toThrowError: function () {
          try {
            expected();
          } catch (error) {
            throw Error(`Expected ${expected} to not throw error`);
          }
        },
        toBeGreaterThan: function (actual: number) {
          if (expected > actual) {
            throw new Error(`Expected ${expected} not to be greater than ${actual}`);
          }
        },
        toBeLessThan: function (actual: number) {
          if (expected < actual) {
            throw new Error(`Expected ${expected} not to be lesser than ${actual}`);
          }
        },
        toHaveBeenCalledWith: function (params: any[]) {
          if (!eq(expected.callArgs, params)) {
            throw new Error(`Expected ${expected} to not been called with ${params}`);
          }
        },
      },
    };
  };
})(globalThis);
