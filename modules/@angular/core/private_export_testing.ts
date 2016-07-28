/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as test_compiler from './testing/test_compiler';

export declare namespace __core_private_testing_types__ {
  export type TestingCompiler = test_compiler.TestingCompiler;
  export var TestingCompiler: typeof test_compiler.TestingCompiler;
  export type TestingCompilerFactory = test_compiler.TestingCompilerFactory;
  export var TestingCompilerFactory: typeof test_compiler.TestingCompilerFactory;
}

export var __core_private_testing__ = {
  TestingCompiler: test_compiler.TestingCompiler,
  TestingCompilerFactory: test_compiler.TestingCompilerFactory
};
