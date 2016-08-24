/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as mock_animation_player from './mock_animation_player'
import * as test_compiler from './test_compiler';

export interface __core_private_testing_types__ {
  TestingCompiler: test_compiler.TestingCompiler;
  TestingCompilerFactory: test_compiler.TestingCompilerFactory;
  MockAnimationPlayer: mock_animation_player.MockAnimationPlayer;
}

export var __core_private_testing__ = {
  TestingCompiler: test_compiler.TestingCompiler,
  TestingCompilerFactory: test_compiler.TestingCompilerFactory,
  MockAnimationPlayer: mock_animation_player.MockAnimationPlayer
};
