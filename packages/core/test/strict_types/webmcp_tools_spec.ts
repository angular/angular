/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideExperimentalWebMcpTools} from '../../src/core';

describe('provideExperimentalWebMcpTools strict type checking', () => {
  // Verify that each tool infers its own `execute` argument types from its own `inputSchema`
  // when tools with heterogeneous input schemas are provided together. With a single generic
  // shared by the whole array, TypeScript unifies the schemas and the `arg1`/`arg2` accesses
  // below would not type-check.
  // https://github.com/angular/angular/issues/70125
  it('should compile without errors', () => {
    provideExperimentalWebMcpTools([
      {
        name: 'tool1',
        description: 'Tool #1',
        inputSchema: {
          type: 'object',
          properties: {
            arg1: {type: 'number'},
          },
          required: ['arg1'],
        },
        execute: (args) => {
          const arg1: number = args.arg1;
          return `arg1 number value is ${arg1.toFixed()}`;
        },
      },
      {
        name: 'tool2',
        description: 'Tool #2',
        inputSchema: {
          type: 'object',
          properties: {
            arg2: {type: 'string'},
          },
          required: ['arg2'],
        },
        execute: (args) => {
          const arg2: string = args.arg2;
          return `arg2 string value is ${arg2.trim()}`;
        },
      },
    ]);
  });
});
