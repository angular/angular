/**
 * @module
 * @public
 * @description
 * Change detection enables data binding in Angular.
 */

export {
  ASTWithSource, AST, AstTransformer, AccessMember, LiteralArray, ImplicitReceiver
} from './src/change_detection/parser/ast';

export {Lexer} from './src/change_detection/parser/lexer';
export {Parser} from './src/change_detection/parser/parser';
export {Locals} from './src/change_detection/parser/locals';

export {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError} from './src/change_detection/exceptions';
export {ProtoChangeDetector, ChangeDispatcher, ChangeDetector, ChangeDetection} from './src/change_detection/interfaces';
export {CHECK_ONCE, CHECK_ALWAYS, DETACHED, CHECKED, ON_PUSH, DEFAULT} from './src/change_detection/constants';
export {DynamicProtoChangeDetector, JitProtoChangeDetector} from './src/change_detection/proto_change_detector';
export {BindingRecord} from './src/change_detection/binding_record';
export {DirectiveIndex, DirectiveRecord} from './src/change_detection/directive_record';
export {DynamicChangeDetector} from './src/change_detection/dynamic_change_detector';
export {ChangeDetectorRef} from './src/change_detection/change_detector_ref';
export {PipeRegistry} from './src/change_detection/pipes/pipe_registry';
export {uninitialized} from './src/change_detection/change_detection_util';
export {NO_CHANGE, Pipe} from './src/change_detection/pipes/pipe';
export {
  defaultPipes, DynamicChangeDetection, JitChangeDetection, defaultPipeRegistry
} from './src/change_detection/change_detection';
