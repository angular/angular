/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface LongestAnimation {
  animationName: string | undefined;
  propertyName: string | undefined;
  duration: number;
}

/** Parses a CSS time value to milliseconds. */
function parseCssTimeUnitsToMs(value: string): number {
  // Some browsers will return it in seconds, whereas others will return milliseconds.
  const multiplier = value.toLowerCase().indexOf('ms') > -1 ? 1 : 1000;
  return parseFloat(value) * multiplier;
}

/** Parses out multiple values from a computed style into an array. */
function parseCssPropertyValue(computedStyle: CSSStyleDeclaration, name: string): string[] {
  const value = computedStyle.getPropertyValue(name);
  return value.split(',').map((part) => part.trim());
}

/** Gets the transform transition duration, including the delay, of an element in milliseconds. */
function getLongestComputedTransition(computedStyle: CSSStyleDeclaration): LongestAnimation {
  const transitionedProperties = parseCssPropertyValue(computedStyle, 'transition-property');
  const rawDurations = parseCssPropertyValue(computedStyle, 'transition-duration');
  const rawDelays = parseCssPropertyValue(computedStyle, 'transition-delay');
  const longest = {propertyName: '', duration: 0, animationName: undefined};
  for (let i = 0; i < transitionedProperties.length; i++) {
    const duration = parseCssTimeUnitsToMs(rawDelays[i]) + parseCssTimeUnitsToMs(rawDurations[i]);
    if (duration > longest.duration) {
      longest.propertyName = transitionedProperties[i];
      longest.duration = duration;
    }
  }
  return longest;
}

function getLongestComputedAnimation(computedStyle: CSSStyleDeclaration): LongestAnimation {
  const rawNames = parseCssPropertyValue(computedStyle, 'animation-name');
  const rawDelays = parseCssPropertyValue(computedStyle, 'animation-delay');
  const rawDurations = parseCssPropertyValue(computedStyle, 'animation-duration');
  const longest: LongestAnimation = {animationName: '', propertyName: undefined, duration: 0};
  for (let i = 0; i < rawNames.length; i++) {
    const duration = parseCssTimeUnitsToMs(rawDelays[i]) + parseCssTimeUnitsToMs(rawDurations[i]);
    if (duration > longest.duration) {
      longest.animationName = rawNames[i];
      longest.duration = duration;
    }
  }
  return longest;
}

/**
 * Determines the longest animation, but with `getComputedStyles` instead of `getAnimations`. This
 * is ultimately safer than getAnimations because it can be used when recalculations are in
 * progress. `getAnimations()` will be empty in that case.
 */
function determineLongestAnimationFromComputedStyles(
  el: HTMLElement,
  animationsMap: WeakMap<HTMLElement, LongestAnimation>,
): void {
  const computedStyle = getComputedStyle(el);

  const longestAnimation = getLongestComputedAnimation(computedStyle);
  const longestTransition = getLongestComputedTransition(computedStyle);

  const longest =
    longestAnimation.duration > longestTransition.duration ? longestAnimation : longestTransition;
  if (animationsMap.has(el) && animationsMap.get(el)!.duration > longest.duration) {
    return;
  }
  animationsMap.set(el, longest);
}

/**
 * Multiple animations can be set on an element. This grabs an element and
 * determines which of those will be the longest duration. If we didn't do
 * this, elements would be removed whenever the first animation completes.
 * This ensures we get the longest running animation and only remove when
 * that animation completes.
 */
export function determineLongestAnimation(
  event: AnimationEvent | TransitionEvent,
  el: HTMLElement,
  animationsMap: WeakMap<HTMLElement, LongestAnimation>,
  areAnimationSupported: boolean,
): void {
  if (!areAnimationSupported || !(event.target instanceof Element) || event.target !== el) return;
  const animations = el.getAnimations();
  return animations.length === 0
    ? // fallback to computed styles if getAnimations is empty. This would happen if styles are
      // currently recalculating due to a reflow happening elsewhere.
      determineLongestAnimationFromComputedStyles(el, animationsMap)
    : determineLongestAnimationFromElementAnimations(el, animationsMap, animations);
}

function determineLongestAnimationFromElementAnimations(
  el: HTMLElement,
  animationsMap: WeakMap<HTMLElement, LongestAnimation>,
  animations: Animation[],
): void {
  let currentLongest: LongestAnimation = {
    animationName: undefined,
    propertyName: undefined,
    duration: 0,
  };
  for (const animation of animations) {
    const timing = animation.effect?.getTiming();
    // duration can be a string 'auto' or a number.
    const animDuration = typeof timing?.duration === 'number' ? timing.duration : 0;
    let duration = (timing?.delay ?? 0) + animDuration;

    let propertyName: string | undefined;
    let animationName: string | undefined;

    if ((animation as CSSAnimation).animationName) {
      animationName = (animation as CSSAnimation).animationName;
    } else {
      // Check for CSSTransition specific property
      propertyName = (animation as CSSTransition).transitionProperty;
    }

    if (duration >= currentLongest.duration) {
      currentLongest = {animationName, propertyName, duration};
    }
  }
  if (animationsMap.has(el) && animationsMap.get(el)!.duration > currentLongest.duration) {
    return;
  }
  animationsMap.set(el, currentLongest);
}
