/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HybridCompiler, type IAnalyzer} from '../src/hybrid_compiler.js';

// The constructor never touches the analyzer.
const analyzer = {} as IAnalyzer;

describe('forbidOrphanComponents option validation', () => {
  it('rejects disabling JIT support when forbidOrphanComponents is set', () => {
    expect(
      () => new HybridCompiler(analyzer, {forbidOrphanComponents: true, supportJitMode: false}),
    ).toThrowError(
      'JIT mode support ("supportJitMode" option) cannot be disabled when forbidOrphanComponents is set to true',
    );
  });

  const cases = [
    {forbidOrphanComponents: true, supportJitMode: true},
    {forbidOrphanComponents: true},
    {forbidOrphanComponents: false, supportJitMode: false},
  ];

  for (const options of cases) {
    it(`accepts ${JSON.stringify(options)}`, () => {
      expect(new HybridCompiler(analyzer, options).forbidOrphanComponents).toBe(
        options.forbidOrphanComponents,
      );
    });
  }
});
