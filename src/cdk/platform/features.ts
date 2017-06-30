/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Cached result Set of input types support by the current browser. */
let supportedInputTypes: Set<string>;

/** Types of <input> that *might* be supported. */
const candidateInputTypes = [
  // `color` must come first. Chrome 56 shows a warning if we change the type to `color` after
  // first changing it to something else:
  // The specified value "" does not conform to the required format.
  // The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.
  'color',
  'button',
  'checkbox',
  'date',
  'datetime-local',
  'email',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
  'tel',
  'text',
  'time',
  'url',
  'week',
];

/** @returns The input types supported by this browser. */
export function getSupportedInputTypes(): Set<string> {
  // Result is cached.
  if (supportedInputTypes) {
    return supportedInputTypes;
  }

  // We can't check if an input type is not supported until we're on the browser, so say that
  // everything is supported when not on the browser. We don't use `Platform` here since it's
  // just a helper function and can't inject it.
  if (typeof document !== 'object' || !document) {
    supportedInputTypes = new Set(candidateInputTypes);
    return supportedInputTypes;
  }

  let featureTestInput = document.createElement('input');
  supportedInputTypes = new Set(candidateInputTypes.filter(value => {
    featureTestInput.setAttribute('type', value);
    return featureTestInput.type === value;
  }));

  return supportedInputTypes;
}
