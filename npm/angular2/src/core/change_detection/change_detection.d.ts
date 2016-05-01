import { IterableDiffers, IterableDifferFactory } from './differs/iterable_differs';
import { KeyValueDiffers, KeyValueDifferFactory } from './differs/keyvalue_differs';
export { DefaultKeyValueDifferFactory, KeyValueChangeRecord } from './differs/default_keyvalue_differ';
export { DefaultIterableDifferFactory, CollectionChangeRecord } from './differs/default_iterable_differ';
export { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES, ChangeDetectorState, CHANGE_DETECTOR_STATE_VALUES, isDefaultChangeDetectionStrategy } from './constants';
export { ChangeDetectorRef } from './change_detector_ref';
export { IterableDiffers, IterableDiffer, IterableDifferFactory, TrackByFn } from './differs/iterable_differs';
export { KeyValueDiffers, KeyValueDiffer, KeyValueDifferFactory } from './differs/keyvalue_differs';
export { PipeTransform } from './pipe_transform';
export { WrappedValue, ValueUnwrapper, SimpleChange, devModeEqual, looseIdentical, uninitialized } from './change_detection_util';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
export declare const keyValDiff: KeyValueDifferFactory[];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export declare const iterableDiff: IterableDifferFactory[];
export declare const defaultIterableDiffers: IterableDiffers;
export declare const defaultKeyValueDiffers: KeyValueDiffers;
