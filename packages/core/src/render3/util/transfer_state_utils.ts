/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getDocument} from '../interfaces/document';
import {Injector} from '../../di';
import {isInternalHydrationTransferStateKey} from '../../hydration/utils';
import {APP_ID} from '../../application/application_tokens';
import {retrieveTransferredState} from '../../transfer_state';

/**
 * Retrieves transfer state data from the DOM using the provided injector to get APP_ID.
 * This approach works by getting the APP_ID from the injector and then finding the
 * corresponding transfer state script tag. Internal framework keys used for hydration
 * are stripped from the result.
 *
 * @param injector - The injector to use for getting APP_ID
 * @returns The transfer state data as an object, or empty object if not available
 */
export function getTransferState(injector: Injector): Record<string, unknown> {
  const doc = getDocument();
  const appId = injector.get(APP_ID);

  const transferState = retrieveTransferredState(doc, appId);

  // Strip internal keys
  const filteredEntries: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(transferState)) {
    if (!isInternalHydrationTransferStateKey(key)) {
      filteredEntries[key] = value;
    }
  }

  return filteredEntries;
}
