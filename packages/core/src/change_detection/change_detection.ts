/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultIterableDifferFactory} from './differs/default_iterable_differ';
import {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ';
import {IterableDifferFactory, IterableDiffers} from './differs/iterable_differs';
import {KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs';

export {SimpleChange, SimpleChanges} from '../interface/simple_change';
export {devModeEqual} from '../util/comparison';
export {ChangeDetectorRef} from './change_detector_ref';
export {ChangeDetectionStrategy} from './constants';
export {DefaultIterableDiffer, DefaultIterableDifferFactory} from './differs/default_iterable_differ';
export {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ';
export {IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, IterableDiffers, NgIterable, TrackByFunction} from './differs/iterable_differs';
export {KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs';
export {PipeTransform} from './pipe_transform';



/**
 * Structural diffing for `Object`s and `Map`s.
 */
const keyValDiff: KeyValueDifferFactory[] = [new DefaultKeyValueDifferFactory()];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
const iterableDiff: IterableDifferFactory[] = [new DefaultIterableDifferFactory()];

export const defaultIterableDiffers = new IterableDiffers(iterableDiff);

export const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
