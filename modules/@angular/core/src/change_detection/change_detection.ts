/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultIterableDifferFactory} from './differs/default_iterable_differ';
import {DefaultKeyValueDifferFactory, KeyValueChangeRecord} from './differs/default_keyvalue_differ';
import {IterableDifferFactory, IterableDiffers} from './differs/iterable_differs';
import {KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs';

export {SimpleChanges} from '../metadata/lifecycle_hooks';
export {SimpleChange, UNINITIALIZED, ValueUnwrapper, WrappedValue, devModeEqual, looseIdentical} from './change_detection_util';
export {ChangeDetectorRef} from './change_detector_ref';
export {ChangeDetectionStrategy, ChangeDetectorStatus, isDefaultChangeDetectionStrategy} from './constants';
export {CollectionChangeRecord, DefaultIterableDifferFactory} from './differs/default_iterable_differ';
export {DefaultIterableDiffer} from './differs/default_iterable_differ';
export {DefaultKeyValueDifferFactory, KeyValueChangeRecord} from './differs/default_keyvalue_differ';
export {IterableDiffer, IterableDifferFactory, IterableDiffers, TrackByFn} from './differs/iterable_differs';
export {KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers} from './differs/keyvalue_differs';
export {PipeTransform} from './pipe_transform';



/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff: KeyValueDifferFactory[] = [new DefaultKeyValueDifferFactory()];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff: IterableDifferFactory[] = [new DefaultIterableDifferFactory()];

export const defaultIterableDiffers = new IterableDiffers(iterableDiff);

export const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
