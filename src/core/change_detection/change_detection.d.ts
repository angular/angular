import { IterableDiffers, IterableDifferFactory } from './differs/iterable_differs';
import { KeyValueDiffers, KeyValueDifferFactory } from './differs/keyvalue_differs';
export { ASTWithSource, AST, AstTransformer, PropertyRead, LiteralArray, ImplicitReceiver } from './parser/ast';
export { Lexer } from './parser/lexer';
export { Parser } from './parser/parser';
export { Locals } from './parser/locals';
export { DehydratedException, ExpressionChangedAfterItHasBeenCheckedException, ChangeDetectionError } from './exceptions';
export { ProtoChangeDetector, ChangeDetector, ChangeDispatcher, ChangeDetectorDefinition, DebugContext, ChangeDetectorGenConfig } from './interfaces';
export { ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES } from './constants';
export { DynamicProtoChangeDetector } from './proto_change_detector';
export { JitProtoChangeDetector } from './jit_proto_change_detector';
export { BindingRecord, BindingTarget } from './binding_record';
export { DirectiveIndex, DirectiveRecord } from './directive_record';
export { DynamicChangeDetector } from './dynamic_change_detector';
export { ChangeDetectorRef } from './change_detector_ref';
export { IterableDiffers, IterableDiffer, IterableDifferFactory } from './differs/iterable_differs';
export { KeyValueDiffers, KeyValueDiffer, KeyValueDifferFactory } from './differs/keyvalue_differs';
export { PipeTransform } from './pipe_transform';
export { WrappedValue, SimpleChange } from './change_detection_util';
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
