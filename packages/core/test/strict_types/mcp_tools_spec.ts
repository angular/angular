/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideExperimentalWebMcpTools} from '../../src/webmcp/provide_tools';

describe('provideExperimentalWebMcpTools', () => {
  // Regression test for https://github.com/angular/angular/issues/70125
  //
  // Each tool passed to `provideExperimentalWebMcpTools` must infer its own
  // argument types from its own `inputSchema`. Previously the function inferred
  // a single shared `InputSchema` for the whole array, so heterogeneous tools
  // lost their `execute` argument types (each `args` was widened to
  // `Record<string, unknown>`), making the `arg1`/`arg2` accesses below type
  // errors. This file intentionally fails to compile on the unfixed signature.
  it('should preserve per-tool argument types for heterogeneous input schemas', () => {
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
          const arg1 = args.arg1; // must be inferred as `number`
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
          const arg2 = args.arg2; // must be inferred as `string`
          return `arg2 string value is ${arg2.trim()}`;
        },
      },
    ]);
  });
});
