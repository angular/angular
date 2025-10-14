export function createTimelineInstruction(
  element,
  keyframes,
  preStyleProps,
  postStyleProps,
  duration,
  delay,
  easing = null,
  subTimeline = false,
) {
  return {
    type: 1 /* AnimationTransitionInstructionType.TimelineAnimation */,
    element,
    keyframes,
    preStyleProps,
    postStyleProps,
    duration,
    delay,
    totalTime: duration + delay,
    easing,
    subTimeline,
  };
}
//# sourceMappingURL=animation_timeline_instruction.js.map
