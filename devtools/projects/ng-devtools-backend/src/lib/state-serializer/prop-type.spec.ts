/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType} from '../../../../protocol';

import {getPropType} from './prop-type';

describe('getPropType', () => {
  const testCases = [
    {
      expression: 123,
      propType: PropType.Number,
      propTypeName: 'Number',
    },
    {
      expression: 'John Lennon',
      propType: PropType.String,
      propTypeName: 'String',
    },
    {
      expression: null,
      propType: PropType.Null,
      propTypeName: 'Null',
    },
    {
      expression: undefined,
      propType: PropType.Undefined,
      propTypeName: 'Undefined',
    },
    {
      expression: Symbol.iterator,
      propType: PropType.Symbol,
      propTypeName: 'Symbol',
    },
    {
      expression: true,
      propType: PropType.Boolean,
      propTypeName: 'Boolean',
    },
    {
      expression: 123n,
      propType: PropType.BigInt,
      propTypeName: 'BigInt',
    },
    {
      expression: Math.random,
      propType: PropType.Function,
      propTypeName: 'Function',
    },
    {
      expression: Math,
      propType: PropType.Object,
      propTypeName: 'Object',
    },
    {
      expression: new Date(),
      propType: PropType.Date,
      propTypeName: 'Date',
    },
    {
      expression: ['John', 40],
      propType: PropType.Array,
      propTypeName: 'Array',
    },
    {
      expression: new Set([1, 2, 3, 4, 5]),
      propType: PropType.Set,
      propTypeName: 'Set',
    },
    {
      expression: new Map<unknown, unknown>([
        ['name', 'John'],
        ['age', 40],
        [{id: 123}, undefined],
      ]),
      propType: PropType.Map,
      propTypeName: 'Map',
    },
  ];
  for (const {expression, propType, propTypeName} of testCases) {
    it(`should determine ${String(expression)} as PropType:${propTypeName}(${propType})`, () => {
      const actual = getPropType(expression);
      expect(actual).toBe(actual);
    });
  }
});
