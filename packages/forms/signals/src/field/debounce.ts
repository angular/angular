/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createMetadataKey, MetadataKey, type ComputedMetadataKey} from '../api/metadata';
import {Debouncer} from '../api/types';

/**
 * A private {@link MetadataKey} used to aggregate `debounce()` rules.
 *
 * This will pick the last `debounce()` rule on a field that is currently applied, if conditional.
 */
export const DEBOUNCER: ComputedMetadataKey<Debouncer<any> | undefined> = createMetadataKey();
