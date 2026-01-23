/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Signal} from '@angular/core';
import {createMetadataKey, MetadataKey} from '../api/rules/metadata';
import {Debouncer} from '../api/types';

/**
 * A private {@link MetadataKey} used to aggregate `debounce()` rules.
 *
 * This will pick the last `debounce()` rule on a field that is currently applied, if conditional.
 */
export const DEBOUNCER: MetadataKey<
  Signal<Debouncer<any> | undefined> | undefined,
  Debouncer<any> | undefined,
  Debouncer<any> | undefined
> = createMetadataKey();
