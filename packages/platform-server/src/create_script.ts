/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵunwrapSafeValue as unwrapSafeValue, ɵSafeValue as SafeValue} from '@angular/core';

/**
 * Creates a script element with the given content and nonce.
 * @param doc The document to create the script element in.
 * @param textContent The content to be placed inside the script element.
 * @param nonce The nonce attribute to be added to the script element.
 * @returns The created script element.
 */
export function createScript(
  doc: Document,
  textContent: SafeValue,
  nonce: string | null,
): HTMLScriptElement {
  const script = doc.createElement('script');
  script.textContent = unwrapSafeValue(textContent);

  if (nonce) {
    script.setAttribute('nonce', nonce);
  }

  return script;
}
