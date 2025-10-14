/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { IterableDiffers } from './differs/iterable_differs';
import { KeyValueDiffers } from './differs/keyvalue_differs';
export { SimpleChange, SimpleChanges } from '../interface/simple_change';
export { devModeEqual } from '../util/comparison';
export { ChangeDetectorRef } from './change_detector_ref';
export { ChangeDetectionStrategy } from './constants';
export { DefaultIterableDiffer, DefaultIterableDifferFactory, } from './differs/default_iterable_differ';
export { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
export { IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, IterableDiffers, NgIterable, TrackByFunction, } from './differs/iterable_differs';
export { KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers, } from './differs/keyvalue_differs';
export { PipeTransform } from './pipe_transform';
export declare const defaultIterableDiffers: IterableDiffers;
export declare const defaultKeyValueDiffers: KeyValueDiffers;
