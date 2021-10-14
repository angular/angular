/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** The possible ways the browser may handle the horizontal scroll axis in RTL languages. */
export const enum RtlScrollAxisType {
  /**
   * scrollLeft is 0 when scrolled all the way left and (scrollWidth - clientWidth) when scrolled
   * all the way right.
   */
  NORMAL,
  /**
   * scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  NEGATED,
  /**
   * scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  INVERTED,
}

/** Cached result of the way the browser handles the horizontal scroll axis in RTL mode. */
let rtlScrollAxisType: RtlScrollAxisType | undefined;

/** Cached result of the check that indicates whether the browser supports scroll behaviors. */
let scrollBehaviorSupported: boolean | undefined;

/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior(): boolean {
  if (scrollBehaviorSupported == null) {
    // If we're not in the browser, it can't be supported. Also check for `Element`, because
    // some projects stub out the global `document` during SSR which can throw us off.
    if (typeof document !== 'object' || !document || typeof Element !== 'function' || !Element) {
      scrollBehaviorSupported = false;
      return scrollBehaviorSupported;
    }

    // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
    if ('scrollBehavior' in document.documentElement!.style) {
      scrollBehaviorSupported = true;
    } else {
      // At this point we have 3 possibilities: `scrollTo` isn't supported at all, it's
      // supported but it doesn't handle scroll behavior, or it has been polyfilled.
      const scrollToFunction: Function | undefined = Element.prototype.scrollTo;

      if (scrollToFunction) {
        // We can detect if the function has been polyfilled by calling `toString` on it. Native
        // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
        // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
        // polyfilled functions as supporting scroll behavior.
        scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
      } else {
        scrollBehaviorSupported = false;
      }
    }
  }

  return scrollBehaviorSupported;
}

/**
 * Checks the type of RTL scroll axis used by this browser. As of time of writing, Chrome is NORMAL,
 * Firefox & Safari are NEGATED, and IE & Edge are INVERTED.
 */
export function getRtlScrollAxisType(): RtlScrollAxisType {
  // We can't check unless we're on the browser. Just assume 'normal' if we're not.
  if (typeof document !== 'object' || !document) {
    return RtlScrollAxisType.NORMAL;
  }

  if (rtlScrollAxisType == null) {
    // Create a 1px wide scrolling container and a 2px wide content element.
    const scrollContainer = document.createElement('div');
    const containerStyle = scrollContainer.style;
    scrollContainer.dir = 'rtl';
    containerStyle.width = '1px';
    containerStyle.overflow = 'auto';
    containerStyle.visibility = 'hidden';
    containerStyle.pointerEvents = 'none';
    containerStyle.position = 'absolute';

    const content = document.createElement('div');
    const contentStyle = content.style;
    contentStyle.width = '2px';
    contentStyle.height = '1px';

    scrollContainer.appendChild(content);
    document.body.appendChild(scrollContainer);

    rtlScrollAxisType = RtlScrollAxisType.NORMAL;

    // The viewport starts scrolled all the way to the right in RTL mode. If we are in a NORMAL
    // browser this would mean that the scrollLeft should be 1. If it's zero instead we know we're
    // dealing with one of the other two types of browsers.
    if (scrollContainer.scrollLeft === 0) {
      // In a NEGATED browser the scrollLeft is always somewhere in [-maxScrollAmount, 0]. For an
      // INVERTED browser it is always somewhere in [0, maxScrollAmount]. We can determine which by
      // setting to the scrollLeft to 1. This is past the max for a NEGATED browser, so it will
      // return 0 when we read it again.
      scrollContainer.scrollLeft = 1;
      rtlScrollAxisType =
        scrollContainer.scrollLeft === 0 ? RtlScrollAxisType.NEGATED : RtlScrollAxisType.INVERTED;
    }

    scrollContainer.remove();
  }
  return rtlScrollAxisType;
}
