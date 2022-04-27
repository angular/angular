/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultIterableDifferFactory} from './differs/default_iterable_differ.js';
import {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ.js';
import {IterableDifferFactory, IterableDiffers} from './differs/iterable_differs.js';
import {KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs.js';

export {SimpleChange, SimpleChanges} from '../interface/simple_change.js';
export {devModeEqual} from '../util/comparison.js';
export {ChangeDetectorRef} from './change_detector_ref.js';
export {ChangeDetectionStrategy, ChangeDetectorStatus, isDefaultChangeDetectionStrategy} from './constants.js';
export {DefaultIterableDiffer, DefaultIterableDifferFactory} from './differs/default_iterable_differ.js';
export {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ.js';
export {IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, IterableDiffers, NgIterable, TrackByFunction} from './differs/iterable_differs.js';
export {KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs.js';
export {PipeTransform} from './pipe_transform.js';



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
