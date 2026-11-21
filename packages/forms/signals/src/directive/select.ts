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
 * @param onMutation Callback invoked when a relevant mutation of the `<option>`s is observed.
 * @param destroyRef `DestroyRef` whose destruction disconnects the observer.
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
 * Checks if a given mutation record is relevant for resyncing a `<select>`.
 * In general it's relevant if:
 * - Non comment nodes were added to / removed from the select
 * - The text of an option without a value attribute changed
 * - The value attribute of an option changed.
 *
 * @param mutation The mutation record to check.
 * @returns Whether the mutation is relevant for resyncing the `<select>`.
 */
function isRelevantSelectMutation(mutation: MutationRecord): boolean {
  // If the target is a comment it's not relevant.
  if (mutation.target instanceof Comment) {
    return false;
  }
  // Consider changes that may add / remove options.
  if (mutation.type === 'childList') {
    // If any non-comment nodes were added / removed it is relevant.
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
  // If the text of an option changed, it's only relevant if the option has no value attribute,
  // because only then is the text used as its value.
  if (mutation.type === 'characterData') {
    // The target is the text node, its parent the option.
    // Not handled: `<option><span>{{ x }}</span></option>`
    const parent = mutation.target.parentElement;
    return parent instanceof HTMLOptionElement && !parent.hasAttribute('value');
  }
  // If the value attribute of an option changed, it's relevant.
  if (mutation.type === 'attributes' && mutation.target instanceof HTMLOptionElement) {
    return true;
  }
  // Everything else is not relevant.
  return false;
}
