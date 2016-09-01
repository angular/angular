/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as mock_animation_player from './mock_animation_player';
import * as test_compiler from './test_compiler';

export var __core_private_testing__: {
  TestingCompiler: typeof test_compiler.TestingCompiler,
  _TestingCompiler?: test_compiler.TestingCompiler,
  TestingCompilerFactory: typeof test_compiler.TestingCompilerFactory,
  _TestingCompilerFactory?: test_compiler.TestingCompilerFactory,
  MockAnimationPlayer: typeof mock_animation_player.MockAnimationPlayer
  _MockAnimationPlayer?: mock_animation_player.MockAnimationPlayer
} = {
  TestingCompiler: test_compiler.TestingCompiler,
  TestingCompilerFactory: test_compiler.TestingCompilerFactory,
  MockAnimationPlayer: mock_animation_player.MockAnimationPlayer
};
