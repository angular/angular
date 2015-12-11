library angular2.src.animate.css_animation_options;

class CssAnimationOptions {
  /** initial styles for the element */
  Map<String, dynamic> fromStyles;
  /** destination styles for the element */
  Map<String, dynamic> toStyles;
  /** classes to be added to the element */
  List<String> classesToAdd = [];
  /** classes to be removed from the element */
  List<String> classesToRemove = [];
  /** classes to be added for the duration of the animation */
  List<String> animationClasses = [];
  /** override the duration of the animation (in milliseconds) */
  num duration;
  /** override the transition delay (in milliseconds) */
  num delay;
}
