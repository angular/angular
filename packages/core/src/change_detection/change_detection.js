/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {DefaultIterableDifferFactory} from './differs/default_iterable_differ';
import {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ';
import {IterableDiffers} from './differs/iterable_differs';
import {KeyValueDiffers} from './differs/keyvalue_differs';
export {SimpleChange} from '../interface/simple_change';
export {devModeEqual} from '../util/comparison';
export {ChangeDetectorRef} from './change_detector_ref';
export {ChangeDetectionStrategy} from './constants';
export {
  DefaultIterableDiffer,
  DefaultIterableDifferFactory,
} from './differs/default_iterable_differ';
export {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ';
export {IterableDiffers} from './differs/iterable_differs';
export {KeyValueDiffers} from './differs/keyvalue_differs';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
const keyValDiff = [new DefaultKeyValueDifferFactory()];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
const iterableDiff = [new DefaultIterableDifferFactory()];
export const defaultIterableDiffers = new IterableDiffers(iterableDiff);
export const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
//# sourceMappingURL=change_detection.js.map
