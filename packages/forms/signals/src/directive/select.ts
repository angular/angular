/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {DestroyRef} from '@angular/core';

/**
 * Creates a `MutationObserver` to observe changes to the available `<option>`s for this select.
 *
 * @param select The native `<select>` element to observe.
 * @param lView The `LView` that contains the native form control.
 * @param tNode The `TNode` of the native form control.
 * @return The newly created `MutationObserver`.
 */
export function observeSelectMutations(
  select: HTMLSelectElement,
  onMutation: () => void,
  destroyRef: DestroyRef,
): void {
  if (typeof MutationObserver !== 'function') {
    // Observing mutations is best-effort.
    return;
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => isRelevantSelectMutation(m))) {
      onMutation();
    }
  });
  observer.observe(select, {
    attributes: true,
    attributeFilter: ['value'],
    // We watch the character data, because an `<option>` with no explicit `value` property set uses
    // its text content as its value.
    // (See https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/value)
    characterData: true,
    childList: true,
    subtree: true,
  });
  destroyRef.onDestroy(() => observer.disconnect());
}

/**
 * Checks if a given mutation record is relevant for resyncing a <select>.
 * In general its relevant if:
 * - Non comment content of the select changed
 * - The value attribute of an option changed.
 */
function isRelevantSelectMutation(mutation: MutationRecord) {
  // Consider changes that may add / remove options, or change their text content.
  if (mutation.type === 'childList' || mutation.type === 'characterData') {
    // If the target element is a comment it's not relevant.
    if (mutation.target instanceof Comment) {
      return false;
    }
    // Otherwise if any non-comment nodes were added / removed it is relevant.
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    for (const node of mutation.removedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    // Otherwise it's not relevant.
    return false;
  }
  // If the value attribute of an option changed, it's relevant.
  if (mutation.type === 'attributes' && mutation.target instanceof HTMLOptionElement) {
    return true;
  }
  // Everything else is not relevant.
  return false;
}
