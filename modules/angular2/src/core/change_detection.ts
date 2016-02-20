/**
 * @module
 * @description
 * Change detection enables data binding in Angular.
 */

export {
  ChangeDetectionStrategy,

  ExpressionChangedAfterItHasBeenCheckedException,
  ChangeDetectionError,

  ChangeDetectorRef,

  WrappedValue,
  SimpleChange,
  PipeTransform,
  IterableDiffers,
  IterableDiffer,
  IterableDifferFactory,
  KeyValueDiffers,
  KeyValueDiffer,
  KeyValueDifferFactory,
  CollectionChangeRecord,
  KeyValueChangeRecord,
  TrackByFn
} from './change_detection/change_detection';
