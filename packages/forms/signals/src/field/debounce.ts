/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AggregateMetadataKey, reducedMetadataKey} from '../api/metadata';
import {Debouncer} from '../api/types';

/**
 * A private {@link AggregateMetadataKey} used to aggregate `debounce()` rules.
 *
 * This will pick the last `debounce()` rule on a field that is currently applied, if conditional.
 */
export const DEBOUNCER: AggregateMetadataKey<
  Debouncer<any> | undefined,
  Debouncer<any>
> = reducedMetadataKey(
  (_, item) => item,
  () => undefined,
);
