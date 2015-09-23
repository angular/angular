/**
 * @module
 * @description
 * Change detection enables data binding in Angular.
 */

export {
  ChangeDetectionStrategy,

  ExpressionChangedAfterItHasBeenCheckedException,
  ChangeDetectionError,

  ChangeDetector,
  Locals,
  ChangeDetectorRef,

  WrappedValue,
  SimpleChange,
  PipeTransform,
  PipeOnDestroy,
  IterableDiffers,
  IterableDiffer,
  IterableDifferFactory,
  KeyValueDiffers,
  KeyValueDiffer,
  KeyValueDifferFactory
} from './change_detection/change_detection';
