/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as test_compiler from './testing/test_compiler';
import * as test_component_builder from './testing/test_component_builder';

export declare namespace __core_private_testing_types__ {
  export type TestingCompiler = test_compiler.TestingCompiler;
  export var TestingCompiler: typeof test_compiler.TestingCompiler;
  export type TestingCompilerFactory = test_compiler.TestingCompilerFactory;
  export var TestingCompilerFactory: typeof test_compiler.TestingCompilerFactory;
  export type TestComponentBuilder = test_component_builder.TestComponentBuilder;
  export var TestComponentBuilder: typeof test_component_builder.TestComponentBuilder;
}

export var __core_private_testing__ = {
  TestingCompiler: test_compiler.TestingCompiler,
  TestingCompilerFactory: test_compiler.TestingCompilerFactory,
  TestComponentBuilder: test_component_builder.TestComponentBuilder,
};
