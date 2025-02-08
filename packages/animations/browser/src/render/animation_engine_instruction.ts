/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const enum AnimationTransitionInstructionType {
  TransitionAnimation,
  TimelineAnimation,
}

export interface AnimationEngineInstruction {
  type: AnimationTransitionInstructionType;
}
