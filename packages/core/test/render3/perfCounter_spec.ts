/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ngDevModeResetPerfCounters} from '../../src/util/ng_dev_mode';

beforeEach(ngDevModeResetPerfCounters);
beforeEach(() => {
  jasmine.addMatchers({
    toHaveProperties: function(util, customEqualityTesters) {
      return {compare: toHavePropertiesCompare};
    }
  });
});
function toHavePropertiesCompare(actual: any, expected: any) {
  let pass = true;
  let errors = [];
  for (let key of Object.keys(actual)) {
    if (expected.hasOwnProperty(key)) {
      if (actual[key] !== expected[key]) {
        pass = false;
        errors.push(`Expected '${key}' to be '${expected[key]}' but was '${actual[key]}'.`);
      }
    }
  }
  return {pass: pass, message: errors.join('\n')};
}

describe('toHaveProperties', () => {
  it('should pass', () => {
    expect({tNode: 1}).toHaveProperties({});
    expect({tNode: 2}).toHaveProperties({tNode: 2});
  });

  it('should fail', () => {
    expect(toHavePropertiesCompare({tNode: 2, tView: 4}, {tNode: 3, tView: 5})).toEqual({
      pass: false,
      message:
          'Expected \'tNode\' to be \'3\' but was \'2\'.\nExpected \'tView\' to be \'5\' but was \'4\'.'
    });
  });
});
