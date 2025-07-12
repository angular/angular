/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getDocument} from '../interfaces/document';
import {APP_ID} from '../../core';
import {Injector} from '../../di';

/**
 * Retrieves transfer state data from the DOM using the provided injector to get APP_ID.
 * This approach works by getting the APP_ID from the injector and then finding the
 * corresponding transfer state script tag.
 *
 * @param injector - The injector to use for getting APP_ID
 * @returns The transfer state data as an object, or empty object if not available
 */
export function getTransferState(injector: Injector): Record<string, unknown> {
  const doc = getDocument();

  const appId = injector.get(APP_ID);
  const scriptId = appId + '-state';
  const script = doc.getElementById(scriptId) as HTMLScriptElement;

  if (!script) {
    return {};
  }

  if (!script.textContent || script.textContent.trim() === '') {
    return {};
  }
  return JSON.parse(script.textContent) as Record<string, unknown>;
}
