export class CssAnimationOptions {
  /** initial styles for the element */
  fromStyles: StringMap<string, any>;

  /** destination styles for the element */
  toStyles: StringMap<string, any>;

  /** classes to be added to the element */
  classesToAdd: string[] = [];

  /** classes to be removed from the element */
  classesToRemove: string[] = [];

  /** classes to be added for the duration of the animation */
  animationClasses: string[] = [];

  /** override the duration of the animation (in milliseconds) */
  duration: number;

  /** override the transition delay (in milliseconds) */
  delay: number;
}
