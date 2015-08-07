/**
 * @module
 * @description
 * Change detection enables data binding in Angular.
 */

export {
  CHECK_ONCE,
  CHECK_ALWAYS,
  DETACHED,
  CHECKED,
  ON_PUSH,
  DEFAULT,

  ExpressionChangedAfterItHasBeenCheckedException,
  ChangeDetectionError,

  ChangeDetector,
  Locals,
  ChangeDetectorRef,

  WrappedValue,
  PipeTransform,
  IterableDiffers,
  IterableDiffer,
  IterableDifferFactory,
  KeyValueDiffers,
  KeyValueDiffer,
  KeyValueDifferFactory,
  BasePipeTransform
} from 'angular2/src/change_detection/change_detection';
