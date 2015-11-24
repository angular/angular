import { IterableDiffers } from './differs/iterable_differs';
import { DefaultIterableDifferFactory } from './differs/default_iterable_differ';
import { KeyValueDiffers } from './differs/keyvalue_differs';
import { DefaultKeyValueDifferFactory } from './differs/default_keyvalue_differ';
import { CONST_EXPR } from 'angular2/src/facade/lang';
export { ASTWithSource, AST, AstTransformer, PropertyRead, LiteralArray, ImplicitReceiver } from './parser/ast';
export { Lexer } from './parser/lexer';
export { Parser } from './parser/parser';
export { Locals } from './parser/locals';
export { DehydratedException, ExpressionChangedAfterItHasBeenCheckedException, ChangeDetectionError } from './exceptions';
export { ChangeDetectorDefinition, DebugContext, ChangeDetectorGenConfig } from './interfaces';
export { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from './constants';
export { DynamicProtoChangeDetector } from './proto_change_detector';
export { JitProtoChangeDetector } from './jit_proto_change_detector';
export { BindingRecord, BindingTarget } from './binding_record';
export { DirectiveIndex, DirectiveRecord } from './directive_record';
export { DynamicChangeDetector } from './dynamic_change_detector';
export { ChangeDetectorRef } from './change_detector_ref';
export { IterableDiffers } from './differs/iterable_differs';
export { KeyValueDiffers } from './differs/keyvalue_differs';
export { WrappedValue, SimpleChange } from './change_detection_util';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff = CONST_EXPR([CONST_EXPR(new DefaultKeyValueDifferFactory())]);
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff = CONST_EXPR([CONST_EXPR(new DefaultIterableDifferFactory())]);
export const defaultIterableDiffers = CONST_EXPR(new IterableDiffers(iterableDiff));
export const defaultKeyValueDiffers = CONST_EXPR(new KeyValueDiffers(keyValDiff));
