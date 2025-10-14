/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function createTransitionInstruction(
  element,
  triggerName,
  fromState,
  toState,
  isRemovalTransition,
  fromStyles,
  toStyles,
  timelines,
  queriedElements,
  preStyleProps,
  postStyleProps,
  totalTime,
  errors,
) {
  return {
    type: 0 /* AnimationTransitionInstructionType.TransitionAnimation */,
    element,
    triggerName,
    isRemovalTransition,
    fromState,
    fromStyles,
    toState,
    toStyles,
    timelines,
    queriedElements,
    preStyleProps,
    postStyleProps,
    totalTime,
    errors,
  };
}
//# sourceMappingURL=animation_transition_instruction.js.map
