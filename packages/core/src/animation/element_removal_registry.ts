/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AnimationClassFunction,
  AnimationDetails,
  AnimationEventFunction,
  AnimationFunction,
} from './interfaces';

export interface AnimationRemovalRegistry {
  elements: ElementRegistry | undefined;
}

/**
 * Registers elements for delayed removal action for animation in the case
 * that `animate.leave` is used. This stores the target element and any
 * classes, class resolvers, and callback functions that may be needed
 * to apply the removal animation, and then stashes the actual element
 * removal function from the dom renderer to be called after the
 * animation is finished.
 */
export class ElementRegistry {
  private outElements = new WeakMap<Element, AnimationDetails>();

  remove(el: Element): void {
    this.outElements.delete(el);
  }

  /** Used when animate.leave is only applying classes */
  trackClasses(details: AnimationDetails, classes: string | string[]): void {
    const classList = getClassListFromValue(classes);
    if (!classList) return;
    
    // Ensure details.classes is initialized
    if (!details.classes) {
      details.classes = new Set<string>();
    }
    
    for (let klass of classList) {
      details.classes.add(klass);
    }
  }

  /** Used when animate.leave is applying classes via a bound attribute
   *  which requires resolving the binding function at the right time
   *  to get the proper class list. There may be multiple resolvers due
   *  to composition via host bindings.
   */
  trackResolver(details: AnimationDetails, resolver: Function): void {
    if (!details.classFns) {
      details.classFns = [];
    }
    details.classFns.push(resolver);
  }

  /** Used when `animate.leave` is using the function signature and will have a
   *  callback function, rather than a list of classes.
   */
  addCallback(
    el: Element,
    value: AnimationFunction,
    animateWrapperFn: AnimationEventFunction,
  ): void {
    const details = this.outElements.get(el) ?? {
      classes: null,
      classFns: undefined,
      animateFn: () => {},
    };
    details.animateFn = animateWrapperFn(el, value);
    this.outElements.set(el, details);
  }

  /** Used when `animate.leave` is using classes. */
  add(el: Element, value: string | string[] | Function, animateWrapperFn: AnimationClassFunction) {
    const details = this.outElements.get(el) ?? {
      classes: new Set<string>(),
      classFns: undefined,
      animateFn: (): void => {},
    };
    
    if (typeof value === 'function') {
      this.trackResolver(details, value);
    } else {
      this.trackClasses(details, value);
    }
    
    details.animateFn = animateWrapperFn(el, details.classes, details.classFns);
    this.outElements.set(el, details);
  }

  has(el: Element): boolean {
    return this.outElements.has(el);
  }

  /** This is called by the dom renderer to actually initiate the animation
   *  using the animateFn stored in the registry. The DOM renderer passes in
   *  the removal function to be fired off when the animation finishes.
   *  Properly implements:
   *   - Emits animationend for class-based animate.leave
   *   - Coordinates nested animations
   *   - Restricts timeout to event/callback-based removals
   */
  animate(el: Element, removeFn: Function, maxAnimationTimeout: number): void {
    if (!this.outElements.has(el)) return removeFn();
    
    const details = this.outElements.get(el)!;
    let called = false;
    
    const remove = () => {
      if (called) return;
      called = true;
      this.remove(el);
      removeFn();
    };
    
    // Helper to check for child elements with ongoing animations
    const hasAnimatedChildren = (parent: Element): boolean => {
      for (const child of Array.from(parent.children)) {
        if (this.has(child as Element)) return true;
      }
      return false;
    };
    
    // Helper to wait for child animations to complete
    const waitForChildren = (callback: () => void) => {
      if (!hasAnimatedChildren(el)) {
        callback();
        return;
      }
      
      // Poll for child completion
      const pollInterval = 50; // ms
      const poll = setInterval(() => {
        if (!hasAnimatedChildren(el)) {
          clearInterval(poll);
          callback();
        }
      }, pollInterval);
    };
    
    // Case 1: Function/callback-based animation
    if (typeof details.animateFn === 'function' && details.classes == null) {
      let timeoutId: ReturnType<typeof setTimeout>;
      timeoutId = setTimeout(remove, maxAnimationTimeout);
      
      details.animateFn(() => {
        clearTimeout(timeoutId);
        waitForChildren(remove);
      });
      
      return;
    }
    
    // Case 2: Class-based animation
    if (details.classes && details.classes.size > 0) {
      // Listen for animationend on the element
      const onAnimationEnd = (event: Event) => {
        const animEvent = event as AnimationEvent;
        if (animEvent.target === el) {
          el.removeEventListener('animationend', onAnimationEnd);
          waitForChildren(remove);
        }
      };
      
      el.addEventListener('animationend', onAnimationEnd);
      
      // Calculate fallback timeout based on animation duration
      const computedStyle = window.getComputedStyle(el);
      const duration = parseFloat(computedStyle.animationDuration) || 0;
      const delay = parseFloat(computedStyle.animationDelay) || 0;
      const fallbackTimeout = Math.max(
        (duration + delay) * 1000 + 100, // Animation duration + delay + buffer
        100 // Minimum timeout
      );
      
      // Set up fallback timeout
      const fallbackTimeoutId = setTimeout(() => {
        el.removeEventListener('animationend', onAnimationEnd);
        if (!called) {
          waitForChildren(remove);
        }
      }, Math.min(fallbackTimeout, maxAnimationTimeout));
      
      return;
    }
    
    // Case 3: No animation, remove immediately
    remove();
  }
}

export function getClassListFromValue(value: string | Function | string[]): string[] | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  let classes: any = value;
  if (typeof value === 'function') {
    try {
      classes = value();
    } catch (e) {
      console.error('Error resolving class function:', e);
      return null;
    }
  }
  
  if (classes === null || classes === undefined) {
    return null;
  }
  
  let classList: string[] | null = null;
  
  if (Array.isArray(classes)) {
    classList = classes.filter((cls): cls is string => typeof cls === 'string' && cls.trim() !== '');
  } else if (typeof classes === 'string') {
    classList = classes
      .trim()
      .split(/\s+/)
      .filter((cls) => cls !== '');
  }
  
  return classList && classList.length > 0 ? classList : null;
}