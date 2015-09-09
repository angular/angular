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
  PipeTransform,
  PipeOnDestroy,
  IterableDiffers,
  IterableDiffer,
  IterableDifferFactory,
  KeyValueDiffers,
  KeyValueDiffer,
  KeyValueDifferFactory,
  Lexer,
  Parser,
  ChangeDispatcher,
  BindingTarget,
  DirectiveIndex,
  DebugContext,
  ProtoChangeDetector
} from 'angular2/src/core/change_detection/change_detection';
export * from 'angular2/src/core/change_detection/parser/ast';
