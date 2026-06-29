/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '@angular/core';
import {
  Highlight,
  HighlightLabelProps,
  HighlightTemplate,
  HighlightLabelDefinition,
  HighlightType,
} from './highlights';
import {createOverlayWithLabels, getComponentRect} from './dom';
import {findDirectiveAndHost} from '../component-tree/component-tree';

// A global synchronous event emitter that handles all highlight destroy events.
const highlightDestroyEvents = new EventEmitter<[highlight: Highlight]>();

// The main data structure which stores all currently active highlights per target element.
const activeHighlights = new WeakMap<Element, Highlight[]>();

// An array with all target elements, weakly-referenced.
// It acts as a helper for iterating over all highlights contained in the WeakMap.
const targetElements: WeakRef<Element>[] = [];

// The highlight registry is tasked to clean up the highlights
// when a target element is removed from the DOM.
const highlightsRegistry = new FinalizationRegistry<Highlight>((highlight) => {
  // Remove the highlight
  highlight.destroy();

  // Clean up the `targetElements` from the empty ref
  let disposedRefIndex = -1;
  for (const [i, target] of targetElements.entries()) {
    if (!target.deref()) {
      disposedRefIndex = i;
      break;
    }
  }
  if (disposedRefIndex > -1) {
    targetElements.splice(disposedRefIndex, 1);
  }
});

const WINDOW_RESIZE_DEBOUNCE = 200;
let resizeTimeout: ReturnType<typeof setTimeout>;
let animationFrameId: ReturnType<typeof requestAnimationFrame>;
let isWindowResizing = false;

window.addEventListener('resize', () => {
  isWindowResizing = true;
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    const positions: [Highlight, DOMRect][] = [];

    // We perform the DOM read first to avoid thrashing.
    // All consecutive `getBoundingClientRect` should be practically free.
    forEachActiveHighlight((h, t) => {
      positions.push([h, t.getBoundingClientRect()]);
    });

    // We update the positions (DOM write).
    for (const [highlight, rect] of positions) {
      highlight.position(rect);
    }

    isWindowResizing = false;
  }, WINDOW_RESIZE_DEBOUNCE);
});

const resizeObserver = new ResizeObserver((entries) => {
  // Ignore events that are already handled by window.resize.
  if (isWindowResizing) {
    return;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(() => {
    const positions: [Highlight, DOMRect][] = [];

    // We perform the DOM read first to avoid thrashing.
    // All consecutive `getBoundingClientRect` should be practically free.
    for (const {target} of entries) {
      for (const highlight of activeHighlights.get(target) ?? []) {
        positions.push([highlight, target.getBoundingClientRect()]);
      }
    }

    // We update the positions (DOM write).
    for (const [highlight, rect] of positions) {
      highlight.position(rect);
    }
  });
});

// Clean up the references after `destroy` has been called.
highlightDestroyEvents.subscribe(([highlight]) => {
  forEachActiveHighlight((h, target) => {
    if (highlight !== h) {
      return;
    }

    const targetHighlights = activeHighlights.get(target);

    if (!targetHighlights) {
      return false;
    }

    const idx = targetHighlights.indexOf(highlight);
    if (idx > -1) {
      targetHighlights.splice(idx, 1);
      highlightsRegistry.unregister(h);

      // Determine if there are any other highlights that can be rendered.
      displayElementHighlights(target);
    }

    // In case there are no other highlights attached to that element,
    // remove the target element from the global vars.
    if (!targetHighlights.length) {
      activeHighlights.delete(target);

      const targetElsIdx = targetElements.findIndex((wr) => wr.deref() === target);
      if (targetElsIdx > -1) {
        targetElements.splice(targetElsIdx, 1);
      }
    }

    return false;
  });
});

/** Store the `Highlight` in the active highlights data structures. */
function storeHighlight(targetElement: Element, highlight: Highlight) {
  const currentHighlights = activeHighlights.get(targetElement) ?? [];
  currentHighlights.push(highlight);
  highlightsRegistry.register(targetElement, highlight, highlight);

  if (currentHighlights.length === 1) {
    activeHighlights.set(targetElement, currentHighlights);
    targetElements.push(new WeakRef(targetElement));
  }
}

/**
 * Highlight an element.
 *
 * @param targetElement Element that you want to highlight.
 * @param template Template of the highlight (i.e. highlight type).
 * @param props Props required for the labels, if applicable.
 * @returns A `Highlight` reference.
 */
export function highlightElement<T extends HighlightLabelDefinition = HighlightLabelDefinition>(
  targetElement: Element,
  template: HighlightTemplate<T>,
  props: HighlightLabelProps<T>,
): Highlight | null {
  const dir = findDirectiveAndHost(targetElement).directive;
  if (!dir) {
    return null;
  }

  const rect = getComponentRect(targetElement);
  if (!rect || rect.height === 0 || rect.width === 0) {
    // display nothing in case the component is not visible
    return null;
  }

  const {overlay, labels} = createOverlayWithLabels(template, props);
  const highlight = new Highlight(overlay, labels, template, highlightDestroyEvents);
  storeHighlight(targetElement, highlight);

  highlight.position(rect);
  displayElementHighlights(targetElement);

  // NOTE: Chrome V8 is optimized to unobserve elements
  // detached from the DOM that don't have any other
  // strong references in the code.
  resizeObserver.observe(targetElement);

  return highlight;
}

/** Remove all highlights of a given target element. */
export function removeElementHighlights(targetElement: Element) {
  const highlights = activeHighlights.get(targetElement);
  if (!highlights) {
    return;
  }

  // We are copying the array to avoid unwanted mutations/shifts
  // caused by the destroy sync event emitter during iteration.
  for (const h of [...highlights]) {
    h.destroy();
  }
}

/** Remove all active highlights. */
export function removeAllHighlights() {
  const forRemoval: Highlight[] = [];

  forEachActiveHighlight((h) => {
    forRemoval.push(h);
  });

  for (const h of forRemoval) {
    h.destroy();
  }
}

/** Remove all active highlights of the provided type. */
export function removeHighlightsByType(type: HighlightType) {
  const forRemoval: Highlight[] = [];

  forEachActiveHighlight((h) => {
    if (h.type === type) {
      forRemoval.push(h);
    }
  });

  for (const h of forRemoval) {
    h.destroy();
  }
}

/**
 * Iterate over all active highlights.
 *
 * Do NOT perform mutations during the iterations.
 */
function forEachActiveHighlight(cb: (h: Highlight, t: Element) => any) {
  for (const targetRef of targetElements) {
    const target = targetRef.deref();
    if (!target) {
      continue;
    }
    const highlights = activeHighlights.get(target);
    if (!highlights) {
      continue;
    }
    for (const h of highlights) {
      // Break the array, if the CB returns explicit false
      if (cb(h, target) === false) {
        return;
      }
    }
  }
}

/**
 * Determines the highlight with the highest priority and
 * renders it. The rest are hidden.
 */
function displayElementHighlights(targetElement: Element) {
  const highlights = activeHighlights.get(targetElement);
  if (!highlights || !highlights.length) {
    return;
  }

  const prioritizedHighlights = highlights.sort((a, b) => a.type - b.type);
  prioritizedHighlights[0].display();

  for (let i = 1; i < prioritizedHighlights.length; i++) {
    prioritizedHighlights[i].hide();
  }
}
