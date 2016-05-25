import {IterableDiffers, IterableDifferFactory} from './differs/iterable_differs';
import {DefaultIterableDifferFactory} from './differs/default_iterable_differ';
import {KeyValueDiffers, KeyValueDifferFactory} from './differs/keyvalue_differs';
import {
  DefaultKeyValueDifferFactory,
  KeyValueChangeRecord
} from './differs/default_keyvalue_differ';

export {
  DefaultKeyValueDifferFactory,
  KeyValueChangeRecord
} from './differs/default_keyvalue_differ';
export {
  DefaultIterableDifferFactory,
  CollectionChangeRecord
} from './differs/default_iterable_differ';

export {
  ChangeDetectionStrategy,
  CHANGE_DETECTION_STRATEGY_VALUES,
  ChangeDetectorState,
  CHANGE_DETECTOR_STATE_VALUES,
  isDefaultChangeDetectionStrategy
} from './constants';
export {ChangeDetectorRef} from './change_detector_ref';
export {
  IterableDiffers,
  IterableDiffer,
  IterableDifferFactory,
  TrackByFn
} from './differs/iterable_differs';
export {KeyValueDiffers, KeyValueDiffer, KeyValueDifferFactory} from './differs/keyvalue_differs';
export {DefaultIterableDiffer} from './differs/default_iterable_differ';
export {PipeTransform} from './pipe_transform';

export {
  WrappedValue,
  ValueUnwrapper,
  SimpleChange,
  devModeEqual,
  looseIdentical,
  uninitialized
} from './change_detection_util';
export {SimpleChanges} from '../metadata/lifecycle_hooks';

/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff: KeyValueDifferFactory[] =
    /*@ts2dart_const*/[new DefaultKeyValueDifferFactory()];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff: IterableDifferFactory[] =
    /*@ts2dart_const*/[new DefaultIterableDifferFactory()];

export const defaultIterableDiffers = /*@ts2dart_const*/ new IterableDiffers(iterableDiff);

export const defaultKeyValueDiffers = /*@ts2dart_const*/ new KeyValueDiffers(keyValDiff);
