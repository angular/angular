import { IterableDiffers } from './differs/iterable_differs';
import { DefaultIterableDifferFactory } from './differs/default_iterable_differ';
import { KeyValueDiffers } from './differs/keyvalue_differs';
import { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
export { DefaultKeyValueDifferFactory, KeyValueChangeRecord } from './differs/default_keyvalue_differ';
export { DefaultIterableDifferFactory, CollectionChangeRecord } from './differs/default_iterable_differ';
export { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES, ChangeDetectorState, CHANGE_DETECTOR_STATE_VALUES, isDefaultChangeDetectionStrategy } from './constants';
export { ChangeDetectorRef } from './change_detector_ref';
export { IterableDiffers } from './differs/iterable_differs';
export { KeyValueDiffers } from './differs/keyvalue_differs';
export { WrappedValue, ValueUnwrapper, SimpleChange, devModeEqual, looseIdentical, uninitialized } from './change_detection_util';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff = 
/*@ts2dart_const*/ [new DefaultKeyValueDifferFactory()];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff = 
/*@ts2dart_const*/ [new DefaultIterableDifferFactory()];
export const defaultIterableDiffers = new IterableDiffers(iterableDiff);
export const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
